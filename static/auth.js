document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const passwordToggle = document.getElementById('passwordToggle');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Check for OAuth error in URL
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
        let errorMessage = 'Authentication failed';
        switch(error) {
            case 'access_denied':
                errorMessage = 'Access was denied. Please try again and allow access.';
                break;
            case 'no_email':
                errorMessage = 'Could not retrieve email from provider.';
                break;
            case 'account_creation_failed':
                errorMessage = 'Failed to create account. Please try again.';
                break;
            case 'auth_failed':
                errorMessage = 'Authentication failed. Please try again.';
                break;
            case 'github_api_failed':
                errorMessage = 'Failed to retrieve information from GitHub.';
                break;
        }
        showMessage(errorMessage, 'error');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Password visibility toggle
    if (passwordToggle) {
        passwordToggle.addEventListener('click', () => {
            const passwordInput = passwordToggle.closest('.input-wrapper').querySelector('input');
            const eyeIcon = passwordToggle.querySelector('.eye-icon');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
            } else {
                passwordInput.type = 'password';
                eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
            }
        });
    }

    // Password strength indicator for signup
    const passwordInput = document.getElementById('password');
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');

    if (passwordInput && strengthFill && strengthText) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const strength = calculatePasswordStrength(password);

            strengthFill.className = 'strength-fill ' + strength.class;
            strengthText.textContent = strength.text;
            strengthText.className = 'strength-text ' + strength.class;
        });
    }

    // Password match indicator for signup
    const confirmPasswordInput = document.getElementById('confirm_password');
    const matchText = document.getElementById('matchText');

    if (confirmPasswordInput && matchText) {
        confirmPasswordInput.addEventListener('input', () => {
            const password = document.getElementById('password').value;
            const confirmPassword = confirmPasswordInput.value;

            if (confirmPassword) {
                if (password === confirmPassword) {
                    matchText.textContent = 'Passwords match';
                    matchText.className = 'match';
                } else {
                    matchText.textContent = 'Passwords do not match';
                    matchText.className = 'no-match';
                }
            } else {
                matchText.textContent = '';
            }
        });
    }

    // Login form handler
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (!username || !password) {
                showMessage('Please fill in all fields', 'error');
                return;
            }

            showLoading(true);

            try {
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage('Login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1000);
                } else {
                    showMessage(data.error || 'Login failed', 'error');
                    showLoading(false);
                }
            } catch (error) {
                showMessage('An error occurred. Please try again.', 'error');
                showLoading(false);
            }
        });
    }

    // Signup form handler
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullname = document.getElementById('fullname').value;
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            const terms = document.getElementById('terms').checked;

            // Validation
            if (!fullname || !username || !email || !password) {
                showMessage('Please fill in all fields', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showMessage('Passwords do not match', 'error');
                return;
            }

            if (password.length < 6) {
                showMessage('Password must be at least 6 characters', 'error');
                return;
            }

            if (!terms) {
                showMessage('Please agree to the Terms and Conditions', 'error');
                return;
            }

            const strength = calculatePasswordStrength(password);
            if (strength.class === 'weak') {
                showMessage('Please choose a stronger password', 'error');
                return;
            }

            showLoading(true);

            try {
                const response = await fetch('/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullname, username, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage('Account created successfully! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1000);
                } else {
                    showMessage(data.error || 'Signup failed', 'error');
                    showLoading(false);
                }
            } catch (error) {
                showMessage('An error occurred. Please try again.', 'error');
                showLoading(false);
            }
        });
    }

    function calculatePasswordStrength(password) {
        let strength = 0;

        if (password.length >= 8) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;

        if (strength <= 2) {
            return { class: 'weak', text: 'Weak' };
        } else if (strength <= 3) {
            return { class: 'medium', text: 'Medium' };
        } else {
            return { class: 'strong', text: 'Strong' };
        }
    }

    function showLoading(show) {
        if (loadingOverlay) {
            if (show) {
                loadingOverlay.style.display = 'flex';
                // Disable form elements
                const form = loginForm || signupForm;
                if (form) {
                    const elements = form.querySelectorAll('input, button');
                    elements.forEach(el => el.disabled = true);
                }
            } else {
                loadingOverlay.style.display = 'none';
                // Re-enable form elements
                const form = loginForm || signupForm;
                if (form) {
                    const elements = form.querySelectorAll('input, button');
                    elements.forEach(el => el.disabled = false);
                }
            }
        }
    }

    function showMessage(message, type) {
        // Remove existing messages
        const existing = document.querySelector('.error-message, .success-message');
        if (existing) existing.remove();

        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
        messageDiv.textContent = message;

        const form = loginForm || signupForm;
        if (form) {
            form.insertBefore(messageDiv, form.firstChild);
        }

        if (type === 'success') {
            setTimeout(() => messageDiv.remove(), 3000);
        }
    }

    // Real-time form validation
    function addRealTimeValidation() {
        const inputs = document.querySelectorAll('.auth-form input[required]');

        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                if (input.value.trim() === '') {
                    input.style.borderColor = '#ef4444';
                } else {
                    input.style.borderColor = '';
                }
            });

            input.addEventListener('input', () => {
                if (input.value.trim() !== '') {
                    input.style.borderColor = '';
                }
            });
        });
    }

    // Initialize real-time validation
    addRealTimeValidation();
});
