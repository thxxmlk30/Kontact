const db = require('../config/db');

class Friend {
  static async sendRequest(sender_id, receiver_id) {
    const [result] = await db.execute(
      `INSERT IGNORE INTO friend_requests (sender_id, receiver_id)
       VALUES (?, ?)`,
      [sender_id, receiver_id]
    );
    return result;
  }

  static async respond(id, status) {
    const [result] = await db.execute('UPDATE friend_requests SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows;
  }

  static async remove(user1, user2) {
    const [result] = await db.execute(`
      DELETE FROM friend_requests
      WHERE status = 'accepted'
        AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
    `, [user1, user2, user2, user1]);
    return result.affectedRows;
  }

  static async getRequests(user_id) {
    const [rows] = await db.execute(`
      SELECT fr.*, u.fullname, u.username, u.avatar
      FROM friend_requests fr JOIN users u ON fr.sender_id = u.id
      WHERE fr.receiver_id = ? AND fr.status = 'pending'
    `, [user_id]);
    return rows;
  }

  static async getFriends(user_id) {
    const [rows] = await db.execute(`
      SELECT u.id, u.fullname, u.username, u.avatar FROM friend_requests fr
      JOIN users u ON u.id = CASE WHEN fr.sender_id = ? THEN fr.receiver_id ELSE fr.sender_id END
      WHERE (fr.sender_id = ? OR fr.receiver_id = ?) AND fr.status = 'accepted'
    `, [user_id, user_id, user_id]);
    return rows;
  }

  static async areFriends(user1, user2) {
    const [rows] = await db.execute(`
      SELECT id FROM friend_requests
      WHERE status = 'accepted'
        AND ((sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?))
    `, [user1, user2, user2, user1]);
    return rows.length > 0;
  }

  static async getSuggestions(user_id) {
    const [rows] = await db.execute(`
      SELECT id, fullname, username, avatar FROM users
      WHERE id != ? AND id NOT IN (
        SELECT CASE WHEN sender_id = ? THEN receiver_id ELSE sender_id END
        FROM friend_requests WHERE sender_id = ? OR receiver_id = ?
      )
      ORDER BY RAND() LIMIT 5
    `, [user_id, user_id, user_id, user_id]);
    return rows;
  }
}

module.exports = Friend;
