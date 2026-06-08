const db = require('../config/db');

const query = async (sql, params) => {
  const [results] = await db.query(sql, params);
  return results;
};

const Comment = {
  create: async ({ post_id, user_id, content }) => {
    return query(
      `INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)`,
      [post_id, user_id, content]
    );
  },

  getByPost: async (post_id) => {
    return query(
      `SELECT comments.*, users.fullname, users.username, users.avatar
       FROM comments JOIN users ON comments.user_id = users.id
       WHERE comments.post_id = ? ORDER BY comments.created_at ASC`,
      [post_id]
    );
  },

  findById: async (id) => {
    const rows = await query(`SELECT * FROM comments WHERE id = ?`, [id]);
    return rows[0] ?? null;
  },

  delete: async (id) => {
    return query(`DELETE FROM comments WHERE id = ?`, [id]);
  },
};

module.exports = Comment;