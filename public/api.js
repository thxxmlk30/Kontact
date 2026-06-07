// API Helper
class API {
  constructor() {
    this.baseURL = '/api';
    this.token = localStorage.getItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur réseau');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Auth
  async register(userData) {
    const res = await this.post('/auth/register', userData);
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  async login(email, password) {
    const res = await this.post('/auth/login', { email, password });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Users
  getProfile() {
    return this.get('/users/profile');
  }

  updateProfile(data) {
    return this.put('/users/profile', data);
  }

  getUserById(id) {
    return this.get(`/users/${id}`);
  }

  searchUsers(query) {
    return this.get(`/users/search?q=${query}`);
  }

  // Posts
  getPosts(page = 1) {
    return this.get(`/posts?page=${page}`);
  }

  createPost(data) {
    return this.post('/posts', data);
  }

  getPost(id) {
    return this.get(`/posts/${id}`);
  }

  updatePost(id, data) {
    return this.put(`/posts/${id}`, data);
  }

  deletePost(id) {
    return this.delete(`/posts/${id}`);
  }

  // Comments
  createComment(data) {
    return this.post('/comments', data);
  }

  getComments(postId) {
    return this.get(`/comments/post/${postId}`);
  }

  deleteComment(id) {
    return this.delete(`/comments/${id}`);
  }

  // Likes
  likePost(postId) {
    return this.post('/likes', { postId });
  }

  unlikePost(postId) {
    return this.delete(`/likes/${postId}`);
  }

  // Messages
  getConversations() {
    return this.get('/messages');
  }

  openConversation(userId) {
    return this.get(`/messages/${userId}`);
  }

  sendMessage(data) {
    return this.post('/messages', data);
  }

  // Friends
  sendFriendRequest(userId) {
    return this.post(`/friends/request/${userId}`, {});
  }

  respondFriendRequest(userId, accept) {
    return this.post(`/friends/respond/${userId}`, { accept });
  }

  getFriendsList() {
    return this.get('/friends');
  }

  getFriendRequests() {
    return this.get('/friends/requests');
  }

  // Notifications
  getNotifications() {
    return this.get('/notifications');
  }

  markNotificationRead(id) {
    return this.patch(`/notifications/${id}`, { read: true });
  }

  markAllNotificationsRead() {
    return this.patch('/notifications/read-all', {});
  }

  // Admin
  getUsers() {
    return this.get('/admin/users');
  }

  deleteUser(id) {
    return this.delete(`/admin/users/${id}`);
  }

  getStats() {
    return this.get('/admin/stats');
  }
}

const api = new API();

// Utility helpers
const showToast = (message, type = 'info', duration = 3000) => {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 300);
  }, duration);
};

const showSpinner = (show = true) => {
  const spinner = document.getElementById('loading-spinner');
  if (show) {
    spinner.classList.remove('hidden');
  } else {
    spinner.classList.add('hidden');
  }
};

const showModal = (title, content, actions = []) => {
  const overlay = document.getElementById('modal-overlay');
  const container = document.getElementById('modal-container');

  container.innerHTML = `
    <div class="modal-header">
      <h2>${title}</h2>
      <button class="btn btn-ghost" onclick="closeModal()">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="modal-body">
      ${content}
    </div>
    <div class="modal-footer">
      ${actions.map(action => `
        <button class="btn ${action.class || 'btn-primary'}" onclick="${action.action}">
          ${action.label}
        </button>
      `).join('')}
    </div>
  `;

  overlay.classList.remove('hidden');
  container.classList.remove('hidden');
};

const closeModal = () => {
  const overlay = document.getElementById('modal-overlay');
  const container = document.getElementById('modal-container');
  overlay.classList.add('hidden');
  container.classList.add('hidden');
};

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes}m`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;
  
  return date.toLocaleDateString('fr-FR');
};

// Get initials for avatar
const getInitials = (name) => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};
