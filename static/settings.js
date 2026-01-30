document.addEventListener('DOMContentLoaded', () => {
    const settingsNavItems = document.querySelectorAll('.settings-nav-item');
    const settingsSections = document.querySelectorAll('.settings-section');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const resetSettingsBtn = document.getElementById('resetSettingsBtn');

    // Load settings from localStorage
    let settings = JSON.parse(localStorage.getItem('appSettings') || '{}');

    // Default settings
    const defaultSettings = {
        fontSize: '14',
        fontFamily: 'Fira Code',
        tabSize: '4',
        autoSave: true,
        lineNumbers: true,
        theme: 'dark',
        accentColor: 'cyan',
        animations: true,
        defaultLang: 'python',
        timeout: '10',
        autoRun: true,
        clearOutput: true
    };

    // Merge with defaults
    settings = { ...defaultSettings, ...settings };

    // Navigation
    settingsNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            
            settingsNavItems.forEach(nav => nav.classList.remove('active'));
            settingsSections.forEach(sec => sec.classList.remove('active'));
            
            item.classList.add('active');
            document.getElementById(`${section}-section`).classList.add('active');
        });
    });

    // Load settings into UI
    function loadSettings() {
        // Editor settings
        const fontSize = document.getElementById('fontSize');
        const fontFamily = document.getElementById('fontFamily');
        const tabSize = document.getElementById('tabSize');
        const autoSave = document.getElementById('autoSave');
        const lineNumbers = document.getElementById('lineNumbers');

        if (fontSize) fontSize.value = settings.fontSize;
        if (fontFamily) fontFamily.value = settings.fontFamily;
        if (tabSize) tabSize.value = settings.tabSize;
        if (autoSave) autoSave.checked = settings.autoSave;
        if (lineNumbers) lineNumbers.checked = settings.lineNumbers;

        // Appearance settings
        const animations = document.getElementById('animations');
        if (animations) animations.checked = settings.animations;

        // Theme
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.theme === settings.theme) {
                card.classList.add('active');
            }
        });

        // Accent color
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('active');
            if (option.dataset.color === settings.accentColor) {
                option.classList.add('active');
            }
        });

        // Execution settings
        const defaultLang = document.getElementById('defaultLang');
        const timeout = document.getElementById('timeout');
        const autoRun = document.getElementById('autoRun');
        const clearOutput = document.getElementById('clearOutput');

        if (defaultLang) defaultLang.value = settings.defaultLang;
        if (timeout) timeout.value = settings.timeout;
        if (autoRun) autoRun.checked = settings.autoRun;
        if (clearOutput) clearOutput.checked = settings.clearOutput;
    }

    // Theme selection
    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            settings.theme = card.dataset.theme;
        });
    });

    // Color selection
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.color-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            settings.accentColor = option.dataset.color;
            applyAccentColor(option.dataset.color);
        });
    });

    function applyAccentColor(color) {
        const colors = {
            cyan: '#22d3ee',
            blue: '#3b82f6',
            purple: '#a855f7',
            green: '#10b981',
            orange: '#f59e0b'
        };
        
        if (colors[color]) {
            document.documentElement.style.setProperty('--accent-cyan', colors[color]);
        }
    }

    // Save settings
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            // Collect all settings
            const fontSize = document.getElementById('fontSize');
            const fontFamily = document.getElementById('fontFamily');
            const tabSize = document.getElementById('tabSize');
            const autoSave = document.getElementById('autoSave');
            const lineNumbers = document.getElementById('lineNumbers');
            const animations = document.getElementById('animations');
            const defaultLang = document.getElementById('defaultLang');
            const timeout = document.getElementById('timeout');
            const autoRun = document.getElementById('autoRun');
            const clearOutput = document.getElementById('clearOutput');

            settings = {
                fontSize: fontSize ? fontSize.value : settings.fontSize,
                fontFamily: fontFamily ? fontFamily.value : settings.fontFamily,
                tabSize: tabSize ? tabSize.value : settings.tabSize,
                autoSave: autoSave ? autoSave.checked : settings.autoSave,
                lineNumbers: lineNumbers ? lineNumbers.checked : settings.lineNumbers,
                theme: settings.theme,
                accentColor: settings.accentColor,
                animations: animations ? animations.checked : settings.animations,
                defaultLang: defaultLang ? defaultLang.value : settings.defaultLang,
                timeout: timeout ? timeout.value : settings.timeout,
                autoRun: autoRun ? autoRun.checked : settings.autoRun,
                clearOutput: clearOutput ? clearOutput.checked : settings.clearOutput
            };

            localStorage.setItem('appSettings', JSON.stringify(settings));
            
            // Show success message
            const originalText = saveSettingsBtn.innerHTML;
            saveSettingsBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                Saved!
            `;
            saveSettingsBtn.disabled = true;

            setTimeout(() => {
                saveSettingsBtn.innerHTML = originalText;
                saveSettingsBtn.disabled = false;
            }, 2000);
        });
    }

    // Reset settings
    if (resetSettingsBtn) {
        resetSettingsBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to default?')) {
                settings = { ...defaultSettings };
                localStorage.setItem('appSettings', JSON.stringify(settings));
                loadSettings();
                applyAccentColor(settings.accentColor);
                
                alert('Settings have been reset to default values.');
            }
        });
    }

    // Initial load
    loadSettings();
    applyAccentColor(settings.accentColor);
});
