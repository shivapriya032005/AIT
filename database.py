import sqlite3
import json
from datetime import datetime
import os
import hashlib
import secrets

DATABASE_PATH = 'ai_tester.db'

def hash_password(password):
    """Hash a password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, hashed):
    """Verify a password against its hash"""
    return hash_password(password) == hashed

def generate_token():
    """Generate a secure random token"""
    return secrets.token_urlsafe(32)

def get_db_connection():
    """Create a database connection"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize the database with required tables"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT,
            full_name TEXT,
            avatar_url TEXT,
            oauth_provider TEXT,
            oauth_id TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    ''')
    
    # History table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            language TEXT NOT NULL,
            title TEXT NOT NULL,
            code TEXT NOT NULL,
            output TEXT,
            issues TEXT,
            variables TEXT,
            test_results TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Settings table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL,
            font_size INTEGER DEFAULT 14,
            font_family TEXT DEFAULT 'Fira Code',
            tab_size INTEGER DEFAULT 4,
            auto_save BOOLEAN DEFAULT 1,
            line_numbers BOOLEAN DEFAULT 1,
            theme TEXT DEFAULT 'dark',
            accent_color TEXT DEFAULT 'cyan',
            animations BOOLEAN DEFAULT 1,
            default_lang TEXT DEFAULT 'python',
            timeout INTEGER DEFAULT 10,
            auto_run BOOLEAN DEFAULT 1,
            clear_output BOOLEAN DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("Database initialized successfully!")

def create_user(username, email, password=None, full_name=None, oauth_provider=None, oauth_id=None, avatar_url=None):
    """Create a new user"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        password_hash = hash_password(password) if password else None
        
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, full_name, oauth_provider, oauth_id, avatar_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (username, email, password_hash, full_name, oauth_provider, oauth_id, avatar_url))
        
        user_id = cursor.lastrowid
        
        # Create default settings for the user
        cursor.execute(
            'INSERT INTO settings (user_id) VALUES (?)',
            (user_id,)
        )
        
        conn.commit()
        return user_id
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()

def authenticate_user(username, password):
    """Authenticate a user with username and password"""
    user = get_user_by_username(username)
    if user and user['password_hash']:
        if verify_password(password, user['password_hash']):
            update_last_login(user['id'])
            return user
    return None

def get_or_create_oauth_user(email, username, oauth_provider, oauth_id, full_name=None, avatar_url=None):
    """Get or create a user from OAuth"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Try to find existing OAuth user
        cursor.execute(
            'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?',
            (oauth_provider, oauth_id)
        )
        user = cursor.fetchone()
        
        if user:
            conn.close()
            update_last_login(user['id'])
            print(f"Found existing OAuth user: {user['username']} (ID: {user['id']})")
            return dict(user)
        
        # Try to find by email
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        
        if user:
            # Update with OAuth info
            cursor.execute('''
                UPDATE users SET oauth_provider = ?, oauth_id = ?, avatar_url = ?, full_name = ?
                WHERE id = ?
            ''', (oauth_provider, oauth_id, avatar_url, full_name, user['id']))
            conn.commit()
            user_id = user['id']
            conn.close()
            update_last_login(user_id)
            print(f"Updated existing user with OAuth: {user['username']} (ID: {user_id})")
            return get_user_by_id(user_id)
        
        # Create new user
        conn.close()
        print(f"Creating new OAuth user: {username}, {email}")
        user_id = create_user(username, email, oauth_provider=oauth_provider, 
                              oauth_id=oauth_id, full_name=full_name, avatar_url=avatar_url)
        
        if user_id:
            print(f"Successfully created user with ID: {user_id}")
            return get_user_by_id(user_id)
        else:
            print("Failed to create user - user_id is None")
            return None
            
    except Exception as e:
        print(f"Error in get_or_create_oauth_user: {e}")
        import traceback
        traceback.print_exc()
        conn.close()
        return None

def update_last_login(user_id):
    """Update user's last login timestamp"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        (user_id,)
    )
    conn.commit()
    conn.close()

def update_user_profile(user_id, full_name=None, avatar_url=None):
    """Update user profile"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    updates = []
    values = []
    
    if full_name is not None:
        updates.append('full_name = ?')
        values.append(full_name)
    
    if avatar_url is not None:
        updates.append('avatar_url = ?')
        values.append(avatar_url)
    
    if updates:
        values.append(user_id)
        query = f'UPDATE users SET {", ".join(updates)} WHERE id = ?'
        cursor.execute(query, values)
        conn.commit()
    
    conn.close()

def get_user_by_id(user_id):
    """Get user by ID"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

def get_user_by_username(username):
    """Get user by username"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

def add_history(user_id, type, language, title, code, output=None, issues=None, variables=None, test_results=None):
    """Add a history entry"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO history (user_id, type, language, title, code, output, issues, variables, test_results)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        user_id,
        type,
        language,
        title,
        code,
        output,
        json.dumps(issues) if issues else None,
        json.dumps(variables) if variables else None,
        json.dumps(test_results) if test_results else None
    ))
    
    history_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return history_id

def get_user_history(user_id, limit=50, type_filter=None, lang_filter=None):
    """Get user's history with optional filters"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = 'SELECT * FROM history WHERE user_id = ?'
    params = [user_id]
    
    if type_filter:
        query += ' AND type = ?'
        params.append(type_filter)
    
    if lang_filter:
        query += ' AND language = ?'
        params.append(lang_filter)
    
    query += ' ORDER BY created_at DESC LIMIT ?'
    params.append(limit)
    
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    
    history = []
    for row in rows:
        item = dict(row)
        # Parse JSON fields
        if item['issues']:
            item['issues'] = json.loads(item['issues'])
        if item['variables']:
            item['variables'] = json.loads(item['variables'])
        if item['test_results']:
            item['test_results'] = json.loads(item['test_results'])
        history.append(item)
    
    return history

def delete_history_item(history_id, user_id):
    """Delete a history item"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM history WHERE id = ? AND user_id = ?', (history_id, user_id))
    deleted = cursor.rowcount
    conn.commit()
    conn.close()
    return deleted > 0

def clear_user_history(user_id):
    """Clear all history for a user"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM history WHERE user_id = ?', (user_id,))
    deleted = cursor.rowcount
    conn.commit()
    conn.close()
    return deleted

def get_user_settings(user_id):
    """Get user settings"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM settings WHERE user_id = ?', (user_id,))
    settings = cursor.fetchone()
    conn.close()
    return dict(settings) if settings else None

def update_user_settings(user_id, settings_dict):
    """Update user settings"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Build update query dynamically
    fields = []
    values = []
    for key, value in settings_dict.items():
        if key != 'id' and key != 'user_id':
            fields.append(f'{key} = ?')
            values.append(value)
    
    if fields:
        values.append(user_id)
        query = f'UPDATE settings SET {", ".join(fields)} WHERE user_id = ?'
        cursor.execute(query, values)
        conn.commit()
    
    conn.close()

if __name__ == '__main__':
    # Initialize database when run directly
    init_db()
    print("Database setup complete!")
