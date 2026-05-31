const Notification = require('../models/Notification');

exports.getAll = async (req, res) => {
  const notifications = await Notification.getByUser(req.session.user.id);
  await Notification.markRead(req.session.user.id);
  res.render('notifications/index', { notifications });
};