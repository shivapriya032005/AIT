# Google OAuth Login Troubleshooting Guide

## Changes Made

### 1. **Fixed OAuth Configuration** (`app.py`)
- Removed hardcoded `redirect_uri` from OAuth registration
- Added `server_metadata_url` for Google OAuth to auto-discover endpoints
- Improved username generation to avoid conflicts (uses full email with underscores)

### 2. **Enhanced Error Handling** (`app.py`)
- Added check for `access_denied` error before processing token
- Changed error responses from JSON to redirects with error parameters
- Added detailed logging for debugging

### 3. **Improved Database Function** (`database.py`)
- Added comprehensive error handling and logging
- Fixed potential connection leak issues
- Added full_name update when linking existing user to OAuth

### 4. **Added Error Display** (`auth.js`)
- Automatically detects and displays OAuth errors from URL parameters
- User-friendly error messages for different failure scenarios
- Cleans up URL after displaying error

## Current Issue: "Login is being failed after login with Google"

### Possible Causes & Solutions

#### 1. **Redirect URI Mismatch** (Most Common)
**Problem:** Google OAuth redirect URI doesn't match what's configured in Google Cloud Console.

**Solution:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services → Credentials**
3. Find your OAuth 2.0 Client ID: `964719527307-h6lu2fis7eudpc25m16e3q9mogngmqku`
4. Click **Edit**
5. Under **Authorized redirect URIs**, add BOTH:
   - `http://127.0.0.1:5000/auth/google/callback`
   - `http://localhost:5000/auth/google/callback`
6. Click **Save**
7. Wait 5 minutes for changes to propagate

#### 2. **OAuth Consent Screen Not Configured**
**Problem:** Google OAuth app is not properly set up.

**Solution:**
1. Go to **APIs & Services → OAuth consent screen**
2. Fill in required fields:
   - App name: "AI Tester"
   - User support email: Your email
   - Developer contact: Your email
3. Add test users if app is in "Testing" mode:
   - Add `shivapriya032005@gmail.com`
4. Save changes

#### 3. **Database Not Initialized**
**Problem:** Database tables don't exist.

**Solution:**
```bash
python database.py
```

#### 4. **Session Issues**
**Problem:** Flask session not working properly.

**Check:** Make sure `SECRET_KEY` is set in `oauth_config.py` (already configured)

## Testing Steps

### 1. **Check Server Logs**
When you run the Flask app, watch the console output. You should see:
```
Database initialized successfully!
Default guest user created!
 * Running on http://127.0.0.1:5000
```

### 2. **Test OAuth Flow**
1. Click "Continue with Google"
2. Watch the console for log messages:
   - `"Google OAuth error: ..."` (if error occurs)
   - `"Creating new OAuth user: ..."` (if creating new user)
   - `"User logged in successfully: ..."` (if successful)

### 3. **Check for Errors**
If login fails, you should see an error message on the login page explaining what went wrong.

## Debug Checklist

- [ ] Python is installed and in PATH
- [ ] Flask app is running on `http://127.0.0.1:5000`
- [ ] Google Cloud Console has correct redirect URIs
- [ ] OAuth consent screen is configured
- [ ] Test user email is added (if app is in Testing mode)
- [ ] Database is initialized (`ai_tester.db` file exists)
- [ ] No firewall blocking localhost:5000

## Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `access_denied` | User clicked Cancel or Google denied access | Try again and click "Allow" |
| `redirect_uri_mismatch` | Redirect URI not in Google Console | Add correct URI to Google Console |
| `no_email` | Couldn't get email from Google | Check OAuth scopes include email |
| `account_creation_failed` | Database error creating user | Check database.py logs |
| `auth_failed` | General authentication error | Check server logs for details |

## Next Steps

1. **Restart Flask Server** to pick up the changes
2. **Clear Browser Cache/Cookies** for localhost:5000
3. **Try OAuth Login Again**
4. **Check Console Logs** for detailed error messages
5. **Report Error** if issue persists (include console logs)

## Contact
If you continue to have issues, provide:
- Console output from Flask server
- Browser console errors (F12 → Console tab)
- Exact error message displayed on screen
