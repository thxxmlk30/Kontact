const Message      = require('../models/Message');
const Notification = require('../models/Notification');

const onlineUsers = new Map();

module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.on('user:connect', (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit('users:online', Array.from(onlineUsers.keys()));
    });

    socket.on('message:send', async (data) => {
      const { senderId, receiverId, content } = data;
      const convId = await Message.getOrCreateConversation(senderId, receiverId);
      const msgId  = await Message.send(convId, senderId, content);
      await Notification.create(receiverId, 'message', msgId);

      const receiverSocket = onlineUsers.get(String(receiverId));
      if (receiverSocket) {
        io.to(receiverSocket).emit('message:receive', {
          senderId, content, convId, created_at: new Date()
        });
        io.to(receiverSocket).emit('notification:new', { type: 'message' });
      }
    });

    socket.on('typing', (data) => {
      const receiverSocket = onlineUsers.get(String(data.receiverId));
      if (receiverSocket) io.to(receiverSocket).emit('typing', { senderId: data.senderId });
    });

    socket.on('disconnect', () => {
      onlineUsers.forEach((id, userId) => {
        if (id === socket.id) onlineUsers.delete(userId);
      });
      io.emit('users:online', Array.from(onlineUsers.keys()));
    });
  });
};