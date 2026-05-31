-- ============================================
-- KONTACT - Schéma de base de données MySQL
-- ============================================

CREATE DATABASE IF NOT EXISTS kontact CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kontact;

-- Table users
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  fullname      VARCHAR(100) NOT NULL,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL,
  bio           TEXT,
  avatar        VARCHAR(255) DEFAULT 'default-avatar.png',
  cover_image   VARCHAR(255) DEFAULT 'default-cover.jpg',
  role          ENUM('user','admin') DEFAULT 'user',
  status        ENUM('active','suspended') DEFAULT 'active',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table posts
CREATE TABLE posts (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  content       TEXT NOT NULL,
  image         VARCHAR(255),
  visibility    ENUM('public','friends','private') DEFAULT 'public',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table comments
CREATE TABLE comments (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  post_id       INT NOT NULL,
  user_id       INT NOT NULL,
  content       TEXT NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table likes
CREATE TABLE likes (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  post_id       INT NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (user_id, post_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
);

-- Table friend_requests
CREATE TABLE friend_requests (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  sender_id     INT NOT NULL,
  receiver_id   INT NOT NULL,
  status        ENUM('pending','accepted','rejected') DEFAULT 'pending',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_request (sender_id, receiver_id),
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table conversations
CREATE TABLE conversations (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user1_id      INT NOT NULL,
  user2_id      INT NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_conv (user1_id, user2_id),
  FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table messages
CREATE TABLE messages (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  conversation_id INT NOT NULL,
  sender_id       INT NOT NULL,
  content         TEXT NOT NULL,
  is_read         TINYINT(1) DEFAULT 0,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table notifications
CREATE TABLE notifications (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  type          ENUM('like','comment','friend_request','message') NOT NULL,
  ref_id        INT,
  is_read       TINYINT(1) DEFAULT 0,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table reports
CREATE TABLE reports (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  reporter_id   INT NOT NULL,
  reported_id   INT,
  post_id       INT,
  reason        TEXT,
  status        ENUM('pending','resolved') DEFAULT 'pending',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table blocks
CREATE TABLE blocks (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  blocker_id    INT NOT NULL,
  blocked_id    INT NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_block (blocker_id, blocked_id),
  FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table user_settings
CREATE TABLE user_settings (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  user_id             INT NOT NULL UNIQUE,
  notifications_email TINYINT(1) DEFAULT 1,
  profile_visibility  ENUM('public','friends') DEFAULT 'public',
  language            VARCHAR(10) DEFAULT 'fr',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin par défaut
INSERT INTO users (fullname, username, email, password, role)
VALUES ('Admin Kontact', 'admin', 'admin@kontact.com', 'Admin1234', 'admin');