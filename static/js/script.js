// script.js (place in Static/js/script.js)

/* ---------- Utilities ---------- */
const USER_ID = 1;

function escapeHtml(s){
  if (!s && s !== 0) return '';
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;')
    .replaceAll('\n','<br>');
}

function timeNow(){
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ---------- DOM references ---------- */
const chatBox = document.getElementById('chat-box');
const inputEl = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const quickActions = document.getElementById('quick-actions');
const reminderModal = document.getElementById('reminderModal');

/* ---------- Rendering ---------- */
function appendMessage({who='bot', text='', raw=false}){
  const el = document.createElement('div');
  el.className = 'msg ' + (who === 'user' ? 'user' : 'bot');

  // allow HTML only when raw=true (use sparingly)
  el.innerHTML = raw ? `${text}<span class="ts">${timeNow()}</span>` : `${escapeHtml(text)}<span class="ts">${timeNow()}</span>`;

  chatBox.appendChild(el);
  chatBox.scrollTop = chatBox.scrollHeight;
}

/* typing indicator */
let typingEl = null;
function showTyping(){
  if (typingEl) return;
  typingEl = document.createElement('div');
  typingEl.className = 'msg bot';
  typingEl.innerHTML = `<div class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
  chatBox.appendChild(typingEl);
  chatBox.scrollTop = chatBox.scrollHeight;
}
function hideTyping(){
  if (!typingEl) return;
  typingEl.remove();
  typingEl = null;
}

/* ---------- Network helpers (graceful parse) ---------- */
async function postJSON(url, body){
  const res = await fetch(url, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error('Server responded with ' + res.status);
  return await res.json();
}

/* ---------- Primary chat flow ---------- */
async function sendMessage(){
  const message = inputEl.value.trim();
  if (!message) return;

  appendMessage({who:'user', text:message});
  inputEl.value = '';
  inputEl.disabled = true;
  sendBtn.disabled = true;

  try {
    showTyping();
    const data = await postJSON('/api/chat', { user_id: USER_ID, message });
    hideTyping();

    // flexible parsing of bot response
    // common keys used in your previous code: bot_reply, response
    let reply = '';
    if (data === null || data === undefined) {
      reply = '⚠️ No response from server';
    } else if (Array.isArray(data)) {
      reply = data.map(x => (x.text || x.reply || x.message || JSON.stringify(x))).join('\n\n');
    } else if (typeof data === 'object') {
      if (data.bot_reply) reply = data.bot_reply;
      else if (data.response) reply = data.response;
      else if (data.reply) reply = data.reply;
      else if (data.message) reply = data.message;
      else if (data.text) reply = data.text;
      else if (data.reminders) {
        // if backend sends reminders array accidentally here, show them
        reply = formatReminders(data.reminders);
      } else {
        // fallback: pretty-print object
        reply = JSON.stringify(data);
      }
    } else {
      reply = String(data);
    }

    // keep line breaks and lists readable -> render as HTML (safe-ish since from server)
    appendMessage({who:'bot', text: reply.replaceAll('\n','<br>'), raw:true});

  } catch (err) {
    hideTyping();
    appendMessage({who:'bot', text: '⚠️ Error connecting to server. Check console for details.'});
    console.error('chat error:', err);
  } finally {
    inputEl.disabled = false;
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

/* ---------- Quick actions ---------- */
quickActions.addEventListener('click', (ev) => {
  const btn = ev.target.closest('.chip');
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === 'Set a reminder') {
    openReminderModal();
  } else if (action === 'My reminders') {
    showReminders();
  } else {
    // put action into input and send
    inputEl.value = action;
    sendMessage();
  }
});

/* ---------- Reminders ---------- */
function formatReminders(list){
  if (!Array.isArray(list) || list.length === 0) return "You don't have any reminders.";
  return list.map(r => `• ${r.text} — ${new Date(r.time).toLocaleString()}`).join('<br>');
}

async function showReminders(){
  try {
    showTyping();
    const res = await fetch(`/api/reminders?user_id=${USER_ID}`);
    const data = await res.json();
    hideTyping();
    const text = data && data.reminders ? formatReminders(data.reminders) : "You don't have any reminders.";
    appendMessage({who:'bot', text, raw:true});
  } catch (err) {
    hideTyping();
    appendMessage({who:'bot', text: '⚠️ Could not fetch reminders at the moment.'});
    console.error('reminders error:', err);
  }
}

/* modal controls */
function openReminderModal(){
  reminderModal.setAttribute('aria-hidden','false');
  reminderModal.style.display = 'flex';
  document.getElementById('reminderText').focus();
}
function closeReminderModal(){
  reminderModal.setAttribute('aria-hidden','true');
  reminderModal.style.display = 'none';
}

/* hooking modal buttons */
document.getElementById('modalClose').addEventListener('click', closeReminderModal);
document.getElementById('cancelReminder').addEventListener('click', closeReminderModal);
document.getElementById('saveReminder').addEventListener('click', async () => {
  const txt = document.getElementById('reminderText').value.trim();
  const time = document.getElementById('reminderTime').value;
  if (!txt || !time) {
    alert('Please provide both reminder text and time.');
    return;
  }
  try {
    const payload = { user_id: USER_ID, text: txt, time: time };
    const res = await postJSON('/api/set_reminder', payload);
    if (res && (res.success === true || res.ok === true)) {
      appendMessage({who:'bot', text:`✅ Reminder set: ${escapeHtml(txt)} at ${new Date(time).toLocaleString()}`, raw:true});
      document.getElementById('reminderText').value = '';
      document.getElementById('reminderTime').value = '';
      closeReminderModal();
    } else {
      const msg = res && res.message ? res.message : 'Failed to set reminder';
      alert(msg);
    }
  } catch (err) {
    console.error('set reminder error', err);
    alert('Error setting reminder. See console.');
  }
});

/* close modal if user clicks outside */
window.addEventListener('click', (ev)=>{
  if (ev.target === reminderModal) closeReminderModal();
});

/* ---------- input + keyboard ---------- */
sendBtn.addEventListener('click', sendMessage);
inputEl.addEventListener('keydown', (e)=>{
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

/* ---------- initial greeting (non-blocking) ---------- */
document.addEventListener('DOMContentLoaded', () => {
  // focus input
  inputEl.focus();

  // Optionally, show a friendly greeting (replace with server-sent initial message if you want)
  appendMessage({who:'bot', text:'Hello! I am your Health Assistant. Ask me about symptoms, reminders, or type "Check symptoms".'});
});
