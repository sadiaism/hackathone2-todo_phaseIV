"""
Script to run the backend application on an alternative port.
This script allows you to run the backend with a temporary SQLite database
for testing purposes, or with your actual Neon database when configured.
"""
import os
import subprocess
import sys
from dotenv import load_dotenv

def main():
    load_dotenv()

    # Check if DATABASE_URL is set to a real Neon URL or still has placeholders
    db_url = os.getenv("DATABASE_URL", "")

    if "your_" in db_url or "placeholder" in db_url.lower():
        print("WARNING: Detected placeholder values in DATABASE_URL")
        print("Using temporary SQLite database for testing...")

        # Use a temporary SQLite database for testing
        temp_db_url = "sqlite:///todo_backend_test.db"
        os.environ["DATABASE_URL"] = temp_db_url

        print(f"Database URL set to: {temp_db_url}")
        print("Note: This is a temporary database for testing only.")
        print("To use your Neon database, update the .env file with real credentials.")
    else:
        print(f"Using configured database: {db_url}")

    print("\nStarting backend server on port 8002...")
    print("Access the API at: http://127.0.0.1:8002")
    print("API documentation at: http://127.0.0.1:8002/docs")
    print("Use Ctrl+C to stop the server\n")

    # Import and run uvicorn
    import uvicorn
    from app.main import app

    # Create tables if using SQLite
    if db_url.startswith("sqlite:") or os.environ.get("DATABASE_URL", "").startswith("sqlite:"):
        from app.initial_data import init_db
        print("Creating database tables...")
        init_db()
        print("Tables created successfully!\n")

    uvicorn.run(app, host="127.0.0.1", port=8002, reload=False)

if __name__ == "__main__":
    main()