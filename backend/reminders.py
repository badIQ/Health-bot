import sqlite3
from datetime import datetime, timedelta

class ReminderSystem:
    def __init__(self, db):
        self.db = db
    
    def set_reminder(self, user_id, reminder_text, reminder_time):
        try:
            conn = self.db.get_connection()
            c = conn.cursor()
            c.execute('''
                INSERT INTO reminders (user_id, reminder_text, reminder_time) 
                VALUES (?, ?, ?)
            ''', (user_id, reminder_text, reminder_time))
            conn.commit()
            reminder_id = c.lastrowid
            conn.close()
            return reminder_id
        
        except Exception as e:
            print(f"Error setting reminder: {e}")
            return False
    
    def get_reminders(self, user_id):
        conn = self.db.get_connection()
        c = conn.cursor()
        c.execute('''
            SELECT id, reminder_text, reminder_time, is_completed 
            FROM reminders 
            WHERE user_id = ? 
            ORDER BY reminder_time
        ''', (user_id,))
        reminders = c.fetchall()
        conn.close()
        
        formatted_reminders = []
        for rem in reminders:
            formatted_reminders.append({
                'id': rem[0],
                'text': rem[1],
                'time': rem[2],
                'completed': bool(rem[3])
            })
        
        return formatted_reminders
    
    def delete_reminder(self, reminder_id):
        """Delete a reminder"""
        try:
            conn = self.db.get_connection()
            c = conn.cursor()
            c.execute('DELETE FROM reminders WHERE id = ?', (reminder_id,))
            conn.commit()
            deleted = c.rowcount > 0
            conn.close()
            return deleted
        except Exception as e:
            print(f"Error deleting reminder: {e}")
            return False
    
    def mark_completed(self, reminder_id):
        """Mark a reminder as completed"""
        try:
            conn = self.db.get_connection()
            c = conn.cursor()
            c.execute('UPDATE reminders SET is_completed = 1 WHERE id = ?', (reminder_id,))
            conn.commit()
            updated = c.rowcount > 0
            conn.close()
            return updated
        except Exception as e:
            print(f"Error marking reminder as completed: {e}")
            return False