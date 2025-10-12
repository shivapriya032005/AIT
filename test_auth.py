#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import database

def test_authentication():
    """Test authentication functionality"""
    print("Testing authentication...")

    # Test creating a user
    print("1. Creating test user...")
    user_id = database.create_user("testuser", "test@example.com", "testpass123", "Test User")
    print(f"   User created with ID: {user_id}")

    # Test authenticating the user
    print("2. Testing authentication...")
    user = database.authenticate_user("testuser", "testpass123")
    print(f"   Authentication successful: {user is not None}")
    if user:
        print(f"   User details: {user['username']}, {user['email']}")

    # Test wrong password
    print("3. Testing wrong password...")
    user = database.authenticate_user("testuser", "wrongpass")
    print(f"   Wrong password rejected: {user is None}")

    # Test non-existent user
    print("4. Testing non-existent user...")
    user = database.authenticate_user("nonexistent", "testpass123")
    print(f"   Non-existent user rejected: {user is None}")

    # Test getting user by username
    print("5. Testing user lookup...")
    user = database.get_user_by_username("testuser")
    print(f"   User lookup successful: {user is not None}")
    if user:
        print(f"   User details: {user['username']}, {user['email']}")

    print("Authentication test completed!")

if __name__ == "__main__":
    test_authentication()
