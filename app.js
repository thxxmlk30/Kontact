const path = require('path');
const http = require('http');
const express = require('express');
const session = require('express-session');
const { Server } = require('socket.io');
require('dotenv').config();

const errorMiddleware = require('./middleware/errorMiddleware');
const registerChatSocket = require('./sockets/chat.socket');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  name: process.env.SESSION_NAME || 'kontact.sid',
  secret: process.env.SESSION_SECRET || 'kontact-secret-key-2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/likes', require('./routes/likeRoutes'));
app.use('/api/friends', require('./routes/friendRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Endpoint API introuvable.' });
});

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(errorMiddleware);

registerChatSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Kontact running on http://localhost:${PORT}`);
});

module.exports = { app, server };
