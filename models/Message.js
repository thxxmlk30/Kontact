const db = require('../config/db');

class Message {
  static async getOrCreateConversation(user1, user2) {
    const [existing] = await db.execute(
      'SELECT id FROM conversations WHERE (user1_id=? AND user2_id=?) OR (user1_id=? AND user2_id=?)',
      [user1, user2, user2, user1]
    );
    if (existing.length > 0) return existing[0].id;
    const [result] = await db.execute(
      'INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)', [user1, user2]
    );
    return result.insertId;
  }

  static async send(conversation_id, sender_id, content) {
    const [result] = await db.execute(
      'INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)',
      [conversation_id, sender_id, content]
    );
    return result.insertId;
  }

  static async getByConversation(conversation_id) {
    const [rows] = await db.execute(`
      SELECT m.*, u.fullname, u.avatar FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ? ORDER BY m.created_at ASC
    `, [conversation_id]);
    return rows;
  }

  static async getConversations(user_id) {
    const [rows] = await db.execute(`
      SELECT c.*, u.fullname, u.username, u.avatar,
        (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message
      FROM conversations c
      JOIN users u ON u.id = CASE WHEN c.user1_id = ? THEN c.user2_id ELSE c.user1_id END
      WHERE c.user1_id = ? OR c.user2_id = ?
      ORDER BY c.created_at DESC
    `, [user_id, user_id, user_id]);
    return rows;
  }

  static async markRead(conversation_id, user_id) {
    await db.execute(
      'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?',
      [conversation_id, user_id]
    );
  }
}

module.exports = Message;