const db = require('../config/db');

const query = async (sql, params) => {
  const [results] = await db.query(sql, params);
  return results;
};

const Message = {
  getConversations: async (userId) => {
    const sql = `
      SELECT c.id, u.id as contact_id, u.fullname, u.username, u.avatar,
             (SELECT content FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
             (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_date,
             (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND is_read = 0) as unread_count
      FROM conversations c
      JOIN users u ON (u.id = c.user1_id OR u.id = c.user2_id)
      WHERE (c.user1_id = ? OR c.user2_id = ?) AND u.id != ?
      ORDER BY last_message_date DESC
    `;
    return query(sql, [userId, userId, userId, userId]);
  },

  getOrCreateConversation: async (user1_id, user2_id) => {
    const [u1, u2] = [user1_id, user2_id].sort((a, b) => a - b);
    const existing = await query(
      `SELECT id FROM conversations WHERE user1_id = ? AND user2_id = ?`,
      [u1, u2]
    );

    if (existing.length > 0) {
      return existing[0].id;
    }

    const result = await query(
      `INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)`,
      [u1, u2]
    );
    return result.insertId;
  },

  getByConversation: async (conversationId) => {
    const sql = `
      SELECT m.*, u.fullname, u.username, u.avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `;
    return query(sql, [conversationId]);
  },

  send: async (conversationId, senderId, content) => {
    const result = await query(
      `INSERT INTO messages (conversation_id, sender_id, content) VALUES (?, ?, ?)`,
      [conversationId, senderId, content]
    );
    return result.insertId;
  },

  markRead: async (conversationId, userId) => {
    return query(
      `UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?`,
      [conversationId, userId]
    );
  }
};

module.exports = Message;
