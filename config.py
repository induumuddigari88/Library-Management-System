import os
import mysql.connector
from mysql.connector import pooling
from dotenv import load_dotenv

load_dotenv()

db_pool = pooling.MySQLConnectionPool(
    pool_name="library_pool",
    pool_size=5,
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME", "library_ms")
)

def get_db():
    """
    Returns a (connection, cursor) pair from the pool.
    Always call conn.close() when done — this returns it to the pool.
    """
    conn = db_pool.get_connection()
    cursor = conn.cursor(dictionary=True)
    return conn, cursor