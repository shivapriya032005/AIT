# Deploy to Heroku - Step by Step

## Prerequisites
- Heroku account (free): https://signup.heroku.com
- Git installed
- Heroku CLI installed: https://devcenter.heroku.com/articles/heroku-cli

## Quick Deploy Steps

### 1. Install Heroku CLI
```bash
# Windows (using installer)
# Download from: https://devcenter.heroku.com/articles/heroku-cli

# Or using npm
npm install -g heroku
```

### 2. Login to Heroku
```bash
heroku login
```

### 3. Initialize Git (if not already)
```bash
git init
git add .
git commit -m "Initial commit"
```

### 4. Create Heroku App
```bash
# Create app with a name
heroku create ai-tester-app

# Or let Heroku generate a name
heroku create
```

### 5. Add Gunicorn to requirements.txt
```bash
echo "gunicorn" >> requirements.txt
```

### 6. Set Environment Variables
```bash
heroku config:set SECRET_KEY=your-super-secret-key-change-this
heroku config:set FLASK_ENV=production
```

### 7. Deploy
```bash
git push heroku main
# Or if your branch is master:
git push heroku master
```

### 8. Initialize Database
```bash
heroku run python database.py
```

### 9. Open Your App
```bash
heroku open
```

Your app will be live at: `https://your-app-name.herokuapp.com`

## Troubleshooting

### View Logs
```bash
heroku logs --tail
```

### Restart App
```bash
heroku restart
```

### Check Status
```bash
heroku ps
```

## Files Created for Heroku
- ✅ `Procfile` - Tells Heroku how to run your app
- ✅ `runtime.txt` - Specifies Python version
- ✅ `requirements.txt` - Python dependencies

## Cost
- Free tier available (with limitations)
- App sleeps after 30 minutes of inactivity
- Upgrade to Hobby ($7/month) for always-on
