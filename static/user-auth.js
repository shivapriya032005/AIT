// User authentication UI handler
document.addEventListener('DOMContentLoaded', async () => {
    await loadUserProfile();
});

async function loadUserProfile() {
    try {
        const response = await fetch('/api/user/profile');
        const user = await response.json();
        
        const sidebarFooter = document.querySelector('.sidebar-footer');
        if (!sidebarFooter) return;
        
        if (response.ok && user && user.username !== 'guest') {
            // User is logged in
            displayLoggedInUser(user, sidebarFooter);
        } else {
            // User is not logged in (or is guest)
            displayLoginButtons(sidebarFooter);
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        // Show login buttons on error
        const sidebarFooter = document.querySelector('.sidebar-footer');
        if (sidebarFooter) {
            displayLoginButtons(sidebarFooter);
        }
    }
}

function displayLoggedInUser(user, container) {
    const avatarInitial = user.full_name ? user.full_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase();
    const displayName = user.full_name || user.username;
    
    container.innerHTML = `
        <div class="user-profile">
            <div class="user-avatar" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">${avatarInitial}</div>
            <div class="user-info">
                <div class="user-name">${displayName}</div>
                <div class="user-email">${user.email}</div>
            </div>
        </div>
        <button class="btn-logout" onclick="handleLogout()" title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span>Logout</span>
        </button>
    `;
}

function displayLoginButtons(container) {
    container.innerHTML = `
        <div class="auth-buttons">
            <a href="/login" class="btn-login">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"></path>
                    <polyline points="10 17 15 12 10 7"></polyline>
                    <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
                <span>Login</span>
            </a>
            <a href="/signup" class="btn-signup">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                    <line x1="20" y1="8" x2="20" y2="14"></line>
                    <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                <span>Sign Up</span>
            </a>
        </div>
    `;
}

async function handleLogout() {
    try {
        const response = await fetch('/auth/logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
            // Redirect to login page
            window.location.href = '/login';
        } else {
            console.error('Logout failed');
        }
    } catch (error) {
        console.error('Error during logout:', error);
    }
}
