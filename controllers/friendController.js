const Friend       = require('../models/Friend');
const Notification = require('../models/Notification');

exports.sendRequest = async (req, res) => {
  await Friend.sendRequest(req.session.user.id, req.params.id);
  await Notification.create(req.params.id, 'friend_request', req.session.user.id);
  res.redirect('back');
};

exports.respond = async (req, res) => {
  await Friend.respond(req.params.id, req.body.action);
  res.redirect('/friends/requests');
};

exports.getList = async (req, res) => {
  const friends = await Friend.getFriends(req.session.user.id);
  res.render('friends/list', { friends });
};

exports.getRequests = async (req, res) => {
  const requests = await Friend.getRequests(req.session.user.id);
  res.render('friends/requests', { requests });
};