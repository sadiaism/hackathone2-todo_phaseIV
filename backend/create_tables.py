"""
Script to create database tables in Neon PostgreSQL.
Run this script with proper environment variables set to create tables in your Neon database.
"""

from dotenv import load_dotenv
import os
import sys
from app.initial_data import init_db
from app.config import settings

load_dotenv()
def main():
    print(f"Current database URL: {settings.database_url}")
    print("Checking if database connection is possible...")

    # Try to import the database module to test connection
    try:
        from app.database import engine
        with engine.connect() as conn:
            print("SUCCESS: Database connection successful!")
    except Exception as e:
        print(f"ERROR: Database connection failed: {e}")
        print("Make sure your .env file has the correct DATABASE_URL for your Neon database")
        sys.exit(1)

    print("Creating tables...")
    init_db()
    print("Tables created successfully!")


if __name__ == "__main__":
    main()