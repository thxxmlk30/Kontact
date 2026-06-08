const db = require('../config/db');

const query = async (sql, params) => {
  const [results] = await db.query(sql, params);
  return results;
};

const Notification = {
  create: async (user_id, type, ref_id) => {
    return query(
      `INSERT INTO notifications (user_id, type, ref_id) VALUES (?, ?, ?)`,
      [user_id, type, ref_id ?? null]
    );
  },

  getByUser: async (user_id) => {
    return query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
      [user_id]
    );
  },

  countUnread: async (user_id) => {
    const rows = await query(
      `SELECT COUNT(*) as total FROM notifications WHERE user_id = ? AND is_read = 0`,
      [user_id]
    );
    return rows[0].total;
  },

  markRead: async (user_id) => {
    return query(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [user_id]);
  },

  markOneRead: async (id, user_id) => {
    return query(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, [id, user_id]);
  }
};

module.exports = Notification;
