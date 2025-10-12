# 🚀 Deploy AI Tester NOW - Get Your Live Link!

Choose one of these methods to deploy your application and get a live URL.

---

## ⚡ FASTEST: Render.com (5 minutes)

### Step-by-Step:

1. **Go to:** https://render.com
2. **Sign up** (free account)
3. **Click "New +" → "Web Service"**
4. **Choose "Build and deploy from a Git repository"**
5. **Connect your GitHub** (or create a new repo and push your code)
6. **Configure:**
   - **Name:** `ai-tester`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt && python database.py`
   - **Start Command:** `gunicorn -w 4 -b 0.0.0.0:$PORT app:app`
7. **Add Environment Variable:**
   - Key: `SECRET_KEY`
   - Value: `your-super-secret-key-123`
8. **Click "Create Web Service"**

**Your link will be:** `https://ai-tester.onrender.com`

✅ **Free tier available**  
✅ **Auto-deploys from Git**  
✅ **SSL included**

---

## 🚂 Railway.app (3 minutes)

### Step-by-Step:

1. **Go to:** https://railway.app
2. **Sign up with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository** (or create one)
6. **Railway auto-detects Flask!**
7. **Add environment variables:**
   - `SECRET_KEY=your-secret-key`
8. **Click Deploy**

**Your link will be:** `https://ai-tester.up.railway.app`

✅ **$5 free credit monthly**  
✅ **Automatic deployments**  
✅ **Very fast**

---

## 🐍 PythonAnywhere (Free Forever)

### Step-by-Step:

1. **Go to:** https://www.pythonanywhere.com
2. **Sign up** (free account)
3. **Go to "Files"** tab
4. **Upload your project files** (or use git clone)
5. **Go to "Web"** tab
6. **Click "Add a new web app"**
7. **Choose Flask**
8. **Edit WSGI configuration file:**
   ```python
   import sys
   path = '/home/yourusername/ai-tester'
   if path not in sys.path:
       sys.path.append(path)
   
   from app import app as application
   ```
9. **Reload web app**

**Your link will be:** `https://yourusername.pythonanywhere.com`

✅ **Free tier forever**  
✅ **No credit card needed**  
✅ **Easy to use**

---

## 📦 Heroku (Traditional)

### Prerequisites:
```bash
# Install Heroku CLI
# Windows: Download from https://devcenter.heroku.com/articles/heroku-cli
# Mac: brew install heroku/brew/heroku
# Linux: curl https://cli-assets.heroku.com/install.sh | sh
```

### Deploy:
```bash
# 1. Login
heroku login

# 2. Create app
heroku create ai-tester-yourname

# 3. Set environment variables
heroku config:set SECRET_KEY=your-secret-key

# 4. Initialize git (if needed)
git init
git add .
git commit -m "Deploy to Heroku"

# 5. Deploy
git push heroku main

# 6. Initialize database
heroku run python database.py

# 7. Open app
heroku open
```

**Your link will be:** `https://ai-tester-yourname.herokuapp.com`

✅ **Industry standard**  
✅ **Reliable**  
⚠️ **Free tier has limitations**

---

## 🔥 Vercel (Serverless)

### Step-by-Step:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Create `vercel.json`:**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "app.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "app.py"
       }
     ]
   }
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

**Your link will be:** `https://ai-tester.vercel.app`

✅ **Free tier**  
✅ **Fast CDN**  
✅ **Automatic HTTPS**

---

## 📊 Comparison Table

| Platform | Free Tier | Setup Time | Best For |
|----------|-----------|------------|----------|
| **Render** | ✅ Yes | 5 min | Beginners |
| **Railway** | ✅ $5/month | 3 min | Fast deploy |
| **PythonAnywhere** | ✅ Forever | 10 min | Learning |
| **Heroku** | ⚠️ Limited | 8 min | Production |
| **Vercel** | ✅ Yes | 5 min | Serverless |

---

## 🎯 My Recommendation

**For you, I recommend Render.com because:**
1. ✅ Completely free tier
2. ✅ Easiest setup (5 minutes)
3. ✅ Auto-deploys from Git
4. ✅ Free SSL certificate
5. ✅ No credit card required
6. ✅ Good performance

---

## 📝 Before You Deploy

### 1. Push to GitHub (if not already)

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Ready for deployment"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/ai-tester.git
git branch -M main
git push -u origin main
```

### 2. Update SECRET_KEY

Edit `oauth_config.py`:
```python
SECRET_KEY = 'your-super-secret-production-key-change-this'
```

### 3. Files Ready for Deployment

✅ `Procfile` - Created  
✅ `runtime.txt` - Created  
✅ `requirements.txt` - Updated with gunicorn  
✅ All templates and static files included

---

## 🆘 Need Help?

### Common Issues:

**Problem:** App crashes on startup
```bash
# Solution: Check logs
heroku logs --tail
# Or on Render: View logs in dashboard
```

**Problem:** Database not initialized
```bash
# Solution: Run database initialization
heroku run python database.py
# Or add to build command: && python database.py
```

**Problem:** Port binding error
```bash
# Solution: Use $PORT environment variable
# Already configured in: gunicorn -b 0.0.0.0:$PORT app:app
```

---

## ✅ After Deployment

1. **Test your live link**
2. **Create an account**
3. **Try the code editor**
4. **Share your link!**

---

## 🎉 You're Ready!

Choose your platform and deploy now. You'll have a live link in minutes!

**Recommended:** Start with Render.com for the easiest experience.

Good luck! 🚀
