import sqlite3
from pathlib import Path

DATABASE_PATH = Path(__file__).parent / "comparisons.db"
def get_connection():
    """Open a connection to the SQLite database."""
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection

def initialize_database():
    """Create the comparisons table if it does not exist."""
    with get_connection() as connection:
        connection.execute(
"""
CREATE TABLE IF NOT EXISTS comparisons (
id INTEGER PRIMARY KEY AUTOINCREMENT,
title TEXT NOT NULL,
original_json TEXT NOT NULL,
updated_json TEXT NOT NULL,
changes TEXT NOT NULL,
created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)
"""
)

if __name__ == "__main__":
     initialize_database()
print(f"Database initialized successfully: {DATABASE_PATH}")
