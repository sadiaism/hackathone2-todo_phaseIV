"""
Script to initialize database tables.
This can be run separately to ensure tables are created in the database.
"""
from .database import engine, create_db_and_tables
from .models import Task
from .user_models import User


def init_db():
    """Initialize the database and create tables"""
    print("Initializing database and creating tables...")
    create_db_and_tables()
    print("Database tables created successfully!")


if __name__ == "__main__":
    init_db()