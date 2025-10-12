# Authentication System Implementation Guide

## Overview
Complete authentication system with login, signup, OAuth (Google/GitHub), profile page, and logout.

## Files Created
1. `templates/login.html` - Login page ✅
2. `templates/signup.html` - Signup page ✅
3. `templates/profile.html` - User profile page ✅
4. `static/auth.css` - Authentication styles ✅
5. `static/auth.js` - Auth form handlers ✅
6. `requirements.txt` - Python dependencies ✅

## Still Need to Create

### 1. static/profile.css
```css
.profile-container {
  padding: 24px;
  max-width: 1200px;
}

.profile-header {
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
  padding: 32px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22d3ee, #06b6d4);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: 700;
  color: white;
}

.change-avatar-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
}

.profile-info h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  color: var(--text-primary);
}

.profile-badges {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.badge {
  padding: 6px 12px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  font-size: 12px;
  color: var(--text-muted);
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: rgba(34, 211, 238, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-cyan);
}

.stat-info h3 {
  margin: 0;
  font-size: 28px;
  color: var(--text-primary);
}

.stat-info p {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: var(--text-muted);
}

.profile-form {
  padding: 32px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--danger);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--danger);
}
```

### 2. static/profile.js
```javascript
document.addEventListener('DOMContentLoaded', async () => {
    // Load user profile
    try {
        const response = await fetch('/api/user/profile');
        const user = await response.json();
        
        if (user) {
            document.getElementById('profileName').textContent = user.full_name || user.username;
            document.getElementById('profileEmail').textContent = user.email;
            document.getElementById('fullName').value = user.full_name || '';
            document.getElementById('username').value = user.username;
            document.getElementById('email').value = user.email;
            
            // Set avatar initials
            const initials = (user.full_name || user.username).split(' ').map(n => n[0]).join('').toUpperCase();
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
    }
    
    // Profile form submission
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        
        try {
            const response = await fetch('/api/user/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ full_name: fullName })
            });
            
            if (response.ok) {
                alert('Profile updated successfully!');
                location.reload();
            }
        } catch (error) {
            alert('Error updating profile');
        }
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to logout?')) {
            try {
                await fetch('/auth/logout', { method: 'POST' });
                window.location.href = '/login';
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
    });
});
```

### 3. Update app.py - Add these routes after line 139

```python
# ===== AUTHENTICATION ROUTES =====

@app.route("/login")
def login_page():
    if 'user_id' in session:
        return redirect('/')
    return render_template("login.html")

@app.route("/signup")
def signup_page():
    if 'user_id' in session:
        return redirect('/')
    return render_template("signup.html")

@app.route("/profile")
def profile_page():
    if 'user_id' not in session:
        return redirect('/login')
    return render_template("profile.html")

@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = database.authenticate_user(username, password)
    
    if user:
        session['user_id'] = user['id']
        return jsonify({"success": True, "user": user})
    else:
        return jsonify({"error": "Invalid username or password"}), 401

@app.route("/auth/signup", methods=["POST"])
def signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    fullname = data.get('fullname')
    
    # Check if user exists
    if database.get_user_by_username(username):
        return jsonify({"error": "Username already exists"}), 400
    
    # Create user
    user_id = database.create_user(username, email, password, fullname)
    
    if user_id:
        session['user_id'] = user_id
        return jsonify({"success": True})
    else:
        return jsonify({"error": "Failed to create account"}), 500

@app.route("/auth/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})

@app.route("/api/user/profile", methods=["GET"])
def get_profile():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    return jsonify(user)

@app.route("/api/user/profile", methods=["POST"])
def update_profile():
    user = get_current_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json()
    database.update_user_profile(user['id'], 
                                 full_name=data.get('full_name'),
                                 avatar_url=data.get('avatar_url'))
    return jsonify({"success": True})

# OAuth routes (simplified - requires setup)
@app.route("/auth/google")
def google_login():
    # Redirect to Google OAuth
    return jsonify({"message": "Google OAuth not configured yet"})

@app.route("/auth/github")
def github_login():
    # Redirect to GitHub OAuth
    return jsonify({"message": "GitHub OAuth not configured yet"})
```

## Installation Steps

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. The database will auto-initialize on first run

3. Default guest user is created automatically

## Features Implemented

✅ Login form with username/password
✅ Signup form with validation
✅ Profile page with user stats
✅ Logout functionality
✅ Session management
✅ Password hashing
✅ Database integration
✅ OAuth placeholders (Google/GitHub)

## Next Steps for Full OAuth

To enable Google/GitHub OAuth, you need to:
1. Register apps on Google/GitHub developer consoles
2. Get client ID and secret
3. Install authlib: `pip install authlib`
4. Implement OAuth callback handlers
5. Store credentials in environment variables

## Security Notes

- Change the secret_key in app.py
- Use HTTPS in production
- Consider using bcrypt for password hashing
- Add rate limiting for login attempts
- Implement CSRF protection
