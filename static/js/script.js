function addMessage(text, isUser) {
    const chatDisplay = document.getElementById('chatDisplay');
    const messageDiv = document.createElement('div');
    messageDiv.className = isUser ? 'message user-message' : 'message bot-message';
    messageDiv.textContent = (isUser ? 'You: ' : 'Health Bot: ') + text;
    chatDisplay.appendChild(messageDiv);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

function sendMessage() {
    const input = document.getElementById('userInput');
    const message = input.value.trim();
    
    if (message) {
        addMessage(message, true);
        input.value = '';
        
        // Send to backend
        fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: 1,
                message: message
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            addMessage(data.response, false);
        })
        .catch(error => {
            addMessage('Sorry, there was an error processing your request.', false);
            console.error('Error:', error);
        });
    }
}

function quickAction(action) {
    if (action === 'Set a reminder') {
        openModal();
    } else {
        document.getElementById('userInput').value = action;
        sendMessage();
    }
}

function showReminders() {
    fetch('/api/reminders?user_id=1')
    .then(response => response.json())
    .then(data => {
        if (data.reminders && data.reminders.length > 0) {
            let remindersText = "Your reminders:\n";
            data.reminders.forEach(reminder => {
                const time = new Date(reminder.time).toLocaleString();
                remindersText += `- ${reminder.text} at ${time}\n`;
            });
            addMessage(remindersText, false);
        } else {
            addMessage("You don't have any reminders set yet.", false);
        }
    })
    .catch(error => {
        addMessage('Sorry, there was an error fetching your reminders.', false);
        console.error('Error:', error);
    });
}

function openModal() {
    document.getElementById('reminderModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('reminderModal').style.display = 'none';
}

function setReminder() {
    const text = document.getElementById('reminderText').value;
    const time = document.getElementById('reminderTime').value;
    
    if (!text || !time) {
        alert('Please enter both reminder text and time');
        return;
    }
    
    fetch('/api/set_reminder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: 1,
            text: text,
            time: time
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            addMessage(`I've set a reminder: ${text} at ${time}`, false);
            closeModal();
            // Clear the form
            document.getElementById('reminderText').value = '';
            document.getElementById('reminderTime').value = '';
        } else {
            alert('Failed to set reminder: ' + data.message);
        }
    })
    .catch(error => {
        alert('Error setting reminder: ' + error);
        console.error('Error:', error);
    });
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Close modal if user clicks outside of it
window.onclick = function(event) {
    const modal = document.getElementById('reminderModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Initialize with a greeting
window.onload = function() {
    document.getElementById('userInput').focus();
};