const db = require('../config/db');

const query = async (sql, params) => {
  const [results] = await db.query(sql, params);
  return results;
};

const Post = {
  create: async ({ user_id, content, image, visibility = 'public' }) => {
    const sql = `INSERT INTO posts (user_id, content, image, visibility) VALUES (?, ?, ?, ?)`;
    return query(sql, [user_id, content, image ?? null, visibility]);
  },

  getById: async (id, userId = null) => {
    const sql = `
      SELECT p.*, u.fullname, u.username, u.avatar,
             (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
             (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as user_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `;
    const rows = await query(sql, [userId, id]);
    return rows[0] ?? null;
  },

  getByUser: async (user_id, requesterId = null) => {
    const sql = `
      SELECT p.*, u.fullname, u.username, u.avatar,
             (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
             (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as user_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `;
    return query(sql, [requesterId, user_id]);
  },

  getFeed: async (userId) => {
    const sql = `
      SELECT p.*, u.fullname, u.username, u.avatar,
             (SELECT COUNT(*) FROM likes WHERE post_id = p.id) as likes_count,
             (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
             (SELECT COUNT(*) FROM likes WHERE post_id = p.id AND user_id = ?) as user_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.visibility = 'public'
         OR p.user_id = ?
         OR (p.visibility = 'friends' AND p.user_id IN (
            SELECT receiver_id FROM friend_requests WHERE sender_id = ? AND status = 'accepted'
            UNION
            SELECT sender_id FROM friend_requests WHERE receiver_id = ? AND status = 'accepted'
         ))
      ORDER BY p.created_at DESC
    `;
    return query(sql, [userId, userId, userId, userId]);
  },

  getAll: async () => {
    const sql = `
      SELECT p.*, u.username as author_name
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `;
    return query(sql);
  },

  update: async (id, content) => {
    return query(`UPDATE posts SET content = ? WHERE id = ?`, [content, id]);
  },

  delete: async (id) => {
    return query(`DELETE FROM posts WHERE id = ?`, [id]);
  },
};

module.exports = Post;
