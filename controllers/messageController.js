const Message = require('../models/Message');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Message.getConversations(req.session.user.id);
    return res.json({ conversations });
  } catch (err) {
    return next(err);
  }
};

exports.openConversation = async (req, res, next) => {
  try {
    const otherUser = await User.findById(req.params.userId);
    if (!otherUser) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    const conversationId = await Message.getOrCreateConversation(req.session.user.id, otherUser.id);
    const messages = await Message.getByConversation(conversationId);
    await Message.markRead(conversationId, req.session.user.id);

    return res.json({ conversationId, otherUser, messages });
  } catch (err) {
    return next(err);
  }
};

exports.send = async (req, res, next) => {
  try {
    const { receiverId, content } = req.body;
    if (!receiverId || !content || !content.trim()) {
      return res.status(400).json({ message: 'Destinataire et contenu requis.' });
    }

    const conversationId = await Message.getOrCreateConversation(req.session.user.id, receiverId);
    const messageId = await Message.send(conversationId, req.session.user.id, content.trim());
    await Notification.create(receiverId, 'message', messageId);
    const messages = await Message.getByConversation(conversationId);

    return res.status(201).json({
      conversationId,
      message: messages[messages.length - 1]
    });
  } catch (err) {
    return next(err);
  }
};
