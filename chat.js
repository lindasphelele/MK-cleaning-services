// ===================================================
//  MK CLEANING — CHAT WIDGET
//  Escalates conversations to lindasphelele1@gmail.com
//  via EmailJS (free plan — 200 emails/month)
// ===================================================

// ── EMAILJS CONFIG ──────────────────────────────────
// SETUP STEPS (takes 3 minutes — see bottom of file):
const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // ← replace after setup
const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // ← replace after setup
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // ← replace after setup
// ────────────────────────────────────────────────────

const toggleBtn   = document.getElementById('chatToggle');
const widget      = document.getElementById('chatWidget');
const closeBtn    = document.getElementById('chatClose');
const messagesEl  = document.getElementById('chatMessages');
const inputEl     = document.getElementById('chatInput');
const sendBtn     = document.getElementById('chatSend');
const notif       = document.getElementById('chatNotif');
const chatFields  = document.getElementById('chatFields');
const nameInput   = document.getElementById('chatName');
const phoneInput  = document.getElementById('chatPhone');

let isOpen        = false;
let conversation  = [];       // full transcript
let askedDetails  = false;    // whether we've asked for name+phone
let detailsGiven  = false;    // whether user provided name+phone
let emailSent     = false;

// Init EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// ── OPEN / CLOSE ─────────────────────────────────────
function openChat() {
  isOpen = true;
  widget.classList.add('open');
  toggleBtn.querySelector('.chat-icon-open').style.display = 'none';
  toggleBtn.querySelector('.chat-icon-close').style.display = 'block';
  notif.style.display = 'none';
  inputEl.focus();
}

function closeChat() {
  isOpen = false;
  widget.classList.remove('open');
  toggleBtn.querySelector('.chat-icon-open').style.display = 'block';
  toggleBtn.querySelector('.chat-icon-close').style.display = 'none';
}

toggleBtn.addEventListener('click', () => isOpen ? closeChat() : openChat());
closeBtn.addEventListener('click', closeChat);

// ── QUICK REPLY ───────────────────────────────────────
function quickReply(text) {
  document.getElementById('quickBtns')?.remove();
  appendMessage(text, 'user');
  conversation.push({ role: 'visitor', text });
  setTimeout(() => botReply(text), 600);
}

// ── SEND MESSAGE ──────────────────────────────────────
function sendMessage() {
  const text = inputEl.value.trim();
  if (!text) return;
  inputEl.value = '';

  // If waiting for name+phone details
  if (askedDetails && !detailsGiven) {
    const name  = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    if (!name || !phone) {
      appendMessage('Please fill in your name and phone number above so we can reach you.', 'bot');
      return;
    }
    detailsGiven = true;
    chatFields.style.display = 'none';
    appendMessage(text, 'user');
    conversation.push({ role: 'visitor', text: `Name: ${name} | Phone: ${phone} | Message: ${text}` });
    showTyping().then(() => {
      appendMessage(`Thanks ${name}! 🙌 We've received your message and will contact you on <strong>${phone}</strong> shortly.`, 'bot');
      sendEmailAlert(name, phone, text);
    });
    return;
  }

  appendMessage(text, 'user');
  conversation.push({ role: 'visitor', text });
  setTimeout(() => botReply(text), 700);
}

sendBtn.addEventListener('click', sendMessage);
inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

// ── BOT REPLIES ───────────────────────────────────────
function botReply(userMsg) {
  const msg = userMsg.toLowerCase();
  let reply = '';

  if (msg.includes('quote') || msg.includes('price') || msg.includes('cost') || msg.includes('how much')) {
    reply = "We offer very competitive rates! Pricing depends on the property size and service type. To give you an accurate quote, we'd love to get a few details from you. 📋";
    askForDetails();
  } else if (msg.includes('book') || msg.includes('schedule') || msg.includes('appointment')) {
    reply = "Great! We'd be happy to schedule a cleaning for you. Let us get your details and we'll confirm a time that works. 📅";
    askForDetails();
  } else if (msg.includes('service') || msg.includes('offer') || msg.includes('what do you')) {
    reply = "We offer: Residential, Office, Deep Cleaning, Move-In/Out, Carpet, Window, Post-Construction, Retail, School & Sanitization services. Which one interests you?";
  } else if (msg.includes('location') || msg.includes('area') || msg.includes('where')) {
    reply = "We're based in <strong>Gauteng, South Africa</strong> and serve surrounding areas. Let us know your location for availability!";
  } else if (msg.includes('contact') || msg.includes('phone') || msg.includes('call') || msg.includes('number')) {
    reply = "You can call us directly on <strong>071 908 0242</strong> or email <strong>info@mkcleaning.co.za</strong>. We're available 7 days a week! 📞";
  } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    reply = "Hello! 👋 Welcome to MK Cleaning Services. How can we assist you today?";
  } else if (msg.includes('thank')) {
    reply = "You're welcome! 😊 Don't hesitate to reach out if you need anything else.";
  } else {
    reply = "Thanks for reaching out! To make sure we assist you properly, let me connect you with our team. Please share your details below. 👇";
    askForDetails();
  }

  if (reply) {
    showTyping().then(() => appendMessage(reply, 'bot'));
  }
}

// ── ASK FOR CONTACT DETAILS ───────────────────────────
function askForDetails() {
  if (askedDetails) return;
  askedDetails = true;
  setTimeout(() => {
    chatFields.style.display = 'flex';
    nameInput.focus();
    appendMessage("To connect you with our team, please enter your name and phone number above, then type your message below. ✍️", 'bot');
  }, 1200);
}

// ── TYPING INDICATOR ──────────────────────────────────
function showTyping() {
  return new Promise(resolve => {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble bot typing';
    bubble.id = 'typingBubble';
    bubble.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    messagesEl.appendChild(bubble);
    scrollToBottom();
    setTimeout(() => {
      bubble.remove();
      resolve();
    }, 900);
  });
}

// ── APPEND MESSAGE ────────────────────────────────────
function appendMessage(text, sender) {
  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerHTML = `<p>${text}</p>`;
  messagesEl.appendChild(bubble);
  scrollToBottom();
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// ── SEND EMAIL VIA EMAILJS ────────────────────────────
function sendEmailAlert(name, phone, message) {
  if (emailSent) return;
  emailSent = true;

  const transcript = conversation.map(m => `[${m.role.toUpperCase()}]: ${m.text}`).join('\n');

  emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    to_email:    'lindasphelele1@gmail.com',
    from_name:   name || 'Website Visitor',
    from_phone:  phone || 'Not provided',
    message:     message,
    transcript:  transcript,
    reply_to:    'info@mkcleaning.co.za',
  }).then(() => {
    console.log('Chat escalation email sent ✅');
  }).catch(err => {
    console.error('EmailJS error:', err);
  });
}

// ── AUTO-OPEN AFTER 8s (optional) ─────────────────────
setTimeout(() => {
  if (!isOpen) {
    notif.style.display = 'flex'; // pulse the button
  }
}, 8000);


/* =======================================================
   📧 EMAILJS SETUP GUIDE (3 minutes)
   =======================================================

   1. Go to https://www.emailjs.com and sign up FREE
      (200 emails/month on free plan)

   2. Click "Add New Service" → choose Gmail
      → connect your lindasphelele1@gmail.com account
      → copy the SERVICE ID (looks like: service_xxxxxx)

   3. Click "Email Templates" → "Create New Template"
      → Paste this template:

      Subject: 🧹 New Chat Lead - MK Cleaning Services

      New enquiry from website chat:

      Name:  {{from_name}}
      Phone: {{from_phone}}
      Message: {{message}}

      --- Full Conversation ---
      {{transcript}}

      → Save the template → copy the TEMPLATE ID (template_xxxxxx)

   4. Click your profile icon → "Account" → copy your PUBLIC KEY

   5. Paste all 3 values at the TOP of this file:
      EMAILJS_PUBLIC_KEY  = 'your key here'
      EMAILJS_SERVICE_ID  = 'service_xxxxxx'
      EMAILJS_TEMPLATE_ID = 'template_xxxxxx'

   That's it! Every chat lead emails lindasphelele1@gmail.com 🎉
   ======================================================= */
