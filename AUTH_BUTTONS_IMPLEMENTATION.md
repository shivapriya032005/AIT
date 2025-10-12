# Login/Signup and Logout Buttons Implementation

## Overview
Added dynamic authentication buttons in the sidebar footer across all pages. The UI automatically adapts based on user authentication status.

## Features

### For Unsigned Users (Guest)
- **Login Button**: Cyan button with login icon
- **Sign Up Button**: Outlined button with signup icon
- Both buttons redirect to respective authentication pages

### For Logged-In Users
- **User Profile Display**: Shows avatar, name, and email
- **Logout Button**: Red outlined button that logs out the user
- Avatar displays first letter of user's name with gradient background

## Files Modified

### 1. **Created: `static/user-auth.js`**
- Fetches current user profile from `/api/user/profile`
- Dynamically renders UI based on authentication status
- Handles logout functionality
- Automatically loads on page load

### 2. **Updated: `static/styles.css`**
Added CSS for:
- `.auth-buttons` - Container for login/signup buttons
- `.btn-login` - Cyan login button with hover effects
- `.btn-signup` - Outlined signup button with hover effects
- `.btn-logout` - Red outlined logout button with hover effects

### 3. **Updated Templates**
Added `<script src="{{ url_for('static', filename='user-auth.js') }}"></script>` to:
- ✅ `templates/index.html` (Code Editor)
- ✅ `templates/testcases.html` (Test Cases)
- ✅ `templates/history.html` (History)
- ✅ `templates/settings.html` (Settings)
- ✅ `templates/profile.html` (Profile)

## How It Works

### 1. **Page Load**
```javascript
// On DOMContentLoaded
loadUserProfile() → fetch('/api/user/profile')
```

### 2. **Check Authentication**
```javascript
if (user && user.username !== 'guest') {
    // Show user profile + logout button
    displayLoggedInUser(user)
} else {
    // Show login/signup buttons
    displayLoginButtons()
}
```

### 3. **Logout Process**
```javascript
handleLogout() → POST '/auth/logout' → redirect to '/login'
```

## UI States

### State 1: Unsigned User (Guest)
```
┌─────────────────────────┐
│  [🔐 Login]            │
│  [➕ Sign Up]          │
└─────────────────────────┘
```

### State 2: Logged-In User
```
┌─────────────────────────┐
│  [J] John Doe          │
│      john@example.com   │
│  [🚪 Logout]           │
└─────────────────────────┘
```

## Styling Details

### Login Button
- Background: `#22d3ee` (cyan)
- Hover: Lighter cyan + lift effect
- Icon: Login arrow

### Sign Up Button
- Background: Transparent
- Border: `#2d3548`
- Hover: Dark background + cyan border
- Icon: User plus

### Logout Button
- Background: Transparent
- Border & Text: `#ef4444` (red)
- Hover: Red background + white text
- Icon: Logout arrow

## API Dependencies

### Required Endpoints
1. **GET `/api/user/profile`**
   - Returns current user data
   - Returns guest user if not authenticated

2. **POST `/auth/logout`**
   - Clears session
   - Returns success status

## Testing

### Test Scenarios
1. ✅ Visit any page as guest → See login/signup buttons
2. ✅ Click login → Redirects to `/login`
3. ✅ Click signup → Redirects to `/signup`
4. ✅ Login with credentials → See user profile + logout
5. ✅ Click logout → Clears session, redirects to `/login`
6. ✅ Navigate between pages → Buttons persist correctly

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES6+ support (async/await, fetch API)
- Graceful fallback on API errors

## Security Notes
- Logout uses POST method (CSRF protection)
- Session cleared server-side
- No sensitive data stored in localStorage
- Profile data fetched fresh on each page load

## Future Enhancements
- Add loading state during profile fetch
- Add user avatar upload support
- Add session timeout warning
- Add "Remember me" functionality
