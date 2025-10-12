from flask import Flask, request, jsonify, render_template, session, redirect, url_for
import subprocess
import tempfile
import os
import re
import shutil
import ast
import sys
import traceback
from io import StringIO
from datetime import datetime
import database
import oauth_config

app = Flask(__name__)
app.secret_key = oauth_config.SECRET_KEY
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
app.config['PERMANENT_SESSION_LIFETIME'] = 86400  # 24 hours

SUPPORTED_LANGUAGES = {"python", "javascript", "java", "cpp"}

# Initialize database
database.init_db()

# Create a default user if none exists
default_user = database.get_user_by_username('guest')
if not default_user:
    database.create_user('guest', 'guest@example.com')
    print("Default guest user created!")

@app.route("/")
def index():
    return render_template("index.html")  # your HTML file (AI Code Tester UI)

@app.route("/testcases")
def testcases():
    return render_template("testcases.html")

@app.route("/history")
def history():
    return render_template("history.html")

@app.route("/profile")
def profile_page():
    """User profile page"""
    if 'user_id' not in session:
        return redirect('/login')
    return render_template("profile.html")

@app.route("/settings")
def settings_page():
    """User settings page"""
    if 'user_id' not in session:
        return redirect('/login')
    return render_template("settings.html")

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

@app.route("/oauth-setup-guide")
def oauth_setup_guide():
    """OAuth setup guide page"""
    return render_template("oauth_setup.html")

@app.route("/debug")
def debug_page():
    """Debug page to check session state"""
    return render_template("debug.html")

@app.route("/debug/session")
def debug_session():
    """Debug endpoint to check session state"""
    return jsonify({
        "session_data": dict(session),
        "user_id": session.get('user_id'),
        "has_user_id": 'user_id' in session
    })

def get_current_user():
    """Get current user from session or return guest user"""
    if 'user_id' not in session:
        # Default to guest user
        guest = database.get_user_by_username('guest')
        if guest:
            session['user_id'] = guest['id']
            return guest
    
    user_id = session.get('user_id')
    return database.get_user_by_id(user_id)

# ===== HISTORY API ENDPOINTS =====

@app.route("/api/history", methods=["GET"])
def get_history():
    """Get user's history"""
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    type_filter = request.args.get('type')
    lang_filter = request.args.get('language')
    limit = int(request.args.get('limit', 50))
    
    history = database.get_user_history(
        user['id'],
        limit=limit,
        type_filter=type_filter,
        lang_filter=lang_filter
    )
    
    return jsonify({"history": history})

@app.route("/api/history", methods=["POST"])
def add_history_item():
    """Add a history item"""
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    history_id = database.add_history(
        user['id'],
        data.get('type'),
        data.get('language'),
        data.get('title'),
        data.get('code'),
        output=data.get('output'),
        issues=data.get('issues'),
        variables=data.get('variables'),
        test_results=data.get('test_results')
    )
    
    return jsonify({"success": True, "id": history_id})

@app.route("/api/history/<int:history_id>", methods=["DELETE"])
def delete_history(history_id):
    """Delete a history item"""
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    success = database.delete_history_item(history_id, user['id'])
    return jsonify({"success": success})

@app.route("/api/history/clear", methods=["POST"])
def clear_history():
    """Clear all history"""
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    deleted = database.clear_user_history(user['id'])
    return jsonify({"success": True, "deleted": deleted})

@app.route("/api/settings", methods=["GET"])
def get_settings():
    """Get user settings"""
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    settings = database.get_user_settings(user['id'])
    return jsonify(settings)

@app.route("/api/settings", methods=["POST"])
def save_settings():
    """Save user settings"""
    user = get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    settings = request.get_json()
    database.update_user_settings(user['id'], settings)
    return jsonify({"success": True})

# ===== AUTHENTICATION API ROUTES =====

@app.route("/auth/login", methods=["POST"])
def login():
    """Login with username and password"""
    print("Login endpoint called!")  # Debug log
    data = request.get_json()
    print(f"Login data received: {data}")  # Debug log
    username = data.get('username')
    password = data.get('password')
    
    user = database.authenticate_user(username, password)
    print(f"User found: {user}")  # Debug log
    
    if user:
        session['user_id'] = user['id']
        print(f"Session set for user: {user['id']}")  # Debug log
        return jsonify({"success": True, "user": {"username": user['username'], "email": user['email']}})
    else:
        print("Authentication failed")  # Debug log
        return jsonify({"error": "Invalid username or password"}), 401

@app.route("/auth/signup", methods=["POST"])
def signup():
    """Create new user account"""
    print("Signup endpoint called!")  # Debug log
    data = request.get_json()
    print(f"Signup data received: {data}")  # Debug log
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    fullname = data.get('fullname')
    
    # Validate input
    if not username or not email or not password:
        print("Missing required fields")  # Debug log
        return jsonify({"error": "Missing required fields"}), 400
    
    # Check if user exists
    existing_user = database.get_user_by_username(username)
    print(f"Existing user check: {existing_user}")  # Debug log
    if existing_user:
        print("Username already exists")  # Debug log
        return jsonify({"error": "Username already exists"}), 400
    
    # Create user
    print(f"Creating user: {username}, {email}")  # Debug log
    user_id = database.create_user(username, email, password, fullname)
    print(f"User created with ID: {user_id}")  # Debug log
    
    if user_id:
        session['user_id'] = user_id
        print(f"Session set for new user: {user_id}")  # Debug log
        return jsonify({"success": True})
    else:
        print("Failed to create user")  # Debug log
        return jsonify({"error": "Failed to create account"}), 500

@app.route("/auth/logout", methods=["POST"])
def logout():
    """Logout current user"""
    session.clear()
    return jsonify({"success": True})

@app.route("/api/user/profile", methods=["GET"])
def get_profile():
    """Get current user profile"""
    user_id = session.get('user_id')
    print(f"Profile request - Session user_id: {user_id}")
    
    user = get_current_user()
    print(f"Profile request - Current user: {user.get('username') if user else 'None'}")
    
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    return jsonify(user)

@app.route("/api/user/profile", methods=["POST"])
def update_profile():
    """Update user profile"""
    user = get_current_user()
    if not user:
        return jsonify({"error": "Not authenticated"}), 401
    
    data = request.get_json()
    database.update_user_profile(user['id'], 
                                 full_name=data.get('full_name'),
                                 avatar_url=data.get('avatar_url'))
    return jsonify({"success": True})

@app.route("/analyze", methods=["POST"])
def analyze_code():
    print("Analyze endpoint called!")  # Debug log
    data = request.get_json(force=True)
    print(f"Received data: {data}")  # Debug log
    code = data.get("code", "")
    lang = data.get("language", "")

    issues = []

    if not code.strip():
        return jsonify({"issues": ["No code provided."]})

    if lang not in SUPPORTED_LANGUAGES:
        return jsonify({"issues": ["Unsupported language."]})

    # --- Improved Analysis logic ---
    if lang == "javascript":
        # Basic syntax checks for JavaScript
        lines = code.splitlines()
        for i, line in enumerate(lines):
            # Check for mismatched quotes (basic)
            stripped = line.strip()
            if stripped and not stripped.startswith('//'):
                # Count unescaped quotes
                single_quotes = stripped.count("'") - stripped.count("\\'")
                double_quotes = stripped.count('"') - stripped.count('\\"')
                if single_quotes % 2 != 0:
                    issues.append(f"Line {i+1}: Mismatched single quotes")
                if double_quotes % 2 != 0:
                    issues.append(f"Line {i+1}: Mismatched double quotes")
            
            # Check for == not ===, ignoring comments and strings
            if "==" in line and "===" not in line and not line.strip().startswith("//"):
                issues.append(f"Line {i+1}: Use === instead of == for strict equality.")
            if "var " in line and not line.strip().startswith("//"):
                issues.append(f"Line {i+1}: Consider using 'let' or 'const' instead of 'var'.")
    elif lang == "python":
        # Check for syntax errors by trying to compile
        try:
            compile(code, '<string>', 'exec')
        except SyntaxError as e:
            issues.append(f"Syntax Error on line {e.lineno}: {e.msg}")
        except Exception as e:
            issues.append(f"Error: {str(e)}")
        
        # Check for indentation errors (basic)
        lines = code.splitlines()
        for i, line in enumerate(lines):
            if re.match(r"^\s*def\s+\w+\(", line):
                # Next non-empty line should be indented
                j = i + 1
                while j < len(lines) and lines[j].strip() == "":
                    j += 1
                if j < len(lines) and re.match(r"^\S", lines[j]):
                    issues.append(f"Indentation error after function definition at line {j+1}.")
        # Check for tabs mixed with spaces
        if "\t" in code and "    " in code:
            issues.append("Mixing tabs and spaces for indentation is discouraged.")
    elif lang == "java":
        if not re.search(r"class\s+\w+", code):
            issues.append("No class declaration found.")
        # Print statement is optional, so just a suggestion
        if "System.out.println" not in code:
            issues.append("No print statement found (System.out.println).")
    elif lang == "cpp":
        if "int main(" not in code:
            issues.append("No main() function found.")
        if "#include" not in code:
            issues.append("No #include directives found.")

    if not issues:
        issues.append("✅ No major issues found!")

    return jsonify({"issues": issues})

@app.route("/run", methods=["POST"])
def run_code():
    data = request.get_json(force=True)
    code = data.get("code", "")
    lang = data.get("language", "")

    if not code.strip():
        return jsonify({"output": "No code to run."})

    if lang not in SUPPORTED_LANGUAGES:
        return jsonify({"output": "Unsupported language."})

    filepath = None
    output = ""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=get_file_extension(lang)) as tmp:
            tmp.write(code.encode("utf-8"))
            tmp.flush()
            filepath = tmp.name

        if lang == "python":
            cmd = ["python", filepath]
        elif lang == "javascript":
            cmd = ["node", filepath]
        elif lang == "java":
            base = os.path.dirname(filepath)
            filename = os.path.basename(filepath)
            classname = filename.replace(".java", "")
            compile_cmd = ["javac", filepath]
            compile_proc = subprocess.run(compile_cmd, capture_output=True, text=True)
            if compile_proc.returncode != 0:
                output = compile_proc.stderr
                return jsonify({"output": output})
            cmd = ["java", "-cp", base, classname]
        elif lang == "cpp":
            exe_file = filepath.replace(".cpp", "")
            compile_proc = subprocess.run(["g++", filepath, "-o", exe_file], capture_output=True, text=True)
            if compile_proc.returncode != 0:
                output = compile_proc.stderr
                return jsonify({"output": output})
            cmd = [exe_file]

        result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
        output = result.stdout or result.stderr

        return jsonify({"output": output})
    except subprocess.TimeoutExpired:
        return jsonify({"output": "Execution timed out (10s limit)."})
    except Exception as e:
        return jsonify({"output": f"Error: {str(e)}"})
    finally:
        if filepath and os.path.exists(filepath):
            os.remove(filepath)
        # Clean up compiled files for Java and C++
        if lang == "java":
            class_file = filepath.replace(".java", ".class")
            if os.path.exists(class_file):
                os.remove(class_file)
        if lang == "cpp":
            exe_file = filepath.replace(".cpp", "")
            if os.path.exists(exe_file):
                os.remove(exe_file)

@app.route("/debug", methods=["POST"])
def debug_code():
    data = request.get_json(force=True)
    code = data.get("code", "")
    lang = data.get("language", "")
    breakpoints = data.get("breakpoints", [])

    if not code.strip():
        return jsonify({"error": "No code provided."})

    if lang not in SUPPORTED_LANGUAGES:
        return jsonify({"error": "Unsupported language."})

    debug_info = {
        "variables": [],
        "callStack": [],
        "output": "",
        "errors": []
    }

    try:
        if lang == "python":
            debug_info = debug_python_code(code, breakpoints)
        elif lang == "javascript":
            debug_info = debug_javascript_code(code, breakpoints)
        else:
            debug_info["errors"].append(f"Debugging not yet implemented for {lang}")
    except Exception as e:
        debug_info["errors"].append(f"Debug error: {str(e)}")

    return jsonify(debug_info)

def debug_python_code(code, breakpoints):
    """Debug Python code and extract variables, call stack, and output"""
    debug_info = {
        "variables": [],
        "callStack": [],
        "output": "",
        "errors": []
    }

    try:
        # Parse the code to extract variable assignments
        tree = ast.parse(code)
        
        # Extract variable names
        variables = set()
        for node in ast.walk(tree):
            if isinstance(node, ast.Assign):
                for target in node.targets:
                    if isinstance(target, ast.Name):
                        variables.add(target.id)
            elif isinstance(node, ast.FunctionDef):
                debug_info["callStack"].append(f"Function: {node.name} (line {node.lineno})")
        
        # Execute code and capture output
        old_stdout = sys.stdout
        sys.stdout = captured_output = StringIO()
        
        # Create execution namespace
        exec_globals = {}
        exec_locals = {}
        
        try:
            exec(code, exec_globals, exec_locals)
            debug_info["output"] = captured_output.getvalue()
            
            # Extract variable values
            for var_name in variables:
                if var_name in exec_locals:
                    value = exec_locals[var_name]
                    debug_info["variables"].append({
                        "name": var_name,
                        "value": repr(value),
                        "type": type(value).__name__
                    })
            
            # Add global variables that were created
            for key, value in exec_locals.items():
                if key not in variables and not key.startswith('__'):
                    debug_info["variables"].append({
                        "name": key,
                        "value": repr(value),
                        "type": type(value).__name__
                    })
                    
        except Exception as e:
            debug_info["errors"].append(f"Runtime error: {str(e)}")
            debug_info["errors"].append(traceback.format_exc())
        finally:
            sys.stdout = old_stdout
            
        # Add call stack info
        if not debug_info["callStack"]:
            debug_info["callStack"].append("main (line 1)")
            
    except SyntaxError as e:
        debug_info["errors"].append(f"Syntax error on line {e.lineno}: {e.msg}")
    except Exception as e:
        debug_info["errors"].append(f"Parse error: {str(e)}")
    
    return debug_info

def debug_javascript_code(code, breakpoints):
    """Debug JavaScript code (basic analysis)"""
    debug_info = {
        "variables": [],
        "callStack": [],
        "output": "",
        "errors": []
    }
    
    try:
        # Extract variable declarations
        var_pattern = r'(?:let|const|var)\s+(\w+)\s*='
        matches = re.finditer(var_pattern, code)
        
        for match in matches:
            var_name = match.group(1)
            debug_info["variables"].append({
                "name": var_name,
                "value": "undefined",
                "type": "variable"
            })
        
        # Extract function declarations
        func_pattern = r'function\s+(\w+)\s*\('
        func_matches = re.finditer(func_pattern, code)
        
        for match in func_matches:
            func_name = match.group(1)
            debug_info["callStack"].append(f"Function: {func_name}")
        
        if not debug_info["callStack"]:
            debug_info["callStack"].append("main")
        
        # Try to run with Node.js if available
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.js', mode='w') as tmp:
                tmp.write(code)
                tmp.flush()
                filepath = tmp.name
            
            result = subprocess.run(['node', filepath], 
                                  capture_output=True, 
                                  text=True, 
                                  timeout=5)
            debug_info["output"] = result.stdout or result.stderr
            
            os.remove(filepath)
        except FileNotFoundError:
            debug_info["output"] = "Node.js not installed - cannot execute JavaScript"
        except Exception as e:
            debug_info["errors"].append(f"Execution error: {str(e)}")
            
    except Exception as e:
        debug_info["errors"].append(f"Debug error: {str(e)}")
    
    return debug_info

@app.route("/run-tests", methods=["POST"])
def run_tests():
    data = request.get_json(force=True)
    code = data.get("code", "")
    lang = data.get("language", "")
    test_cases = data.get("testCases", [])

    if not code.strip():
        return jsonify({"error": "No code provided."})

    if lang not in SUPPORTED_LANGUAGES:
        return jsonify({"error": "Unsupported language."})

    results = []
    
    try:
        if lang == "python":
            results = run_python_tests(code, test_cases)
        elif lang == "javascript":
            results = run_javascript_tests(code, test_cases)
        else:
            return jsonify({"error": f"Test execution not yet implemented for {lang}"})
    except Exception as e:
        return jsonify({"error": f"Test error: {str(e)}"})

    return jsonify({"results": results})

def run_python_tests(code, test_cases):
    """Run Python test cases"""
    results = []
    
    for i, test in enumerate(test_cases):
        test_name = test.get("name", f"Test {i+1}")
        input_data = test.get("input", "")
        expected_output = test.get("expected", "").strip()
        
        result = {
            "name": test_name,
            "passed": False,
            "actual": "",
            "expected": expected_output,
            "error": None
        }
        
        try:
            # Capture output
            old_stdout = sys.stdout
            sys.stdout = captured_output = StringIO()
            
            # Create execution namespace
            exec_globals = {}
            exec_locals = {}
            
            # Execute code
            exec(code, exec_globals, exec_locals)
            
            # Get output
            actual_output = captured_output.getvalue().strip()
            result["actual"] = actual_output
            
            # Compare output
            if actual_output == expected_output:
                result["passed"] = True
            
            sys.stdout = old_stdout
            
        except Exception as e:
            result["error"] = str(e)
            sys.stdout = old_stdout
        
        results.append(result)
    
    return results

def run_javascript_tests(code, test_cases):
    """Run JavaScript test cases"""
    results = []
    
    for i, test in enumerate(test_cases):
        test_name = test.get("name", f"Test {i+1}")
        input_data = test.get("input", "")
        expected_output = test.get("expected", "").strip()
        
        result = {
            "name": test_name,
            "passed": False,
            "actual": "",
            "expected": expected_output,
            "error": None
        }
        
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix='.js', mode='w') as tmp:
                tmp.write(code)
                tmp.flush()
                filepath = tmp.name
            
            proc_result = subprocess.run(['node', filepath], 
                                  capture_output=True, 
                                  text=True, 
                                  timeout=5)
            
            actual_output = proc_result.stdout.strip()
            result["actual"] = actual_output
            
            if actual_output == expected_output:
                result["passed"] = True
            
            os.remove(filepath)
            
        except FileNotFoundError:
            result["error"] = "Node.js not installed"
        except Exception as e:
            result["error"] = str(e)
        
        results.append(result)
    
    return results

def get_file_extension(lang):
    return {
        "python": ".py",
        "javascript": ".js",
        "java": ".java",
        "cpp": ".cpp"
    }.get(lang, ".txt")

def main():
    """Main entry point for the application"""
    import os
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)

if __name__ == "__main__":
    main()
