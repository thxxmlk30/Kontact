const Message = require('../models/Message');
const User    = require('../models/User');

exports.getConversations = async (req, res) => {
  const conversations = await Message.getConversations(req.session.user.id);
  res.render('messages/index', { conversations, activeConv: null, messages: [] });
};

exports.openConversation = async (req, res) => {
  const otherUser     = await User.findById(req.params.userId);
  const convId        = await Message.getOrCreateConversation(req.session.user.id, otherUser.id);
  const messages      = await Message.getByConversation(convId);
  const conversations = await Message.getConversations(req.session.user.id);
  await Message.markRead(convId, req.session.user.id);
  res.render('messages/index', { conversations, activeConv: { id: convId, user: otherUser }, messages });
};

exports.send = async (req, res) => {
  const convId = await Message.getOrCreateConversation(req.session.user.id, req.params.userId);
  await Message.send(convId, req.session.user.id, req.body.content);
  res.redirect(`/messages/${req.params.userId}`);
};