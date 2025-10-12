# Debug Steps - Google OAuth "Guest User" Issue

## Problem
After Google authentication, you're being logged in as "Guest User" instead of your Google account.

## What I've Fixed

### 1. **Added Extensive Logging** (`app.py`)
The OAuth callback now logs every step:
- Token reception
- User info retrieval
- User creation/retrieval
- Session setting

### 2. **Fixed Session Configuration** (`app.py`)
```python
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours
session.permanent = True  # In callback
```

### 3. **Improved Database Error Handling** (`database.py`)
Added comprehensive logging in `get_or_create_oauth_user()`

### 4. **Created Debug Tools**
- `/debug` - Visual debug page showing session and user data
- `/debug/session` - JSON endpoint for session data

## How to Debug

### Step 1: Restart Flask Server
```bash
python app.py
```

### Step 2: Clear Browser Data
1. Open browser DevTools (F12)
2. Go to Application/Storage tab
3. Clear cookies for localhost:5000
4. Clear session storage

### Step 3: Try Google Login Again
1. Go to `http://127.0.0.1:5000/login`
2. Click "Continue with Google"
3. Complete Google authentication
4. **Watch the Flask console output carefully**

### Step 4: Check Debug Page
After login, visit: `http://127.0.0.1:5000/debug`

This will show:
- Current session data
- User ID in session
- Current user profile

## What to Look For in Console

### ✅ **Successful Login** (should see):
```
=== Google OAuth Callback Started ===
Token received: True
User info received: {'email': 'your@email.com', 'name': '...', ...}
Email: your@email.com, Name: Your Name, Google ID: 123456789
Creating/getting user with username: your_email_com
Creating new OAuth user: your_email_com, your@email.com
Successfully created user with ID: 2
User object returned: {'id': 2, 'username': 'your_email_com', ...}
✓ User logged in successfully: your_email_com (ID: 2)
✓ Session user_id set to: 2
```

### ❌ **Failed Login** (might see):
```
!!! Google OAuth callback error: ...
[Error traceback]
```

## Common Issues & Solutions

### Issue 1: "Token received: False" or Token Error
**Cause:** OAuth configuration problem

**Solution:**
1. Check `oauth_config.py` has correct credentials
2. Verify redirect URI in Google Console matches exactly:
   - `http://127.0.0.1:5000/auth/google/callback`

### Issue 2: "User object returned: None"
**Cause:** Database error creating user

**Solution:**
1. Check if database exists: `ai_tester.db` file should be present
2. Reinitialize database:
   ```bash
   python database.py
   ```
3. Check for username conflicts in database

### Issue 3: Session Not Persisting
**Cause:** Session cookie not being saved

**Solution:**
1. Check browser allows cookies for localhost
2. Clear all cookies and try again
3. Check Flask console for session errors

### Issue 4: Still Shows Guest User
**Cause:** Session has guest user ID, not being updated

**Solution:**
1. Visit `/debug` to see current session
2. Logout: POST to `/auth/logout`
3. Clear browser cookies
4. Try login again

## Testing Checklist

- [ ] Flask server is running on `http://127.0.0.1:5000`
- [ ] Database file `ai_tester.db` exists
- [ ] Browser cookies are enabled
- [ ] Google Console has correct redirect URI
- [ ] OAuth credentials in `oauth_config.py` are correct
- [ ] Console shows detailed logs during OAuth callback
- [ ] `/debug` page shows correct session data after login

## Next Steps

1. **Restart your Flask server**
2. **Clear browser cookies for localhost:5000**
3. **Try Google login again**
4. **Copy the entire console output** from the OAuth callback
5. **Visit `/debug`** to see session state
6. **Share the console output** if issue persists

The extensive logging will help us pinpoint exactly where the OAuth flow is failing.
