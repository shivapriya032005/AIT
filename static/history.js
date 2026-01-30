document.addEventListener('DOMContentLoaded', () => {
    const historyList = document.getElementById('historyList');
    const filterType = document.getElementById('filterType');
    const filterLang = document.getElementById('filterLang');
    const searchInput = document.getElementById('searchInput');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');

    let history = [];

    // Load history from database
    async function loadHistory() {
        try {
            const typeFilter = filterType && filterType.value !== 'all' ? filterType.value : null;
            const langFilter = filterLang && filterLang.value !== 'all' ? filterLang.value : null;
            
            let url = '/api/history?limit=50';
            if (typeFilter) url += `&type=${typeFilter}`;
            if (langFilter) url += `&language=${langFilter}`;
            
            const response = await fetch(url);
            const data = await response.json();
            history = data.history || [];
            
            // Convert created_at to timestamp for compatibility
            history.forEach(item => {
                item.timestamp = new Date(item.created_at).getTime();
            });
            
            renderHistory();
        } catch (error) {
            console.error('Error loading history:', error);
            showEmptyState();
        }
    }

    function renderHistory() {
        if (!historyList) return;

        let filtered = history;

        // Filter by type
        if (filterType && filterType.value !== 'all') {
            filtered = filtered.filter(item => item.type === filterType.value);
        }

        // Filter by language
        if (filterLang && filterLang.value !== 'all') {
            filtered = filtered.filter(item => item.language === filterLang.value);
        }

        // Search filter
        if (searchInput && searchInput.value.trim()) {
            const search = searchInput.value.toLowerCase();
            filtered = filtered.filter(item => 
                item.title.toLowerCase().includes(search) ||
                item.code.toLowerCase().includes(search)
            );
        }

        // Sort by timestamp (newest first)
        filtered.sort((a, b) => b.timestamp - a.timestamp);

        if (filtered.length === 0) {
            historyList.innerHTML = `
                <div class="empty-history">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <h3>No history found</h3>
                    <p>Your code execution history will appear here</p>
                </div>
            `;
            return;
        }

        historyList.innerHTML = filtered.map(item => {
            const icon = getTypeIcon(item.type);
            const timeAgo = getTimeAgo(item.timestamp);
            
            return `
                <div class="history-item ${item.type}" data-id="${item.id}">
                    <div class="history-header">
                        <div class="history-title">
                            <div class="history-icon">${icon}</div>
                            <div class="history-info">
                                <h3>${item.title}</h3>
                                <p>${timeAgo}</p>
                            </div>
                        </div>
                        <div class="history-meta">
                            <span class="history-badge ${item.language}">${item.language}</span>
                            <span>${getTypeLabel(item.type)}</span>
                        </div>
                    </div>
                    <div class="history-content">
                        <div class="history-code">${escapeHtml(item.code)}</div>
                        ${getItemDetails(item)}
                        <div class="history-actions">
                            <button class="history-btn" onclick="restoreCode('${item.id}')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="23 4 23 10 17 10"></polyline>
                                    <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"></path>
                                </svg>
                                Restore
                            </button>
                            <button class="history-btn" onclick="copyCode('${item.id}')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                                </svg>
                                Copy
                            </button>
                            <button class="history-btn delete" onclick="deleteItem('${item.id}')">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function getTypeIcon(type) {
        const icons = {
            code: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>',
            analyze: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>',
            debug: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
            test: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path></svg>'
        };
        return icons[type] || icons.code;
    }

    function getTypeLabel(type) {
        const labels = {
            code: 'Execution',
            analyze: 'Analysis',
            debug: 'Debug',
            test: 'Test'
        };
        return labels[type] || type;
    }

    function getItemDetails(item) {
        if (item.output) {
            return `<div style="margin-top: 8px; font-size: 12px; color: var(--text-muted);">Output: ${escapeHtml(item.output)}</div>`;
        }
        if (item.issues) {
            return `<div style="margin-top: 8px; font-size: 12px; color: var(--text-muted);">Issues found: ${item.issues.length}</div>`;
        }
        if (item.variables) {
            return `<div style="margin-top: 8px; font-size: 12px; color: var(--text-muted);">Variables: ${item.variables.join(', ')}</div>`;
        }
        if (item.testResults) {
            return `<div style="margin-top: 8px; font-size: 12px; color: var(--text-muted);">Tests: ${item.testResults.passed} passed, ${item.testResults.failed} failed</div>`;
        }
        return '';
    }

    function getTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        return new Date(timestamp).toLocaleDateString();
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function showEmptyState() {
        if (historyList) {
            historyList.innerHTML = `
                <div class="empty-history">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <h3>No history found</h3>
                    <p>Your code execution history will appear here</p>
                </div>
            `;
        }
    }

    // Global functions for inline handlers
    window.restoreCode = function(id) {
        const item = history.find(h => h.id == id);
        if (item) {
            localStorage.setItem('restoredCode', JSON.stringify({
                code: item.code,
                language: item.language
            }));
            window.location.href = '/';
        }
    };

    window.copyCode = function(id) {
        const item = history.find(h => h.id == id);
        if (item) {
            navigator.clipboard.writeText(item.code).then(() => {
                alert('Code copied to clipboard!');
            });
        }
    };

    window.deleteItem = async function(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            try {
                const response = await fetch(`/api/history/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    loadHistory();
                }
            } catch (error) {
                console.error('Error deleting item:', error);
            }
        }
    };

    // Event listeners
    if (filterType) filterType.addEventListener('change', loadHistory);
    if (filterLang) filterLang.addEventListener('change', loadHistory);
    if (searchInput) searchInput.addEventListener('input', renderHistory);

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to clear all history? This cannot be undone.')) {
                try {
                    const response = await fetch('/api/history/clear', {
                        method: 'POST'
                    });
                    if (response.ok) {
                        history = [];
                        renderHistory();
                    }
                } catch (error) {
                    console.error('Error clearing history:', error);
                }
            }
        });
    }

    // Initial load
    loadHistory();
});
