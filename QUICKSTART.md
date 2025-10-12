# AI Tester - Quick Start Guide

Get up and running with AI Tester in minutes!

## 🚀 Quick Install

### Option 1: Using Build Script (Recommended)

**Windows:**
```cmd
BUILD_AND_DEPLOY.bat
```

**Linux/Mac:**
```bash
chmod +x BUILD_AND_DEPLOY.sh
./BUILD_AND_DEPLOY.sh
```

### Option 2: Manual Installation

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Initialize database
python database.py

# 3. Run the application
python app.py
```

### Option 3: Using Docker

```bash
# Build and run with Docker Compose
docker-compose up -d

# Or using Docker directly
docker build -t ai-tester .
docker run -p 5000:5000 ai-tester
```

## 📦 Building the Wheel Package

```bash
# Install build tools
pip install build wheel

# Build the wheel
python -m build --wheel

# Install the wheel
pip install dist/ai_tester-1.0.0-py3-none-any.whl
```

## 🎯 First Steps

1. **Access the Application**
   - Open browser: `http://127.0.0.1:5000`

2. **Create an Account**
   - Click "Sign Up"
   - Fill in your details
   - Login with your credentials

3. **Write Your First Code**
   - Go to Code Editor
   - Select a language (Python, JavaScript, etc.)
   - Write or paste your code
   - Click "Run" to execute

4. **Create Test Cases**
   - Navigate to Test Cases page
   - Add test cases with inputs and expected outputs
   - Run tests against your code

## 🔧 Configuration

### Set Secret Key

Edit `oauth_config.py`:
```python
SECRET_KEY = 'your-super-secret-key-change-this-in-production'
```

### Environment Variables

```bash
# Development mode
export FLASK_ENV=development

# Production mode
export FLASK_ENV=production

# Custom port
export PORT=8000
```

## 📚 Features Overview

- **Code Editor**: Multi-language support with syntax highlighting
- **Test Cases**: Automated testing with custom test cases
- **Code Analysis**: AI-powered code quality analysis
- **Debugging**: Interactive debugging with breakpoints
- **History**: Track all your code submissions
- **Profile**: Manage your account settings
- **Settings**: Customize editor preferences

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### Database Issues
```bash
# Reinitialize database
rm ai_tester.db
python database.py
```

### Module Not Found
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

## 📖 Documentation

- [Full README](README.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Authentication Setup](AUTH_IMPLEMENTATION.md)

## 🆘 Getting Help

- Check the logs for error messages
- Review the documentation
- Open an issue on GitHub

## 🎉 You're Ready!

Start coding and testing with AI Tester!

Access your application at: **http://127.0.0.1:5000**
