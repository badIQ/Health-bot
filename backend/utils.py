import re
from datetime import datetime

def parse_time(time_string):
    """Parse various time formats into a datetime object"""
    time_string = time_string.lower().strip()
    
    # Handle relative times
    if 'in' in time_string:
        match = re.search(r'in\s+(\d+)\s*(minute|hour|day)', time_string)
        if match:
            value = int(match.group(1))
            unit = match.group(2)
            
            now = datetime.now()
            if unit == 'minute':
                return now + timedelta(minutes=value)
            elif unit == 'hour':
                return now + timedelta(hours=value)
            elif unit == 'day':
                return now + timedelta(days=value)
    
    # Handle specific times
    time_formats = [
        '%H:%M',            # 14:30
        '%I:%M %p',         # 2:30 PM
        '%Y-%m-%d %H:%M',   # 2023-10-15 14:30
        '%m/%d/%Y %H:%M',   # 10/15/2023 14:30
    ]
    
    for fmt in time_formats:
        try:
            return datetime.strptime(time_string, fmt)
        except ValueError:
            continue
    
    return None

def validate_email(email):
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def format_timestamp(timestamp):
    """Format timestamp for display"""
    if isinstance(timestamp, str):
        timestamp = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
    
    return timestamp.strftime('%b %d, %Y at %I:%M %p')

def calculate_bmi(weight_kg, height_m):
    """Calculate Body Mass Index"""
    if height_m <= 0:
        return None
    return weight_kg / (height_m ** 2)

def get_bmi_category(bmi):
    """Get BMI category based on value"""
    if bmi < 18.5:
        return "Underweight"
    elif 18.5 <= bmi < 25:
        return "Normal weight"
    elif 25 <= bmi < 30:
        return "Overweight"
    else:
        return "Obese"