const db = require('../config/db');

class Notification {
  static async create(user_id, type, ref_id) {
    await db.execute(
      'INSERT INTO notifications (user_id, type, ref_id) VALUES (?, ?, ?)',
      [user_id, type, ref_id]
    );
  }

  static async getByUser(user_id) {
    const [rows] = await db.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
      [user_id]
    );
    return rows;
  }

  static async markRead(user_id) {
    await db.execute('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [user_id]);
  }

  static async countUnread(user_id) {
    const [rows] = await db.execute(
      'SELECT COUNT(*) as total FROM notifications WHERE user_id = ? AND is_read = 0',
      [user_id]
    );
    return rows[0].total;
  }
}

module.exports = Notification;