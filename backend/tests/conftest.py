import os
import pytest
from unittest.mock import patch


@pytest.fixture(autouse=True)
def setup_test_environment():
    """Set up test environment variables before each test"""
    # Set environment variable for testing
    os.environ['DATABASE_URL'] = 'sqlite://'
    os.environ.setdefault('NEON_DB_HOST', 'localhost')
    os.environ.setdefault('NEON_DB_NAME', 'test_db')
    os.environ.setdefault('NEON_DB_USER', 'test_user')
    os.environ.setdefault('NEON_DB_PASSWORD', 'test_password')
    os.environ.setdefault('NEON_DB_PORT', '5432')

    # Yield control to the test
    yield

    # Clean up environment variables after test
    if 'DATABASE_URL' in os.environ:
        del os.environ['DATABASE_URL']