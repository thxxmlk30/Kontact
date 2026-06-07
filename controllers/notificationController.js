const Notification = require('../models/Notification');

const labels = {
  like: 'Nouveau like',
  comment: 'Nouveau commentaire',
  friend_request: 'Demande d ami',
  message: 'Nouveau message'
};

exports.getAll = async (req, res, next) => {
  try {
    const notifications = await Notification.getByUser(req.session.user.id);
    const unread = await Notification.countUnread(req.session.user.id);
    return res.json({
      unread,
      notifications: notifications.map((item) => ({
        ...item,
        title: labels[item.type] || 'Notification',
        message: labels[item.type] || 'Nouvelle activite'
      }))
    });
  } catch (err) {
    return next(err);
  }
};

exports.markOne = async (req, res, next) => {
  try {
    await Notification.markOneRead(req.params.id, req.session.user.id);
    return res.json({ message: 'Notification lue.' });
  } catch (err) {
    return next(err);
  }
};

exports.markAll = async (req, res, next) => {
  try {
    await Notification.markRead(req.session.user.id);
    return res.json({ message: 'Notifications lues.' });
  } catch (err) {
    return next(err);
  }
};
