#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import requests
import json

def test_oauth_routes():
    """Test OAuth routes"""
    base_url = "http://localhost:5000"

    print("Testing OAuth routes...")

    # Test Google OAuth (should return 501 if not configured)
    try:
        response = requests.get(f"{base_url}/auth/google")
        print(f"Google OAuth: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"Google OAuth error: {e}")

    # Test GitHub OAuth (should return 501 if not configured)
    try:
        response = requests.get(f"{base_url}/auth/github")
        print(f"GitHub OAuth: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"GitHub OAuth error: {e}")

    print("OAuth routes test completed!")

if __name__ == "__main__":
    test_oauth_routes()
