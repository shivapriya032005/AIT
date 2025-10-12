#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import requests
import json

def test_oauth_endpoints():
    """Test OAuth endpoints with real credentials"""
    base_url = "http://localhost:5000"

    print("Testing OAuth endpoints with configured credentials...")

    # Test Google OAuth endpoint
    try:
        response = requests.get(f"{base_url}/auth/google", allow_redirects=False)
        print(f"Google OAuth: {response.status_code}")
        if response.status_code == 302:
            print(f"  Redirect URL: {response.headers.get('Location', 'Not found')}")
            print("  ✅ OAuth flow initiated successfully!")
        else:
            print(f"  Response: {response.text[:200]}...")
    except Exception as e:
        print(f"Google OAuth error: {e}")

    print()

    # Test GitHub OAuth endpoint
    try:
        response = requests.get(f"{base_url}/auth/github", allow_redirects=False)
        print(f"GitHub OAuth: {response.status_code}")
        if response.status_code == 302:
            print(f"  Redirect URL: {response.headers.get('Location', 'Not found')}")
            print("  ✅ OAuth flow initiated successfully!")
        else:
            print(f"  Response: {response.text[:200]}...")
    except Exception as e:
        print(f"GitHub OAuth error: {e}")

    print()
    print("OAuth endpoints test completed!")

    print("\n" + "="*50)
    print("NEXT STEPS:")
    print("1. Visit http://localhost:5000/login")
    print("2. Click 'Continue with Google' or 'Continue with GitHub'")
    print("3. Complete OAuth flow in your browser")
    print("4. You should be redirected back to the app")
    print("="*50)

if __name__ == "__main__":
    test_oauth_endpoints()
