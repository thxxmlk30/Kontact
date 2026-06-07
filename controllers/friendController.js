const Friend = require('../models/Friend');
const Notification = require('../models/Notification');

exports.sendRequest = async (req, res, next) => {
  try {
    const receiverId = Number(req.params.id);
    if (!receiverId || receiverId === req.session.user.id) {
      return res.status(400).json({ message: 'Demande invalide.' });
    }

    await Friend.sendRequest(req.session.user.id, receiverId);
    await Notification.create(receiverId, 'friend_request', req.session.user.id);
    return res.status(201).json({ message: 'Demande envoyee.' });
  } catch (err) {
    return next(err);
  }
};

exports.respond = async (req, res, next) => {
  try {
    const status = req.body.accept === true || req.body.action === 'accepted' ? 'accepted' : 'rejected';
    await Friend.respond(req.params.id, status);
    return res.json({ status });
  } catch (err) {
    return next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await Friend.remove(req.session.user.id, req.params.id);
    return res.json({ message: 'Ami supprime.' });
  } catch (err) {
    return next(err);
  }
};

exports.getList = async (req, res, next) => {
  try {
    const friends = await Friend.getFriends(req.session.user.id);
    return res.json({ friends });
  } catch (err) {
    return next(err);
  }
};

exports.getRequests = async (req, res, next) => {
  try {
    const requests = await Friend.getRequests(req.session.user.id);
    return res.json({ requests });
  } catch (err) {
    return next(err);
  }
};

exports.getSuggestions = async (req, res, next) => {
  try {
    const suggestions = await Friend.getSuggestions(req.session.user.id);
    return res.json({ suggestions });
  } catch (err) {
    return next(err);
  }
};
