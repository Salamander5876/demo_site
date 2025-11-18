let ws = null;
let nickname = '';

// DOM Elements
const loginScreen = document.getElementById('loginScreen');
const chatScreen = document.getElementById('chatScreen');
const nicknameInput = document.getElementById('nicknameInput');
const joinButton = document.getElementById('joinButton');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const currentNicknameEl = document.getElementById('currentNickname');
const userCountEl = document.getElementById('userCount');

// Event Listeners
joinButton.addEventListener('click', joinChat);
nicknameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    joinChat();
  }
});

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

function joinChat() {
  const nicknameValue = nicknameInput.value.trim();

  if (nicknameValue.length === 0) {
    alert('Пожалуйста, введите ваш ник');
    return;
  }

  nickname = nicknameValue;
  currentNicknameEl.textContent = nickname;

  // Switch screens
  loginScreen.classList.remove('active');
  chatScreen.classList.add('active');

  // Connect to WebSocket
  connectWebSocket();
}

function connectWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('Connected to server');
    addSystemMessage('Подключено к серверу');

    // Send join message
    ws.send(JSON.stringify({
      type: 'join',
      nickname: nickname
    }));
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'message':
          addMessage(data.nickname, data.message, data.timestamp);
          break;
        case 'system':
          addSystemMessage(data.message);
          break;
        case 'userCount':
          updateUserCount(data.count);
          break;
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  ws.onclose = () => {
    console.log('Disconnected from server');
    addSystemMessage('Отключено от сервера');
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    addSystemMessage('Ошибка подключения');
  };
}

function sendMessage() {
  const message = messageInput.value.trim();

  if (message.length === 0) {
    return;
  }

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'message',
      message: message
    }));

    messageInput.value = '';
  } else {
    addSystemMessage('Нет подключения к серверу');
  }
}

function addMessage(nickname, message, timestamp) {
  const messageEl = document.createElement('div');
  messageEl.className = 'message';

  const time = new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });

  messageEl.innerHTML = `
    <div class="message-header">
      <span class="message-nickname">${escapeHtml(nickname)}</span>
      <span class="message-time">${time}</span>
    </div>
    <div class="message-text">${escapeHtml(message)}</div>
  `;

  messagesContainer.appendChild(messageEl);
  scrollToBottom();
}

function addSystemMessage(message) {
  const messageEl = document.createElement('div');
  messageEl.className = 'message system-message';
  messageEl.textContent = message;

  messagesContainer.appendChild(messageEl);
  scrollToBottom();
}

function updateUserCount(count) {
  const userWord = count === 1 ? 'пользователь' : count < 5 ? 'пользователя' : 'пользователей';
  userCountEl.textContent = `${count} ${userWord}`;
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
