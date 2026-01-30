document.addEventListener('DOMContentLoaded', async () => {
    // Load user profile
    try {
        const response = await fetch('/api/user/profile');
        const user = await response.json();
        
        if (user && !user.error) {
            document.getElementById('profileName').textContent = user.full_name || user.username;
            document.getElementById('profileEmail').textContent = user.email;
            document.getElementById('fullName').value = user.full_name || '';
            document.getElementById('username').value = user.username;
            document.getElementById('email').value = user.email;
            
            // Set avatar initials
            const name = user.full_name || user.username;
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
            document.getElementById('avatarInitials').textContent = initials;
            
            // Show OAuth badge
            if (user.oauth_provider) {
                const badge = document.getElementById('oauthBadge');
                badge.textContent = `Connected with ${user.oauth_provider}`;
                badge.style.display = 'inline-block';
            }
            
            // Member since
            const memberSince = new Date(user.created_at).toLocaleDateString();
            document.getElementById('memberSince').textContent = memberSince;
        } else {
            // Not authenticated, redirect to login
            window.location.href = '/login';
        }
        
        // Load stats
        const historyResponse = await fetch('/api/history?limit=1000');
        const historyData = await historyResponse.json();
        const history = historyData.history || [];
        
        document.getElementById('totalHistory').textContent = history.length;
        document.getElementById('codeExecutions').textContent = history.filter(h => h.type === 'code').length;
        document.getElementById('testsRun').textContent = history.filter(h => h.type === 'test').length;
        
    } catch (error) {
        console.error('Error loading profile:', error);
        window.location.href = '/login';
    }
    
    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value;
            
            try {
                const response = await fetch('/api/user/profile', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ full_name: fullName })
                });
                
                if (response.ok) {
                    showNotification('Profile updated successfully!', 'success');
                    setTimeout(() => location.reload(), 1500);
                } else {
                    showNotification('Error updating profile', 'error');
                }
            } catch (error) {
                showNotification('Error updating profile', 'error');
            }
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to logout?')) {
                try {
                    await fetch('/auth/logout', { method: 'POST' });
                    window.location.href = '/login';
                } catch (error) {
                    console.error('Logout error:', error);
                    window.location.href = '/login';
                }
            }
        });
    }
    
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
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
});
