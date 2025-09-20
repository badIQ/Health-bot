import sqlite3
from datetime import datetime

class DatabaseManager:
    def __init__(self, db_path):
        self.db_path = db_path
        self.init_db()
    
    def init_db(self):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        
        # Create users table
        c.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE,
                email TEXT UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create conversations table
        c.execute('''
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                message TEXT,
                response TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create reminders table
        c.execute('''
            CREATE TABLE IF NOT EXISTS reminders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                reminder_text TEXT,
                reminder_time TIMESTAMP,
                is_completed INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create health_data table
        c.execute('''
            CREATE TABLE IF NOT EXISTS health_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                type TEXT,
                value REAL,
                unit TEXT,
                recorded_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Insert a default user if none exists
        c.execute("SELECT COUNT(*) FROM users")
        if c.fetchone()[0] == 0:
            c.execute("INSERT INTO users (username, email) VALUES (?, ?)", 
                     ("default_user", "user@example.com"))
        
        conn.commit()
        conn.close()
    
    def get_connection(self):
        return sqlite3.connect(self.db_path)
    
    def add_conversation(self, user_id, message, response):
        conn = self.get_connection()
        c = conn.cursor()
        c.execute("INSERT INTO conversations (user_id, message, response) VALUES (?, ?, ?)",
                 (user_id, message, response))
        conn.commit()
        conn.close()
    
    def get_conversation_history(self, user_id, limit=10):
        conn = self.get_connection()
        c = conn.cursor()
        c.execute('''
            SELECT message, response, timestamp 
            FROM conversations 
            WHERE user_id = ? 
            ORDER BY timestamp DESC 
            LIMIT ?
        ''', (user_id, limit))
        history = c.fetchall()
        conn.close()
        
        # Format the history
        formatted_history = []
        for msg in reversed(history):  # Reverse to show in chronological order
            formatted_history.append({
                'message': msg[0],
                'response': msg[1],
                'timestamp': msg[2]
            })
        
        return formatted_history