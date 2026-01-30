document.addEventListener('DOMContentLoaded', () => {
    const codeEl = document.getElementById('code');
    const langSel = document.getElementById('langSelect');
    const filenameInput = document.getElementById('filename');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const runBtn = document.getElementById('runBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const expandBtn = document.getElementById('expandBtn');
    const result = document.getElementById('analysisContent');

    // Load settings
    const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
    
    // Apply settings
    if (settings.fontSize && codeEl) {
        codeEl.style.fontSize = settings.fontSize + 'px';
    }
    if (settings.fontFamily && codeEl) {
        codeEl.style.fontFamily = settings.fontFamily;
    }

    // Check for restored code
    const restoredCode = localStorage.getItem('restoredCode');
    if (restoredCode && codeEl) {
        try {
            const restored = JSON.parse(restoredCode);
            codeEl.value = restored.code;
            if (langSel) langSel.value = restored.language;
            localStorage.removeItem('restoredCode');
            showNotification('Code restored from history', 'success');
        } catch (e) {
            console.error('Error restoring code:', e);
        }
    }

    // Auto-save functionality
    let autoSaveTimer;
    if (codeEl && settings.autoSave !== false) {
        codeEl.addEventListener('input', () => {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                saveToLocalStorage();
            }, 2000);
        });
    }

    function saveToLocalStorage() {
        if (codeEl && langSel) {
            localStorage.setItem('lastCode', JSON.stringify({
                code: codeEl.value,
                language: langSel.value,
                timestamp: Date.now()
            }));
        }
    }

    // Load last code
    const lastCode = localStorage.getItem('lastCode');
    if (lastCode && codeEl && !codeEl.value) {
        try {
            const saved = JSON.parse(lastCode);
            const hoursSince = (Date.now() - saved.timestamp) / (1000 * 60 * 60);
            if (hoursSince < 24) { // Only restore if less than 24 hours old
                codeEl.value = saved.code;
                if (langSel) langSel.value = saved.language;
            }
        } catch (e) {
            console.error('Error loading saved code:', e);
        }
    }

    // Update filename placeholder based on language
    if (langSel && filenameInput) {
        langSel.addEventListener('change', () => {
            const extensions = {
                'javascript': 'filename.js',
                'python': 'filename.py',
                'java': 'Main.java',
                'cpp': 'main.cpp'
            };
            filenameInput.placeholder = extensions[langSel.value] || 'filename';
        });
    }

    // Notification system
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
            font-size: 14px;
            font-weight: 500;
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    async function saveToHistory(type, code, language, additionalData = {}) {
        try {
            const response = await fetch('/api/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: type,
                    language: language,
                    title: additionalData.title || `${type.charAt(0).toUpperCase() + type.slice(1)} - ${new Date().toLocaleString()}`,
                    code: code,
                    output: additionalData.output,
                    issues: additionalData.issues,
                    variables: additionalData.variables,
                    test_results: additionalData.testResults
                })
            });
            
            if (response.ok) {
                console.log('History saved to database');
            }
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }

    const setResult = (html) => {
      if (result) result.innerHTML = html;
    };

    async function analyzeCode() {
      const code = (codeEl && codeEl.value || "").trim();
      const language = (langSel && langSel.value) || "javascript";

      console.log("Analyze button clicked");
      console.log("Code length:", code.length);
      console.log("Language:", language);

      if (!code) {
        setResult('<span style="color: #fbbf24;">⚠️ Please enter some code first.</span>');
        return;
      }

      setResult('<span style="color: #60a5fa;">⏳ Analyzing your code...</span>');
      try {
        console.log("Sending request to /analyze");
        const res = await fetch("/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, language })
        });

        console.log("Response status:", res.status);

        if (!res.ok) {
          const text = await res.text();
          console.error("Server error:", text);
          setResult(`<span style="color: #ef4444;">❌ Server error (${res.status}): ${text}</span>`);
          return;
        }

        const data = await res.json();
        console.log("Response data:", data);
        
        if (!data || !Array.isArray(data.issues)) {
          console.error("Invalid response format:", data);
          setResult('<span style="color: #ef4444;">❌ Unexpected server response.</span>');
          return;
        }

        const formattedIssues = data.issues.map(issue => {
          if (issue.includes('✅')) {
            return `<span style="color: #10b981;">${issue}</span>`;
          } else {
            return `<span style="color: #fbbf24;">⚠️ ${issue}</span>`;
          }
        }).join('<br>');
        
        setResult(formattedIssues);
        
        // Save to history
        saveToHistory('analyze', code, language, {
          issues: data.issues,
          title: `Analysis - ${language}`
        });
        
        showNotification('Code analysis complete', 'success');
      } catch (err) {
        console.error("analyzeCode error:", err);
        setResult(`<span style="color: #ef4444;">❌ Error connecting to server: ${err.message}</span>`);
        showNotification('Analysis failed', 'error');
      }
    }

    async function runCode() {
      const code = (codeEl && codeEl.value || "").trim();
      const language = (langSel && langSel.value) || "javascript";

      if (!code) {
        setResult('<span style="color: #fbbf24;">⚠️ Please enter some code first.</span>');
        return;
      }

      setResult('<span style="color: #60a5fa;">⏳ Running code...</span>');
      try {
        const res = await fetch("/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, language })
        });

        if (!res.ok) {
          const text = await res.text();
          setResult(`<span style="color: #ef4444;">❌ Server error (${res.status}): ${text}</span>`);
          return;
        }

        const data = await res.json();
        const output = (data && data.output) || "No output";
        setResult(`<span style="color: #22d3ee; font-weight: 600;">Output:</span><br><span style="color: #e2e8f0;">${output}</span>`);
        
        // Save to history
        saveToHistory('code', code, language, {
          output: output,
          title: `Execution - ${language}`
        });
        
        showNotification('Code executed successfully', 'success');
      } catch (err) {
        console.error("runCode error:", err);
        setResult('<span style="color: #ef4444;">❌ Error running code.</span>');
        showNotification('Execution failed', 'error');
      }
    }

    function clearAll() {
      if (codeEl) codeEl.value = "";
      if (filenameInput) filenameInput.value = "";
      setResult('Press <span style="color: #22d3ee; font-weight: 600;">Analyze</span> or <span style="color: #22d3ee; font-weight: 600;">Run Code</span> to start.');
    }

    function copyOutput() {
      if (result) {
        const text = result.innerText;
        navigator.clipboard.writeText(text).then(() => {
          const originalText = copyBtn.innerHTML;
          copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';
          setTimeout(() => {
            copyBtn.innerHTML = originalText;
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy:', err);
        });
      }
    }

    function toggleExpand() {
      const outputSection = document.querySelector('.output-section');
      if (outputSection) {
        if (outputSection.style.maxHeight === 'none') {
          outputSection.style.maxHeight = '250px';
        } else {
          outputSection.style.maxHeight = 'none';
        }
      }
    }

    // Event listeners
    if (analyzeBtn) analyzeBtn.addEventListener('click', analyzeCode);
    if (runBtn) runBtn.addEventListener('click', runCode);
    if (clearBtn) clearBtn.addEventListener('click', clearAll);
    if (copyBtn) copyBtn.addEventListener('click', copyOutput);
    if (expandBtn) expandBtn.addEventListener('click', toggleExpand);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Enter to run code
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
      // Ctrl/Cmd + Shift + A to analyze
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        analyzeCode();
      }
    });

    // ===== DEBUGGER FUNCTIONALITY =====
    const debugTabs = document.querySelectorAll('.debug-tab');
    const debugPanels = document.querySelectorAll('.debug-panel');
    const debugBtn = document.getElementById('debugBtn');
    const stepBtn = document.getElementById('stepBtn');
    const stopDebugBtn = document.getElementById('stopDebugBtn');
    const addBreakpointBtn = document.getElementById('addBreakpointBtn');
    const breakpointLine = document.getElementById('breakpointLine');
    const breakpointsList = document.getElementById('breakpointsList');
    const consoleOutput = document.getElementById('consoleOutput');
    const consoleInput = document.getElementById('consoleInput');
    const evalBtn = document.getElementById('evalBtn');
    const clearConsoleBtn = document.getElementById('clearConsoleBtn');

    let breakpoints = [];
    let isDebugging = false;

    // Tab switching
    debugTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            debugTabs.forEach(t => t.classList.remove('active'));
            debugPanels.forEach(p => p.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${targetTab}-panel`).classList.add('active');
        });
    });

    // Add breakpoint
    if (addBreakpointBtn) {
        addBreakpointBtn.addEventListener('click', () => {
            const line = parseInt(breakpointLine.value);
            if (line && line > 0 && !breakpoints.includes(line)) {
                breakpoints.push(line);
                updateBreakpointsList();
                breakpointLine.value = '';
            }
        });
    }

    // Update breakpoints list
    function updateBreakpointsList() {
        if (!breakpointsList) return;
        
        if (breakpoints.length === 0) {
            breakpointsList.innerHTML = '<div class="empty-state">No breakpoints set</div>';
            return;
        }

        breakpointsList.innerHTML = breakpoints.sort((a, b) => a - b).map(line => `
            <div class="breakpoint-item">
                <span class="breakpoint-line">Line ${line}</span>
                <button class="remove-breakpoint" onclick="removeBreakpoint(${line})">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    // Remove breakpoint (global function for onclick)
    window.removeBreakpoint = function(line) {
        breakpoints = breakpoints.filter(bp => bp !== line);
        updateBreakpointsList();
    };

    // Start debugging
    if (debugBtn) {
        debugBtn.addEventListener('click', async () => {
            const code = (codeEl && codeEl.value || "").trim();
            const language = (langSel && langSel.value) || "javascript";

            if (!code) {
                addConsoleMessage('⚠️ Please enter some code first.', 'error');
                return;
            }

            isDebugging = true;
            debugBtn.disabled = true;
            stepBtn.disabled = false;
            stopDebugBtn.disabled = false;

            // Clear previous console output
            clearConsole();

            // Add session header with timestamp
            const timestamp = new Date().toLocaleTimeString();
            addConsoleMessage(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'info');
            addConsoleMessage(`🐛 New Debugging Session - ${timestamp}`, 'info');
            addConsoleMessage(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`, 'info');
            addConsoleMessage(`Language: ${language}`, 'info');
            addConsoleMessage('Analyzing code...', 'info');
            
            try {
                // Call debug endpoint
                const res = await fetch("/debug", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                        code, 
                        language,
                        breakpoints: breakpoints 
                    })
                });

                if (!res.ok) {
                    const text = await res.text();
                    addConsoleMessage(`❌ Server error (${res.status}): ${text}`, 'error');
                    stopDebugging();
                    return;
                }

                const debugData = await res.json();
                console.log('Debug data:', debugData);

                // Display errors if any
                if (debugData.errors && debugData.errors.length > 0) {
                    debugData.errors.forEach(err => {
                        addConsoleMessage(`❌ ${err}`, 'error');
                    });
                }

                // Display output
                if (debugData.output) {
                    addConsoleMessage('📤 Program output:', 'info');
                    addConsoleMessage(debugData.output, 'success');
                }

                // Show variables
                const variablesList = document.getElementById('variablesList');
                const debugInfo = document.querySelector('#variables-panel .debug-info');
                
                if (debugInfo) debugInfo.style.display = 'none';
                
                if (variablesList) {
                    if (debugData.variables && debugData.variables.length > 0) {
                        variablesList.innerHTML = debugData.variables.map(v => `
                            <div class="variable-item">
                                <span class="variable-name">${v.name}</span>
                                <span class="variable-value">${v.value} <span style="color: var(--text-muted); font-size: 11px;">(${v.type})</span></span>
                            </div>
                        `).join('');
                        addConsoleMessage(`✓ Found ${debugData.variables.length} variable(s)`, 'success');
                    } else {
                        variablesList.innerHTML = '<div class="empty-state">No variables found</div>';
                        addConsoleMessage('No variables detected in code', 'info');
                    }
                }

                // Show call stack
                const callstackList = document.getElementById('callstackList');
                const callstackInfo = document.querySelector('#callstack-panel .debug-info');
                
                if (callstackInfo) callstackInfo.style.display = 'none';
                
                if (callstackList) {
                    if (debugData.callStack && debugData.callStack.length > 0) {
                        callstackList.innerHTML = debugData.callStack.map(frame => `
                            <div class="callstack-item">${frame}</div>
                        `).join('');
                    } else {
                        callstackList.innerHTML = '<div class="callstack-item">at main (line 1)</div>';
                    }
                }

                addConsoleMessage('✓ Debugging complete', 'success');
                
            } catch (err) {
                console.error("Debug error:", err);
                addConsoleMessage(`❌ Error: ${err.message}`, 'error');
                stopDebugging();
            }
        });
    }

    // Helper function to stop debugging
    function stopDebugging() {
        isDebugging = false;
        debugBtn.disabled = false;
        stepBtn.disabled = true;
        stopDebugBtn.disabled = true;
    }

    // Step debugging
    if (stepBtn) {
        stepBtn.addEventListener('click', () => {
            if (isDebugging) {
                addConsoleMessage('➡️ Step executed', 'info');
            }
        });
    }

    // Stop debugging
    if (stopDebugBtn) {
        stopDebugBtn.addEventListener('click', () => {
            stopDebugging();
            addConsoleMessage('🛑 Debugging session stopped', 'info');

            // Reset panels
            const variablesList = document.getElementById('variablesList');
            const callstackList = document.getElementById('callstackList');
            const debugInfos = document.querySelectorAll('.debug-info');
            
            debugInfos.forEach(info => info.style.display = 'block');
            if (variablesList) variablesList.innerHTML = '';
            if (callstackList) callstackList.innerHTML = '';
        });
    }

    // Console evaluation
    if (evalBtn && consoleInput) {
        const evaluateExpression = () => {
            const expr = consoleInput.value.trim();
            if (!expr) return;

            addConsoleMessage(`> ${expr}`, 'info');
            
            try {
                // Simple evaluation simulation
                if (expr.includes('breakpoints')) {
                    addConsoleMessage(`[${breakpoints.join(', ')}]`, 'success');
                } else if (expr.includes('code')) {
                    addConsoleMessage(`"${codeEl.value.substring(0, 50)}..."`, 'success');
                } else {
                    addConsoleMessage('Evaluation not available in this context', 'error');
                }
            } catch (err) {
                addConsoleMessage(`Error: ${err.message}`, 'error');
            }

            consoleInput.value = '';
        };

        evalBtn.addEventListener('click', evaluateExpression);
        consoleInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                evaluateExpression();
            }
        });
    }

    // Clear console
    function clearConsole() {
        if (!consoleOutput) return;
        consoleOutput.innerHTML = '';
    }

    // Clear console button
    if (clearConsoleBtn) {
        clearConsoleBtn.addEventListener('click', () => {
            clearConsole();
            addConsoleMessage('Console cleared', 'info');
        });
    }

    // Add console message
    function addConsoleMessage(message, type = 'info') {
        if (!consoleOutput) return;

        const iconMap = {
            'info': 'ℹ',
            'error': '✖',
            'success': '✓'
        };

        const line = document.createElement('div');
        line.className = `console-line console-${type}`;
        line.innerHTML = `
            <span class="console-icon">${iconMap[type] || 'ℹ'}</span>
            <span>${message}</span>
        `;
        
        consoleOutput.appendChild(line);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
});
