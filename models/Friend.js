const db = require('../config/db');

const query = async (sql, params) => {
  const [results] = await db.query(sql, params);
  return results;
};

const Friend = {
  sendRequest: async (sender_id, receiver_id) => {
    return query(
      `INSERT INTO friend_requests (sender_id, receiver_id, status) VALUES (?, ?, 'pending')`,
      [sender_id, receiver_id]
    );
  },

  respond: async (requestId, status) => {
    if (status === 'accepted') {
      return query(`UPDATE friend_requests SET status = 'accepted' WHERE id = ?`, [requestId]);
    } else {
      return query(`DELETE FROM friend_requests WHERE id = ?`, [requestId]);
    }
  },

  remove: async (user1_id, user2_id) => {
    return query(
      `DELETE FROM friend_requests 
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)`,
      [user1_id, user2_id, user2_id, user1_id]
    );
  },

  getFriends: async (userId) => {
    const sql = `
      SELECT u.id, u.fullname, u.username, u.avatar
      FROM users u
      JOIN friend_requests fr ON (u.id = fr.sender_id OR u.id = fr.receiver_id)
      WHERE (fr.sender_id = ? OR fr.receiver_id = ?) 
        AND fr.status = 'accepted'
        AND u.id != ?
    `;
    return query(sql, [userId, userId, userId]);
  },

  getRequests: async (userId) => {
    const sql = `
      SELECT fr.id, u.id as sender_id, u.fullname, u.username, u.avatar
      FROM friend_requests fr
      JOIN users u ON fr.sender_id = u.id
      WHERE fr.receiver_id = ? AND fr.status = 'pending'
    `;
    return query(sql, [userId]);
  },

  getSuggestions: async (userId) => {
    // Basic suggestion: users who are not friends and not the user themselves
    const sql = `
      SELECT id, fullname, username, avatar
      FROM users
      WHERE id != ? 
        AND id NOT IN (
          SELECT receiver_id FROM friend_requests WHERE sender_id = ?
          UNION
          SELECT sender_id FROM friend_requests WHERE receiver_id = ?
        )
      LIMIT 10
    `;
    return query(sql, [userId, userId, userId]);
  }
};

module.exports = Friend;
