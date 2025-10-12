# OAuth Configuration Setup Guide

## Overview
This application supports Google and GitHub OAuth authentication. To enable OAuth, you need to:

1. Create OAuth applications on Google and GitHub developer consoles
2. Update this configuration file with your OAuth credentials
3. Restart the application

## Step 1: Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select an existing one
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5000/auth/google/callback` (for development)
     - `https://yourdomain.com/auth/google/callback` (for production)
5. **Copy the Client ID and Client Secret** to this file

## Step 2: GitHub OAuth Setup

1. **Go to GitHub Settings**: https://github.com/settings/developers
2. **Create a new OAuth App**:
   - Click "New OAuth App"
   - Fill in the details:
     - **Application name**: Your app name
     - **Homepage URL**: `http://localhost:5000` (development)
     - **Application description**: Brief description
     - **Authorization callback URL**: `http://localhost:5000/auth/github/callback`
3. **Copy the Client ID and Client Secret** to this file

## Step 3: Update Configuration

Replace the placeholder values in oauth_config.py:

```python
# Google OAuth
GOOGLE_CLIENT_ID = "your-actual-google-client-id"
GOOGLE_CLIENT_SECRET = "your-actual-google-client-secret"

# GitHub OAuth
GITHUB_CLIENT_ID = "your-actual-github-client-id"
GITHUB_CLIENT_SECRET = "your-actual-github-client-secret"

# Update redirect URIs if needed
GOOGLE_REDIRECT_URI = "http://localhost:5000/auth/google/callback"
GITHUB_REDIRECT_URI = "http://localhost:5000/auth/github/callback"
```

## Step 4: Environment Variables (Optional)

For production, consider using environment variables:

```bash
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"
export GITHUB_CLIENT_ID="your-client-id"
export GITHUB_CLIENT_SECRET="your-client-secret"
```

## Testing OAuth

1. **Restart the application** after updating credentials
2. **Visit** `http://localhost:5000/login`
3. **Click** "Continue with Google" or "Continue with GitHub"
4. **Complete OAuth flow** - you should be redirected back to the app
5. **Check browser console** for any errors
6. **Verify user profile** shows OAuth provider badge

## Troubleshooting

**Common Issues:**

1. **"OAuth not configured" error**: Check that you've updated the config file
2. **Redirect URI mismatch**: Ensure redirect URIs match exactly in both config and OAuth app settings
3. **CORS errors**: Make sure the redirect URI is correct and accessible
4. **Token errors**: Check that you've enabled the correct scopes/permissions

**Debug Tips:**

1. Check browser network tab for OAuth requests
2. Look at server console logs for errors
3. Verify OAuth app settings in Google/GitHub consoles
4. Test with different browsers if needed

## Security Notes

- **Never commit OAuth secrets** to version control
- **Use HTTPS in production** for OAuth security
- **Rotate secrets regularly** for security
- **Monitor OAuth usage** in your provider dashboards

## Production Deployment

For production deployment:

1. **Update redirect URIs** to your production domain
2. **Use environment variables** for credentials
3. **Enable HTTPS** on your domain
4. **Configure proper CORS** settings
5. **Set secure session cookies**
