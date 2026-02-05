#!/usr/bin/env python3
"""
Test script to verify authentication endpoints are working properly.
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_login():
    print("Testing /auth/login endpoint...")

    # Try to login with a test user (this will fail with proper error, not 500)
    login_data = {
        "email": "test@example.com",
        "password": "testpassword"
    }

    try:
        response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        print(f"Login response status: {response.status_code}")
        print(f"Login response: {response.text}")

        if response.status_code == 200:
            print("✓ Login endpoint is working correctly")
        elif response.status_code == 401:
            print("✓ Login endpoint is working correctly (user doesn't exist, which is expected)")
        else:
            print(f"Unexpected status code: {response.status_code}")

    except Exception as e:
        print(f"Error testing login: {e}")

def test_register():
    print("\nTesting /auth/register endpoint...")

    # Try to register a test user
    register_data = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpassword"
    }

    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
        print(f"Register response status: {response.status_code}")
        print(f"Register response: {response.text}")

        if response.status_code == 200:
            print("✓ Register endpoint is working correctly")
        elif response.status_code == 409:  # Conflict - user already exists
            print("✓ Register endpoint is working correctly (user exists, which is expected)")
        else:
            print(f"Unexpected status code: {response.status_code}")

    except Exception as e:
        print(f"Error testing register: {e}")

def test_cors():
    print("\nTesting CORS headers...")

    # Send OPTIONS request to check CORS
    try:
        response = requests.options(
            f"{BASE_URL}/auth/login",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type",
            }
        )
        print(f"CORS preflight response status: {response.status_code}")

        cors_headers = [
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Methods",
            "Access-Control-Allow-Headers"
        ]

        for header in cors_headers:
            if header in response.headers:
                print(f"✓ {header} header present: {response.headers[header]}")
            else:
                print(f"{header} header missing")

    except Exception as e:
        print(f"Error testing CORS: {e}")

if __name__ == "__main__":
    print("Testing authentication endpoints...\n")
    test_login()
    test_register()
    test_cors()
    print("\nTests completed.")