// script.js (static/js/script.js)

/* ---------- Utilities ---------- */
const USER_ID = 1;

function escapeHtml(s) {
  if (!s && s !== 0) return '';
  return String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;')
    .replaceAll('\n','<br>');
}

function timeNow() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/* ---------- Boot after DOM ready ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById('chat-box');
  const inputEl = document.getElementById('user-input');
  const sendBtn = document.getElementById('send-btn');
  const quickActions = document.getElementById('quick-actions');
  const reminderModal = document.getElementById('reminderModal');

  if (!chatBox || !inputEl || !sendBtn) {
    console.error("⚠️ Missing essential chat elements in HTML.");
    return;
  }

  /* ---------- Rendering ---------- */
  function appendMessage({ who='bot', text='', raw=false }) {
    const el = document.createElement('div');
    el.className = 'msg ' + (who === 'user' ? 'user' : 'bot');
    el.innerHTML = raw
      ? `${text}<span class="ts">${timeNow()}</span>`
      : `${escapeHtml(text)}<span class="ts">${timeNow()}</span>`;
    chatBox.appendChild(el);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // typing indicator
  let typingEl = null;
  function showTyping() {
    if (typingEl) return;
    typingEl = document.createElement('div');
    typingEl.className = 'msg bot';
    typingEl.innerHTML = `<div class="typing"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>`;
    chatBox.appendChild(typingEl);
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  function hideTyping() {
    if (!typingEl) return;
    typingEl.remove();
    typingEl = null;
  }

  /* ---------- Network ---------- */
  async function postJSON(url, body) {
    const res = await fetch(url, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('Server responded with ' + res.status);
    return await res.json();
  }

  /* ---------- Chat flow ---------- */
  async function sendMessage() {
    const message = inputEl.value.trim();
    if (!message) return;

    appendMessage({ who:'user', text: message });
    inputEl.value = '';
    inputEl.disabled = true;
    sendBtn.disabled = true;

    try {
      showTyping();
      const data = await postJSON('/chat', { user_id: USER_ID, message });
      hideTyping();

      let reply = '';
      if (!data) {
        reply = '⚠️ No response from server';
      } else if (data.bot_reply) {
        reply = data.bot_reply;
      } else {
        reply = JSON.stringify(data);
      }

      appendMessage({ who:'bot', text: reply.replaceAll('\n','<br>'), raw:true });

    } catch (err) {
      hideTyping();
      appendMessage({ who:'bot', text:'⚠️ Error connecting to server.' });
      console.error('chat error:', err);
    } finally {
      inputEl.disabled = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  /* ---------- Input + buttons ---------- */
  sendBtn.addEventListener('click', sendMessage);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  /* ---------- Initial greeting ---------- */
  appendMessage({
    who:'bot',
    text:'Hello! I am your Health Assistant 🤖. Ask me about symptoms or type "Check symptoms".'
  });
});
