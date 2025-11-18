# WebSocket Chat

Простое приложение чата на основе WebSocket с использованием Node.js, Express и ws.

## Возможности

- Вход с выбором никнейма
- Общий чат в реальном времени
- Отображение количества пользователей онлайн
- Системные сообщения о входе/выходе пользователей
- Адаптивный дизайн для мобильных устройств

## Технологии

- Node.js
- Express.js
- WebSocket (библиотека ws)
- HTML/CSS/JavaScript

## Установка на сервер Debian

### Шаг 1: Обновление системы

```bash
sudo apt update
sudo apt upgrade -y
```

### Шаг 2: Установка Node.js

Установим Node.js последней LTS версии через NodeSource:

```bash
# Установка curl если его нет
sudo apt install -y curl

# Добавление репозитория NodeSource для Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Установка Node.js и npm
sudo apt install -y nodejs

# Проверка установки
node --version
npm --version
```

### Шаг 3: Установка Git (если нужно клонировать репозиторий)

```bash
sudo apt install -y git
```

### Шаг 4: Загрузка проекта

Вариант 1 - Клонирование из Git:
```bash
cd /var/www
sudo git clone <URL_вашего_репозитория> websocket-chat
cd websocket-chat
```

Вариант 2 - Загрузка файлов вручную:
```bash
# Создайте директорию для проекта
sudo mkdir -p /var/www/websocket-chat
cd /var/www/websocket-chat

# Загрузите файлы проекта через SCP, FTP или другим способом
```

### Шаг 5: Установка зависимостей

```bash
# Перейдите в директорию проекта
cd /var/www/websocket-chat

# Установите зависимости
npm install
```

### Шаг 6: Настройка порта (опционально)

По умолчанию приложение использует порт 3000. Чтобы изменить порт:

```bash
# Создайте файл .env
nano .env

# Добавьте строку:
PORT=3000
```

### Шаг 7: Запуск приложения

Для тестирования:
```bash
npm start
```

### Шаг 8: Настройка автозапуска с PM2 (рекомендуется)

PM2 - это менеджер процессов для Node.js приложений:

```bash
# Установка PM2 глобально
sudo npm install -g pm2

# Запуск приложения через PM2
pm2 start server.js --name websocket-chat

# Настройка автозапуска при перезагрузке сервера
pm2 startup systemd
# Выполните команду, которую предложит PM2

# Сохранение текущего списка процессов
pm2 save

# Полезные команды PM2:
pm2 status              # Статус всех процессов
pm2 logs websocket-chat # Просмотр логов
pm2 restart websocket-chat  # Перезапуск
pm2 stop websocket-chat     # Остановка
pm2 delete websocket-chat   # Удаление из PM2
```

### Шаг 9: Настройка Nginx как обратного прокси (опционально)

Для использования на 80/443 портах:

```bash
# Установка Nginx
sudo apt install -y nginx

# Создание конфигурации
sudo nano /etc/nginx/sites-available/websocket-chat
```

Добавьте следующую конфигурацию:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Замените на ваш домен или IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Активируйте конфигурацию:

```bash
# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/websocket-chat /etc/nginx/sites-enabled/

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

### Шаг 10: Настройка SSL с Let's Encrypt (опционально)

```bash
# Установка Certbot
sudo apt install -y certbot python3-certbot-nginx

# Получение SSL сертификата
sudo certbot --nginx -d your-domain.com

# Автоматическое обновление сертификата уже настроено
```

### Шаг 11: Настройка файрвола

```bash
# Если используете UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp  # Только если нужен прямой доступ
sudo ufw enable
```

## Использование

1. Откройте браузер и перейдите по адресу:
   - `http://localhost:3000` (локально)
   - `http://your-domain.com` (если настроен Nginx)
   - `http://your-server-ip:3000` (прямое подключение)

2. Введите ваш никнейм

3. Начните общение в чате!

## Структура проекта

```
websocket-chat/
├── server.js           # WebSocket сервер
├── package.json        # Зависимости проекта
├── public/             # Статические файлы
│   ├── index.html      # HTML интерфейс
│   ├── app.js          # Клиентский JavaScript
│   └── style.css       # CSS стили
└── README.md           # Документация
```

## Управление приложением

### Просмотр логов (PM2)
```bash
pm2 logs websocket-chat
```

### Мониторинг
```bash
pm2 monit
```

### Обновление приложения
```bash
cd /var/www/websocket-chat
git pull  # Если используете Git
npm install  # Обновление зависимостей если нужно
pm2 restart websocket-chat
```

## Решение проблем

### Порт уже используется
```bash
# Найти процесс на порту 3000
sudo lsof -i :3000

# Убить процесс по PID
sudo kill -9 <PID>
```

### Проверка работы Node.js
```bash
node server.js
# Должно вывести: Server is running on http://localhost:3000
```

### Проверка WebSocket соединения
Откройте консоль разработчика в браузере (F12) и проверьте вкладку Network/WS для WebSocket соединений.

## Безопасность

Рекомендации для продакшн окружения:

1. Используйте HTTPS/WSS (WebSocket Secure)
2. Настройте файрвол
3. Регулярно обновляйте зависимости: `npm update`
4. Используйте переменные окружения для конфигурации
5. Добавьте rate limiting для предотвращения спама
6. Настройте валидацию входных данных

## Лицензия

MIT
