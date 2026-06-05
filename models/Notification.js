const db = require('../config/db');

class Notification {
  static async create(dataOrUserId, type, refId) {
    const data = typeof dataOrUserId === 'object'
      ? dataOrUserId
      : { user_id: dataOrUserId, type, ref_id: refId };

    const [result] = await db.execute(
      'INSERT INTO notifications (user_id, type, ref_id, is_read) VALUES (?, ?, ?, ?)',
      [data.user_id, data.type, data.ref_id || null, data.is_read || 0]
    );
    return result;
  }

  static async getByUser(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
      [userId]
    );
    return rows;
  }

  static async markRead(userId) {
    const [result] = await db.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    return result.affectedRows;
  }

  static async countUnread(userId) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND is_read = 0',
      [userId]
    );
    return rows[0].total;
  }
}

module.exports = Notification;
