// Main App
class App {
  constructor() {
    this.currentUser = null;
    this.socket = io();
    this.page = 'login';
    this.init();
  }

  async init() {
    this.setupSocketEvents();
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const user = await api.getProfile();
        this.currentUser = user;
        localStorage.setItem('user', JSON.stringify(user));
        this.socket.emit('user-online', user.id);
        this.renderApp();
      } catch (error) {
        this.renderLoginPage();
      }
    } else {
      this.renderLoginPage();
    }
  }

  setupSocketEvents() {
    this.socket.on('user-status', (data) => {
      this.updateUserStatus(data.userId, data.status);
    });

    this.socket.on('receive-message', (data) => {
      this.handleNewMessage(data);
    });

    this.socket.on('user-typing', (data) => {
      this.showTypingIndicator(data);
    });

    this.socket.on('user-stop-typing', (data) => {
      this.hideTypingIndicator(data.senderId);
    });
  }

  // ============ LOGIN PAGE ============
  renderLoginPage() {
    this.page = 'login';
    const root = document.getElementById('root');
    root.innerHTML = `
      <div class="login-container" style="
        min-height: 100vh;
        background: linear-gradient(135deg, #0D47A1, #4DA3FF);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      ">
        <div class="login-box" style="
          background: white;
          border-radius: 12px;
          padding: 40px;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        ">
          <h1 style="
            text-align: center;
            margin-bottom: 30px;
            color: #0D47A1;
            font-size: 32px;
          ">
            <i class="fas fa-paper-plane"></i> Kontact
          </h1>

          <div id="login-tab" class="tab-content">
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="login-email" placeholder="votre@email.com" />
            </div>
            <div class="form-group">
              <label>Mot de passe</label>
              <input type="password" id="login-password" placeholder="••••••••" />
            </div>
            <button class="btn btn-primary" style="width: 100%;" onclick="app.handleLogin()">
              Se connecter
            </button>
            <p style="text-align: center; margin-top: 20px; color: #6B7280;">
              Pas encore de compte ? 
              <a href="#" onclick="app.switchToRegister(); return false;">S'inscrire</a>
            </p>
          </div>

          <div id="register-tab" class="tab-content hidden">
            <div class="form-group">
              <label>Nom complet</label>
              <input type="text" id="register-name" placeholder="Jean Dupont" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" id="register-email" placeholder="votre@email.com" />
            </div>
            <div class="form-group">
              <label>Mot de passe</label>
              <input type="password" id="register-password" placeholder="••••••••" />
            </div>
            <div class="form-group">
              <label>Confirmer mot de passe</label>
              <input type="password" id="register-confirm" placeholder="••••••••" />
            </div>
            <button class="btn btn-primary" style="width: 100%;" onclick="app.handleRegister()">
              S'inscrire
            </button>
            <p style="text-align: center; margin-top: 20px; color: #6B7280;">
              Vous avez un compte ? 
              <a href="#" onclick="app.switchToLogin(); return false;">Se connecter</a>
            </p>
          </div>
        </div>
      </div>
    `;
  }

  switchToRegister() {
    document.getElementById('login-tab').classList.add('hidden');
    document.getElementById('register-tab').classList.remove('hidden');
  }

  switchToLogin() {
    document.getElementById('register-tab').classList.add('hidden');
    document.getElementById('login-tab').classList.remove('hidden');
  }

  async handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      showToast('Remplissez tous les champs', 'error');
      return;
    }

    try {
      showSpinner(true);
      const res = await api.login(email, password);
      this.currentUser = res.user;
      localStorage.setItem('user', JSON.stringify(res.user));
      this.socket.emit('user-online', res.user.id);
      showSpinner(false);
      showToast('Connexion réussie!', 'success');
      this.renderApp();
    } catch (error) {
      showSpinner(false);
      showToast(error.message, 'error');
    }
  }

  async handleRegister() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;

    if (!name || !email || !password || !confirm) {
      showToast('Remplissez tous les champs', 'error');
      return;
    }

    if (password !== confirm) {
      showToast('Les mots de passe ne correspondent pas', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Le mot de passe doit contenir au moins 6 caractères', 'error');
      return;
    }

    try {
      showSpinner(true);
      const res = await api.register({ name, email, password });
      this.currentUser = res.user;
      localStorage.setItem('user', JSON.stringify(res.user));
      this.socket.emit('user-online', res.user.id);
      showSpinner(false);
      showToast('Compte créé avec succès!', 'success');
      this.renderApp();
    } catch (error) {
      showSpinner(false);
      showToast(error.message, 'error');
    }
  }

  // ============ MAIN APP ============
  renderApp() {
    const root = document.getElementById('root');
    root.innerHTML = `
      <nav>
        <div class="nav-content">
          <a class="nav-brand" href="#" onclick="app.goToFeed(); return false;">
            <i class="fas fa-paper-plane"></i> Kontact
          </a>
          <ul class="nav-menu">
            <li class="nav-item">
              <button class="nav-link" onclick="app.goToFeed()">
                <i class="fas fa-home"></i> Accueil
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link" onclick="app.goToMessages()">
                <i class="fas fa-comments"></i> Messages
                <span id="message-badge" class="badge-notification hidden">0</span>
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link" onclick="app.goToNotifications()">
                <i class="fas fa-bell"></i> Notifications
                <span id="notif-badge" class="badge-notification hidden">0</span>
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link" onclick="app.goToProfile()">
                <i class="fas fa-user"></i> Profil
              </button>
            </li>
            <li class="nav-item">
              <button class="nav-link" onclick="app.logout()">
                <i class="fas fa-sign-out-alt"></i> Déconnexion
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <div class="main-layout">
        <div class="sidebar">
          ${this.renderSidebar()}
        </div>
        <div class="main-content">
          <div id="page-container"></div>
        </div>
      </div>
    `;

    this.goToFeed();
  }

  renderSidebar() {
    return `
      <div class="sidebar-item active" onclick="app.goToFeed()">
        <i class="fas fa-home" style="color: #4DA3FF;"></i>
        <span>Accueil</span>
      </div>
      <div class="sidebar-item" onclick="app.goToFriends()">
        <i class="fas fa-users"></i>
        <span>Amis</span>
      </div>
      <div class="sidebar-item" onclick="app.goToMessages()">
        <i class="fas fa-comments"></i>
        <span>Messages</span>
      </div>
      <div class="sidebar-item" onclick="app.goToNotifications()">
        <i class="fas fa-bell"></i>
        <span>Notifications</span>
      </div>
      <div class="sidebar-item" onclick="app.goToProfile()">
        <i class="fas fa-user"></i>
        <span>Profil</span>
      </div>
      <div class="sidebar-item" onclick="app.goToSettings()">
        <i class="fas fa-cog"></i>
        <span>Paramètres</span>
      </div>
      ${this.currentUser?.role === 'admin' ? `
        <div class="sidebar-item" onclick="app.goToAdmin()">
          <i class="fas fa-shield-alt"></i>
          <span>Admin</span>
        </div>
      ` : ''}
    `;
  }

  // ============ FEED PAGE ============
  async goToFeed() {
    this.page = 'feed';
    this.updateSidebar();
    const container = document.getElementById('page-container');
    
    container.innerHTML = `
      <div class="page-content">
        <div class="card" style="margin-bottom: 30px;">
          <div style="display: flex; gap: 15px; align-items: flex-start;">
            <div class="avatar avatar-lg">
              ${this.currentUser.avatar ? `<img src="${this.currentUser.avatar}" />` : getInitials(this.currentUser.name)}
            </div>
            <div style="flex: 1;">
              <textarea id="post-content" placeholder="À quoi pensez-vous ?" style="
                margin-bottom: 15px;
                border-radius: 12px;
                min-height: 80px;
              "></textarea>
              <div style="display: flex; gap: 10px;">
                <button class="btn btn-ghost" style="flex: 1; justify-content: center;">
                  <i class="fas fa-image"></i> Photo
                </button>
                <button class="btn btn-ghost" style="flex: 1; justify-content: center;">
                  <i class="fas fa-smile"></i> Émotion
                </button>
                <button class="btn btn-primary" style="flex: 1;" onclick="app.createPost()">
                  <i class="fas fa-paper-plane"></i> Publier
                </button>
              </div>
            </div>
          </div>
        </div>

        <div id="feed-posts" style="display: flex; flex-direction: column; gap: 20px;">
          <div style="text-align: center; padding: 40px; color: #9CA3AF;">
            <i class="fas fa-spinner fa-spin" style="font-size: 32px;"></i>
            <p style="margin-top: 15px;">Chargement des publications...</p>
          </div>
        </div>
      </div>
    `;

    await this.loadFeedPosts();
  }

  async loadFeedPosts() {
    try {
      const posts = await api.getPosts();
      const container = document.getElementById('feed-posts');
      
      if (!posts || posts.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #9CA3AF;">
            <i class="fas fa-inbox" style="font-size: 48px;"></i>
            <p style="margin-top: 15px;">Aucune publication pour le moment</p>
          </div>
        `;
        return;
      }

      container.innerHTML = posts.map(post => this.renderPostCard(post)).join('');
    } catch (error) {
      console.error(error);
    }
  }

  renderPostCard(post) {
    return `
      <div class="post">
        <div class="post-header">
          <div class="post-author">
            <div class="avatar">
              ${post.author.avatar ? `<img src="${post.author.avatar}" />` : getInitials(post.author.name)}
            </div>
            <div>
              <h3 style="margin: 0;">${post.author.name}</h3>
              <p style="margin: 0; font-size: 13px; color: #9CA3AF;">${formatDate(post.createdAt)}</p>
            </div>
          </div>
          ${this.currentUser.id === post.author.id ? `
            <button class="btn btn-ghost btn-sm" onclick="app.showPostMenu('${post.id}')">
              <i class="fas fa-ellipsis-v"></i>
            </button>
          ` : ''}
        </div>

        <div class="post-content">
          ${post.content}
        </div>

        ${post.image ? `<img src="${post.image}" class="post-image" />` : ''}

        <div class="post-actions">
          <button class="action-btn" onclick="app.toggleLike('${post.id}')">
            <i class="fas fa-heart"></i>
            <span>${post.likes || 0}</span>
          </button>
          <button class="action-btn" onclick="app.showComments('${post.id}')">
            <i class="fas fa-comment"></i>
            <span>${post.comments || 0}</span>
          </button>
          <button class="action-btn" onclick="app.sharePost('${post.id}')">
            <i class="fas fa-share"></i>
          </button>
        </div>

        <div id="comments-${post.id}" style="margin-top: 15px; border-top: 1px solid #F3F4F6; padding-top: 15px; display: none;">
          ${this.renderCommentsSection(post.id)}
        </div>
      </div>
    `;
  }

  renderCommentsSection(postId) {
    return `
      <div id="comments-list-${postId}" style="margin-bottom: 15px;"></div>
      <div style="display: flex; gap: 10px;">
        <div class="avatar avatar-sm">
          ${this.currentUser.avatar ? `<img src="${this.currentUser.avatar}" />` : getInitials(this.currentUser.name)}
        </div>
        <div style="flex: 1;">
          <div style="display: flex; gap: 10px;">
            <input type="text" id="comment-input-${postId}" placeholder="Ajouter un commentaire..." style="margin: 0;" />
            <button class="btn btn-primary btn-sm" onclick="app.addComment('${postId}')">
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  async createPost() {
    const content = document.getElementById('post-content').value;
    
    if (!content.trim()) {
      showToast('Écrivez quelque chose!', 'warning');
      return;
    }

    try {
      showSpinner(true);
      await api.createPost({ content });
      showSpinner(false);
      showToast('Publication créée!', 'success');
      document.getElementById('post-content').value = '';
      this.loadFeedPosts();
    } catch (error) {
      showSpinner(false);
      showToast(error.message, 'error');
    }
  }

  async toggleLike(postId) {
    try {
      await api.likePost(postId);
      this.loadFeedPosts();
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async showComments(postId) {
    const commentDiv = document.getElementById(`comments-${postId}`);
    commentDiv.style.display = commentDiv.style.display === 'none' ? 'block' : 'none';
    
    if (commentDiv.style.display === 'block') {
      try {
        const comments = await api.getComments(postId);
        const commentsList = document.getElementById(`comments-list-${postId}`);
        commentsList.innerHTML = comments.map(comment => `
          <div style="display: flex; gap: 10px; margin-bottom: 10px;">
            <div class="avatar avatar-sm">
              ${comment.author.avatar ? `<img src="${comment.author.avatar}" />` : getInitials(comment.author.name)}
            </div>
            <div style="flex: 1;">
              <div style="background: #F3F4F6; padding: 10px; border-radius: 8px;">
                <p style="margin: 0; font-weight: 600; font-size: 13px;">${comment.author.name}</p>
                <p style="margin: 5px 0 0 0;">${comment.content}</p>
              </div>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #9CA3AF;">${formatDate(comment.createdAt)}</p>
            </div>
          </div>
        `).join('');
      } catch (error) {
        console.error(error);
      }
    }
  }

  async addComment(postId) {
    const input = document.getElementById(`comment-input-${postId}`);
    const content = input.value;

    if (!content.trim()) return;

    try {
      await api.createComment({ postId, content });
      input.value = '';
      this.showComments(postId);
      this.showComments(postId);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  sharePost(postId) {
    showToast('Partage en développement', 'info');
  }

  showPostMenu(postId) {
    showModal('Options', `
      <button class="btn btn-danger" style="width: 100%; margin-bottom: 10px;" onclick="app.deletePost('${postId}')">
        <i class="fas fa-trash"></i> Supprimer
      </button>
      <button class="btn btn-secondary" style="width: 100%;" onclick="closeModal()">
        Annuler
      </button>
    `);
  }

  async deletePost(postId) {
    try {
      await api.deletePost(postId);
      closeModal();
      showToast('Publication supprimée', 'success');
      this.loadFeedPosts();
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  // ============ MESSAGES PAGE ============
  async goToMessages() {
    this.page = 'messages';
    this.updateSidebar();
    const container = document.getElementById('page-container');
    
    container.innerHTML = `
      <div class="message-container">
        <div class="message-list" id="message-list">
          <div style="text-align: center; padding: 20px; color: #9CA3AF;">
            <i class="fas fa-spinner fa-spin"></i> Chargement...
          </div>
        </div>
        <div class="message-chat" id="message-chat">
          <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #9CA3AF;">
            <div style="text-align: center;">
              <i class="fas fa-comments" style="font-size: 48px;"></i>
              <p style="margin-top: 15px;">Sélectionnez une conversation</p>
            </div>
          </div>
        </div>
      </div>
    `;

    await this.loadConversations();
  }

  async loadConversations() {
    try {
      const conversations = await api.getConversations();
      const list = document.getElementById('message-list');
      
      list.innerHTML = conversations.map(conv => `
        <div class="message-item" onclick="app.openConversation('${conv.userId}', '${conv.userName}')">
          <div class="avatar">
            ${conv.avatar ? `<img src="${conv.avatar}" />` : getInitials(conv.userName)}
          </div>
          <div class="message-item-info">
            <div class="message-item-name">${conv.userName}</div>
            <div class="message-item-preview">${conv.lastMessage || 'Aucun message'}</div>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error(error);
    }
  }

  async openConversation(userId, userName) {
    try {
      const messages = await api.openConversation(userId);
      const chat = document.getElementById('message-chat');
      
      chat.innerHTML = `
        <div class="message-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <h3 style="margin: 0;">${userName}</h3>
            <span id="user-status-${userId}" class="badge badge-success" style="display: none;">
              <i class="fas fa-circle" style="font-size: 8px;"></i> En ligne
            </span>
          </div>
        </div>
        <div class="message-body" id="message-body">
          ${messages.map(msg => `
            <div class="message-bubble ${msg.senderId === this.currentUser.id ? 'sent' : 'received'}">
              <div class="message-text">${msg.content}</div>
              <div class="message-time">${formatDate(msg.createdAt)}</div>
            </div>
          `).join('')}
        </div>
        <div class="message-input">
          <input type="text" id="message-input" placeholder="Écrivez un message..." onkeypress="app.handleMessageKeypress(event, '${userId}')" />
          <button class="btn btn-primary" onclick="app.sendMessage('${userId}')">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      `;

      // Scroll to bottom
      document.getElementById('message-body').scrollTop = document.getElementById('message-body').scrollHeight;
    } catch (error) {
      console.error(error);
    }
  }

  async sendMessage(userId) {
    const input = document.getElementById('message-input');
    const content = input.value;

    if (!content.trim()) return;

    try {
      await api.sendMessage({ receiverId: userId, content });
      this.socket.emit('send-message', {
        receiverId: userId,
        content,
        senderId: this.currentUser.id,
        senderName: this.currentUser.name
      });

      input.value = '';
      this.openConversation(userId, '');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  handleMessageKeypress(event, userId) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.sendMessage(userId);
    }
  }

  // ============ NOTIFICATIONS PAGE ============
  async goToNotifications() {
    this.page = 'notifications';
    this.updateSidebar();
    const container = document.getElementById('page-container');
    
    container.innerHTML = `
      <div class="page-content">
        <h2 style="margin-bottom: 30px;">
          <i class="fas fa-bell"></i> Notifications
        </h2>
        <div id="notifications-list" style="display: flex; flex-direction: column; gap: 15px;">
          <div style="text-align: center; padding: 40px; color: #9CA3AF;">
            <i class="fas fa-spinner fa-spin" style="font-size: 32px;"></i>
            <p style="margin-top: 15px;">Chargement...</p>
          </div>
        </div>
      </div>
    `;

    await this.loadNotifications();
  }

  async loadNotifications() {
    try {
      const notifications = await api.getNotifications();
      const list = document.getElementById('notifications-list');
      
      if (!notifications || notifications.length === 0) {
        list.innerHTML = `
          <div style="text-align: center; padding: 40px; color: #9CA3AF;">
            <i class="fas fa-inbox" style="font-size: 48px;"></i>
            <p style="margin-top: 15px;">Aucune notification</p>
          </div>
        `;
        return;
      }

      list.innerHTML = notifications.map(notif => `
        <div class="card" style="${notif.read ? 'background: #F3F4F6;' : 'border-left: 4px solid #4DA3FF;'}">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div style="flex: 1;">
              <p style="margin: 0; font-weight: 600;">${notif.title}</p>
              <p style="margin: 5px 0 0 0; color: #6B7280;">${notif.message}</p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #9CA3AF;">${formatDate(notif.createdAt)}</p>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="app.markNotificationRead('${notif.id}')">
              <i class="fas fa-check"></i>
            </button>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error(error);
    }
  }

  async markNotificationRead(id) {
    try {
      await api.markNotificationRead(id);
      this.loadNotifications();
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  // ============ PROFILE PAGE ============
  async goToProfile() {
    this.page = 'profile';
    this.updateSidebar();
    const container = document.getElementById('page-container');
    
    container.innerHTML = `
      <div class="page-content">
        <div class="card" style="margin-bottom: 30px; text-align: center;">
          <div class="avatar avatar-lg" style="margin: 0 auto 20px auto;">
            ${this.currentUser.avatar ? `<img src="${this.currentUser.avatar}" />` : getInitials(this.currentUser.name)}
          </div>
          <h2 style="margin-bottom: 5px;">${this.currentUser.name}</h2>
          <p style="color: #6B7280; margin-bottom: 20px;">@${this.currentUser.email.split('@')[0]}</p>
          <button class="btn btn-primary" onclick="app.goToEditProfile()">
            <i class="fas fa-edit"></i> Modifier profil
          </button>
        </div>

        <div class="card" style="margin-bottom: 30px;">
          <h3 style="margin-bottom: 20px;">Informations</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <div>
              <p style="font-size: 13px; color: #9CA3AF; margin-bottom: 5px;">Email</p>
              <p style="margin: 0; font-weight: 600;">${this.currentUser.email}</p>
            </div>
            <div>
              <p style="font-size: 13px; color: #9CA3AF; margin-bottom: 5px;">Membre depuis</p>
              <p style="margin: 0; font-weight: 600;">${formatDate(this.currentUser.createdAt)}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <h3 style="margin-bottom: 20px;">Mes publications</h3>
          <div id="user-posts" style="display: flex; flex-direction: column; gap: 15px;">
            <div style="text-align: center; padding: 20px; color: #9CA3AF;">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
          </div>
        </div>
      </div>
    `;

    await this.loadUserPosts();
  }

  async loadUserPosts() {
    try {
      const posts = await api.getPosts();
      const userPosts = posts.filter(p => p.author.id === this.currentUser.id);
      const container = document.getElementById('user-posts');
      
      if (!userPosts || userPosts.length === 0) {
        container.innerHTML = `
          <p style="text-align: center; color: #9CA3AF;">Aucune publication</p>
        `;
        return;
      }

      container.innerHTML = userPosts.map(post => `
        <div style="padding: 15px; background: #F7FBFF; border-radius: 8px;">
          <p style="margin: 0 0 10px 0;">${post.content}</p>
          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button class="btn btn-secondary btn-sm" onclick="app.goToFeed()">
              <i class="fas fa-eye"></i> Voir
            </button>
            <button class="btn btn-danger btn-sm" onclick="app.deletePost('${post.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `).join('');
    } catch (error) {
      console.error(error);
    }
  }

  goToEditProfile() {
    const container = document.getElementById('page-container');
    container.innerHTML = `
      <div class="page-content">
        <div class="card">
          <h2 style="margin-bottom: 30px;">Modifier profil</h2>
          <div class="form-group">
            <label>Nom</label>
            <input type="text" id="edit-name" value="${this.currentUser.name}" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="edit-email" value="${this.currentUser.email}" disabled />
          </div>
          <div class="form-group">
            <label>Bio</label>
            <textarea id="edit-bio" placeholder="Parlez de vous...">${this.currentUser.bio || ''}</textarea>
          </div>
          <div style="display: flex; gap: 10px;">
            <button class="btn btn-primary" onclick="app.updateProfile()">
              <i class="fas fa-save"></i> Enregistrer
            </button>
            <button class="btn btn-secondary" onclick="app.goToProfile()">
              Annuler
            </button>
          </div>
        </div>
      </div>
    `;
  }

  async updateProfile() {
    const name = document.getElementById('edit-name').value;
    const bio = document.getElementById('edit-bio').value;

    if (!name) {
      showToast('Le nom est requis', 'error');
      return;
    }

    try {
      showSpinner(true);
      await api.updateProfile({ name, bio });
      this.currentUser.name = name;
      this.currentUser.bio = bio;
      localStorage.setItem('user', JSON.stringify(this.currentUser));
      showSpinner(false);
      showToast('Profil mis à jour!', 'success');
      this.goToProfile();
    } catch (error) {
      showSpinner(false);
      showToast(error.message, 'error');
    }
  }

  // ============ FRIENDS PAGE ============
  async goToFriends() {
    this.page = 'friends';
    this.updateSidebar();
    const container = document.getElementById('page-container');
    
    container.innerHTML = `
      <div class="page-content">
        <h2 style="margin-bottom: 30px;"><i class="fas fa-users"></i> Amis</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div class="card" onclick="app.showFriendsList()" style="cursor: pointer; text-align: center; padding: 30px;">
            <i class="fas fa-user-friends" style="font-size: 32px; color: #4DA3FF; margin-bottom: 10px; display: block;"></i>
            <h3 style="margin: 0;">Vos amis</h3>
            <p id="friends-count" style="color: #6B7280;">Chargement...</p>
          </div>
          <div class="card" onclick="app.showFriendRequests()" style="cursor: pointer; text-align: center; padding: 30px;">
            <i class="fas fa-user-plus" style="font-size: 32px; color: #F59E0B; margin-bottom: 10px; display: block;"></i>
            <h3 style="margin: 0;">Demandes</h3>
            <p id="requests-count" style="color: #6B7280;">Chargement...</p>
          </div>
        </div>

        <div class="card">
          <h3 style="margin-bottom: 20px;">Chercher des amis</h3>
          <div style="display: flex; gap: 10px; margin-bottom: 20px;">
            <input type="text" id="search-friends" placeholder="Chercher un utilisateur..." />
            <button class="btn btn-primary" onclick="app.searchFriends()">
              <i class="fas fa-search"></i>
            </button>
          </div>
          <div id="search-results"></div>
        </div>
      </div>
    `;

    await this.loadFriendsStats();
  }

  async loadFriendsStats() {
    try {
      const friends = await api.getFriendsList();
      const requests = await api.getFriendRequests();
      document.getElementById('friends-count').textContent = `${friends.length} amis`;
      document.getElementById('requests-count').textContent = `${requests.length} demandes`;
    } catch (error) {
      console.error(error);
    }
  }

  async showFriendsList() {
    try {
      const friends = await api.getFriendsList();
      showModal('Mes amis', `
        <div style="display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto;">
          ${friends.map(friend => `
            <div class="card" style="display: flex; align-items: center; gap: 10px; padding: 15px;">
              <div class="avatar">
                ${friend.avatar ? `<img src="${friend.avatar}" />` : getInitials(friend.name)}
              </div>
              <div style="flex: 1;">
                <p style="margin: 0; font-weight: 600;">${friend.name}</p>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="app.goToMessages()">
                <i class="fas fa-comment"></i>
              </button>
            </div>
          `).join('')}
        </div>
      `);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async showFriendRequests() {
    try {
      const requests = await api.getFriendRequests();
      showModal('Demandes d\'amis', `
        <div style="display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto;">
          ${requests.map(req => `
            <div class="card" style="display: flex; align-items: center; gap: 10px; padding: 15px;">
              <div class="avatar">
                ${req.avatar ? `<img src="${req.avatar}" />` : getInitials(req.name)}
              </div>
              <div style="flex: 1;">
                <p style="margin: 0; font-weight: 600;">${req.name}</p>
              </div>
              <button class="btn btn-primary btn-sm" onclick="app.respondFriendRequest('${req.id}', true)">
                <i class="fas fa-check"></i>
              </button>
              <button class="btn btn-danger btn-sm" onclick="app.respondFriendRequest('${req.id}', false)">
                <i class="fas fa-times"></i>
              </button>
            </div>
          `).join('')}
        </div>
      `);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async searchFriends() {
    const query = document.getElementById('search-friends').value;
    if (!query) return;

    try {
      const users = await api.searchUsers(query);
      const resultsDiv = document.getElementById('search-results');
      
      resultsDiv.innerHTML = users.map(user => `
        <div class="card" style="display: flex; align-items: center; gap: 10px; padding: 15px; margin-bottom: 10px;">
          <div class="avatar">
            ${user.avatar ? `<img src="${user.avatar}" />` : getInitials(user.name)}
          </div>
          <div style="flex: 1;">
            <p style="margin: 0; font-weight: 600;">${user.name}</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="app.sendFriendRequest('${user.id}')">
            <i class="fas fa-user-plus"></i> Ajouter
          </button>
        </div>
      `).join('');
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async sendFriendRequest(userId) {
    try {
      await api.sendFriendRequest(userId);
      showToast('Demande d\'ami envoyée!', 'success');
      this.loadFriendsStats();
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async respondFriendRequest(userId, accept) {
    try {
      await api.respondFriendRequest(userId, accept);
      closeModal();
      showToast(accept ? 'Ami ajouté!' : 'Demande refusée', 'success');
      this.loadFriendsStats();
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  // ============ SETTINGS PAGE ============
  goToSettings() {
    this.page = 'settings';
    this.updateSidebar();
    const container = document.getElementById('page-container');
    
    container.innerHTML = `
      <div class="page-content">
        <h2 style="margin-bottom: 30px;"><i class="fas fa-cog"></i> Paramètres</h2>
        
        <div class="card" style="margin-bottom: 20px;">
          <h3 style="margin-bottom: 20px;">Compte</h3>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #F3F4F6;">
            <div>
              <p style="margin: 0; font-weight: 600;">Changer mot de passe</p>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #6B7280;">Sécurisez votre compte</p>
            </div>
            <button class="btn btn-secondary" onclick="app.showChangePassword()">
              <i class="fas fa-key"></i> Changer
            </button>
          </div>
        </div>

        <div class="card" style="margin-bottom: 20px;">
          <h3 style="margin-bottom: 20px;">Confidentialité</h3>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #F3F4F6;">
            <div>
              <p style="margin: 0; font-weight: 600;">Profil public</p>
              <p style="margin: 5px 0 0 0; font-size: 13px; color: #6B7280;">Autoriser les autres à voir votre profil</p>
            </div>
            <label style="position: relative; display: inline-block; width: 50px; height: 24px;">
              <input type="checkbox" style="opacity: 0; width: 0; height: 0;" />
              <span style="
                position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
                background-color: #ccc; transition: 0.4s; border-radius: 24px;
              "></span>
            </label>
          </div>
        </div>

        <div class="card">
          <h3 style="margin-bottom: 20px;">Danger</h3>
          <button class="btn btn-danger" style="width: 100%;" onclick="app.confirmLogout()">
            <i class="fas fa-sign-out-alt"></i> Déconnexion
          </button>
        </div>
      </div>
    `;
  }

  showChangePassword() {
    showModal('Changer mot de passe', `
      <div class="form-group">
        <label>Mot de passe actuel</label>
        <input type="password" id="current-pwd" placeholder="••••••••" />
      </div>
      <div class="form-group">
        <label>Nouveau mot de passe</label>
        <input type="password" id="new-pwd" placeholder="••••••••" />
      </div>
      <div class="form-group">
        <label>Confirmer</label>
        <input type="password" id="confirm-pwd" placeholder="••••••••" />
      </div>
    `, [
      { label: 'Enregistrer', action: 'app.updatePassword()' },
      { label: 'Annuler', action: 'closeModal()', class: 'btn-secondary' }
    ]);
  }

  async updatePassword() {
    showToast('Fonctionnalité en développement', 'info');
  }

  confirmLogout() {
    showModal('Déconnexion', `
      <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
    `, [
      { label: 'Déconnexion', action: 'app.logout()', class: 'btn-danger' },
      { label: 'Annuler', action: 'closeModal()', class: 'btn-secondary' }
    ]);
  }

  // ============ ADMIN PAGE ============
  async goToAdmin() {
    this.page = 'admin';
    this.updateSidebar();
    const container = document.getElementById('page-container');
    
    container.innerHTML = `
      <div class="page-content">
        <h2 style="margin-bottom: 30px;"><i class="fas fa-shield-alt"></i> Administration</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;" id="admin-stats">
          <div style="text-align: center; padding: 30px; background: white; border-radius: 12px;">
            <i class="fas fa-spinner fa-spin"></i> Chargement...
          </div>
        </div>

        <div class="card">
          <h3 style="margin-bottom: 20px;">Gestion des utilisateurs</h3>
          <button class="btn btn-primary" onclick="app.showAdminUsers()">
            <i class="fas fa-users"></i> Voir tous les utilisateurs
          </button>
        </div>
      </div>
    `;

    await this.loadAdminStats();
  }

  async loadAdminStats() {
    try {
      const stats = await api.getStats();
      document.getElementById('admin-stats').innerHTML = `
        <div class="card" style="text-align: center;">
          <i class="fas fa-users" style="font-size: 32px; color: #4DA3FF; margin-bottom: 10px; display: block;"></i>
          <h3 style="margin: 0;">${stats.users}</h3>
          <p style="color: #6B7280;">Utilisateurs</p>
        </div>
        <div class="card" style="text-align: center;">
          <i class="fas fa-newspaper" style="font-size: 32px; color: #22C55E; margin-bottom: 10px; display: block;"></i>
          <h3 style="margin: 0;">${stats.posts}</h3>
          <p style="color: #6B7280;">Publications</p>
        </div>
      `;
    } catch (error) {
      console.error(error);
    }
  }

  async showAdminUsers() {
    try {
      const users = await api.getUsers();
      showModal('Utilisateurs', `
        <div style="max-height: 500px; overflow-y: auto;">
          ${users.map(user => `
            <div class="card" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; margin-bottom: 10px;">
              <div>
                <p style="margin: 0; font-weight: 600;">${user.name}</p>
                <p style="margin: 5px 0 0 0; font-size: 13px; color: #6B7280;">${user.email}</p>
              </div>
              <button class="btn btn-danger btn-sm" onclick="app.adminDeleteUser('${user.id}')">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          `).join('')}
        </div>
      `);
    } catch (error) {
      showToast(error.message, 'error');
    }
  }

  async adminDeleteUser(userId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await api.deleteUser(userId);
        showToast('Utilisateur supprimé', 'success');
        this.goToAdmin();
      } catch (error) {
        showToast(error.message, 'error');
      }
    }
  }

  // ============ UTILITY METHODS ============
  updateSidebar() {
    const items = document.querySelectorAll('.sidebar-item');
    items.forEach(item => item.classList.remove('active'));
    
    const pageMap = {
      feed: 0,
      friends: 1,
      messages: 2,
      notifications: 3,
      profile: 4,
      settings: 5,
      admin: 6
    };
    
    if (pageMap[this.page] !== undefined && items[pageMap[this.page]]) {
      items[pageMap[this.page]].classList.add('active');
    }
  }

  updateUserStatus(userId, status) {
    const badge = document.getElementById(`user-status-${userId}`);
    if (badge) {
      badge.style.display = status === 'online' ? 'inline-flex' : 'none';
    }
  }

  handleNewMessage(data) {
    showToast(`${data.senderName}: ${data.content}`, 'info');
  }

  showTypingIndicator(data) {
    // TODO: Show typing indicator
  }

  hideTypingIndicator(senderId) {
    // TODO: Hide typing indicator
  }

  logout() {
    api.logout();
    this.renderLoginPage();
  }
}

// Initialize app
const app = new App();
