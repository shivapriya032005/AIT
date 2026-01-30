# AI Tester - Code Testing & Analysis Platform

A powerful web-based platform for testing, analyzing, and debugging code with AI assistance.

## Features

- 🚀 **Code Editor** - Syntax-highlighted editor supporting Python, JavaScript, Java, and C++
- ✅ **Test Cases** - Create and run automated test cases
- 🔍 **Code Analysis** - AI-powered code quality analysis
- 🐛 **Debugging** - Interactive debugging with breakpoints and variable inspection
- 📊 **History** - Track all your code submissions and test results
- 👤 **User Profiles** - Personalized user accounts with authentication
- ⚙️ **Settings** - Customizable editor and execution settings

## Installation

### From Wheel (Recommended)

```bash
pip install ai-tester-1.0.0-py3-none-any.whl
```

### From Source

```bash
git clone https://github.com/shivapriya032005/AIT.git
cd ai-tester
pip install -r requirements.txt
```

## Quick Start

### 1. Initialize Database

```bash
python database.py
```

### 2. Configure Settings

Edit `oauth_config.py` and set your secret key:

```python
SECRET_KEY = 'your-secret-key-here'
```

### 3. Run the Application

```bash
python app.py
```

The application will be available at `http://127.0.0.1:5000`

## Usage

### Running Tests

1. Navigate to the **Code Editor** page
2. Write or paste your code
3. Select the programming language
4. Click **Run** to execute
5. View results in the output panel

### Creating Test Cases

1. Go to **Test Cases** page
2. Click **Add Test Case**
3. Define input and expected output
4. Run tests against your code

### Viewing History

1. Navigate to **History** page
2. Browse all previous submissions
3. Click any entry to view details
4. Filter by date or search

## Configuration

### Environment Variables

- `FLASK_ENV` - Set to `development` or `production`
- `SECRET_KEY` - Flask secret key for sessions
- `DATABASE_PATH` - Path to SQLite database (default: `ai_tester.db`)

### Settings File

Edit `oauth_config.py`:

```python
SECRET_KEY = 'your-secret-key'
```

## Development

### Project Structure

```
ai-tester/
├── app.py                 # Main Flask application
├── database.py            # Database models and functions
├── oauth_config.py        # Configuration settings
├── requirements.txt       # Python dependencies
├── templates/            # HTML templates
│   ├── index.html
│   ├── testcases.html
│   ├── history.html
│   ├── profile.html
│   ├── settings.html
│   ├── login.html
│   └── signup.html
└── static/              # Static assets
    ├── styles.css
    ├── script.js
    ├── testcases.js
    ├── history.js
    ├── profile.js
    ├── settings.js
    ├── auth.js
    └── user-auth.js
```

### Running in Development Mode

```bash
export FLASK_ENV=development
python app.py
```

### Building from Source

```bash
# Install build tools
pip install build wheel

# Build wheel
python -m build --wheel

# Install locally
pip install dist/ai_tester-1.0.0-py3-none-any.whl
```

## Deployment

### Using Gunicorn (Production)

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app:app
```

### Using Docker

```bash
docker build -t ai-tester .
docker run -p 5000:5000 ai-tester
```

### Environment Setup

For production deployment:

1. Set `SECRET_KEY` to a strong random value
2. Use a production WSGI server (Gunicorn, uWSGI)
3. Set up HTTPS with SSL certificates
4. Configure database backups
5. Set up logging and monitoring

## API Endpoints

### Code Execution
- `POST /analyze` - Analyze code for issues
- `POST /run-code` - Execute code
- `POST /debug` - Debug code with breakpoints
- `POST /run-tests` - Run test cases

### User Management
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/logout` - User logout
- `GET /api/user/profile` - Get user profile
- `POST /api/user/profile` - Update user profile

### History & Settings
- `GET /api/history` - Get code history
- `POST /api/history` - Save code to history
- `DELETE /api/history/clear` - Clear history
- `GET /api/settings` - Get user settings
- `POST /api/settings` - Update settings

## Security

- Passwords are hashed using bcrypt
- Session-based authentication
- CSRF protection enabled
- Input validation and sanitization
- SQL injection prevention with parameterized queries

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Opera (latest)

## Requirements

- Python 3.8+
- Flask 2.0+
- SQLite 3
- Modern web browser with JavaScript enabled

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For issues and questions:
- Open an issue on GitHub
- Email: support@example.com

## Changelog

### Version 1.0.0 (2025-10-12)
- Initial release
- Code editor with syntax highlighting
- Test case management
- User authentication
- Code history tracking
- Settings customization
- Multi-language support (Python, JavaScript, Java, C++)

## Acknowledgments

- Flask framework
- CodeMirror for code editing
- Font Awesome for icons
- All contributors and users

---

Made with ❤️ by the AI Tester Team
