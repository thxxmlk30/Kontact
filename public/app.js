const api = {
  async request(path, options = {}) {
    const headers = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
    const res = await fetch(`/api${path}`, {
      credentials: 'same-origin',
      ...options,
      headers: { ...headers, ...(options.headers || {}) }
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Erreur reseau');
    return data;
  },
  get(path) { return this.request(path); },
  post(path, body) {
    return this.request(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body || {})
    });
  },
  put(path, body) {
    return this.request(path, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body || {})
    });
  },
  patch(path, body) { return this.request(path, { method: 'PATCH', body: JSON.stringify(body || {}) }); },
  delete(path) { return this.request(path, { method: 'DELETE' }); }
};

const state = {
  user: null,
  page: 'feed',
  posts: [],
  activeChat: null,
  socket: null
};

const app = document.getElementById('app');
const toast = document.getElementById('toast');

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const fileUrl = (name) => {
  if (!name || name.startsWith('default-')) return '';
  return `/uploads/${name}`;
};

const initials = (user = {}) => {
  const value = user.fullname || user.username || 'U';
  return value.split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
};

const avatar = (user = {}, size = '') => {
  const src = fileUrl(user.avatar);
  return `<div class="avatar ${size}">${src ? `<img src="${src}" alt="">` : initials(user)}</div>`;
};

const dateLabel = (value) => {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'maintenant';
  if (min < 60) return `${min} min`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} h`;
  return new Date(value).toLocaleDateString('fr-FR');
};

const notify = (message) => {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => toast.classList.remove('show'), 2600);
};

async function boot() {
  try {
    const { user } = await api.get('/auth/me');
    state.user = user;
    connectSocket();
    renderShell();
    await navigate('feed');
  } catch {
    renderAuth('login');
  }
}

function connectSocket() {
  state.socket = io();
  state.socket.emit('user:connect', String(state.user.id));
  state.socket.on('message:receive', (message) => {
    notify('Nouveau message recu');
    if (state.page === 'messages' && state.activeChat) openChat(state.activeChat.otherUser.id);
  });
  state.socket.on('notification:new', () => {
    if (state.page === 'notifications') loadNotifications();
  });
}

function renderAuth(mode) {
  app.innerHTML = `
    <main class="auth-screen">
      <section class="auth-card">
        <h1 class="brand"><span class="brand-mark">K</span> Kontact</h1>
        <p class="muted">Un reseau social rapide, conversationnel et proche de Telegram.</p>
        <div class="auth-tabs">
          <button class="${mode === 'login' ? 'active' : ''}" data-auth-tab="login">Connexion</button>
          <button class="${mode === 'register' ? 'active' : ''}" data-auth-tab="register">Inscription</button>
        </div>
        ${mode === 'login' ? loginForm() : registerForm()}
      </section>
    </main>
  `;
}

function loginForm() {
  return `
    <form class="form" id="login-form">
      <label class="field"><span>Email</span><input name="email" type="email" required></label>
      <label class="field"><span>Mot de passe</span><input name="password" type="password" required></label>
      <button class="btn btn-primary" type="submit">Se connecter</button>
    </form>
  `;
}

function registerForm() {
  return `
    <form class="form" id="register-form">
      <label class="field"><span>Nom complet</span><input name="fullname" required></label>
      <label class="field"><span>Nom utilisateur</span><input name="username" required></label>
      <label class="field"><span>Email</span><input name="email" type="email" required></label>
      <label class="field"><span>Mot de passe</span><input name="password" type="password" minlength="6" required></label>
      <label class="field"><span>Photo</span><input name="avatar" type="file" accept="image/*"></label>
      <button class="btn btn-primary" type="submit">Creer le compte</button>
    </form>
  `;
}

function renderShell() {
  app.innerHTML = `
    <div class="app-shell">
      <aside class="rail">
        <div class="rail-header">
          <h1 class="brand"><span class="brand-mark">K</span><span class="brand-text">Kontact</span></h1>
        </div>
        <nav class="nav">
          ${navButton('feed', 'Accueil')}
          ${navButton('messages', 'Messages')}
          ${navButton('friends', 'Amis')}
          ${navButton('notifications', 'Notifications')}
          ${navButton('search', 'Recherche')}
          ${navButton('profile', 'Profil')}
          ${state.user.role === 'admin' ? navButton('admin', 'Admin') : ''}
        </nav>
        <div class="rail-user">
          ${avatar(state.user)}
          <div class="user-copy">
            <strong>${escapeHtml(state.user.fullname)}</strong>
            <div class="muted">@${escapeHtml(state.user.username)}</div>
          </div>
        </div>
      </aside>
      <main class="main-panel" id="main-panel"></main>
      <aside class="side-panel" id="side-panel"></aside>
    </div>
  `;
  renderSidePanel();
}

function navButton(page, label) {
  return `<button class="${state.page === page ? 'active' : ''}" data-page="${page}"><span class="nav-label">${label}</span><span>${icon(page)}</span></button>`;
}

function icon(page) {
  return ({ feed: '⌂', messages: '✉', friends: '+', notifications: '•', search: '⌕', profile: '◉', admin: '⚙' })[page] || '•';
}

async function navigate(page) {
  state.page = page;
  document.querySelectorAll('[data-page]').forEach((el) => el.classList.toggle('active', el.dataset.page === page));
  const main = document.getElementById('main-panel');
  main.innerHTML = '<div class="empty">Chargement...</div>';
  if (page === 'feed') return loadFeed();
  if (page === 'messages') return loadMessages();
  if (page === 'friends') return loadFriends();
  if (page === 'notifications') return loadNotifications();
  if (page === 'search') return loadSearch();
  if (page === 'profile') return loadProfile();
  if (page === 'admin') return loadAdmin();
}

function renderSidePanel() {
  const side = document.getElementById('side-panel');
  if (!side) return;
  side.innerHTML = `
    <div class="stack">
      <div class="card stack">
        <div class="row">${avatar(state.user, 'large')}<div><h2>${escapeHtml(state.user.fullname)}</h2><p class="muted">@${escapeHtml(state.user.username)}</p></div></div>
        <p>${escapeHtml(state.user.bio || 'Profil Kontact pret a discuter.')}</p>
        <button class="btn btn-secondary" data-page="profile">Modifier le profil</button>
      </div>
      <div class="card stack">
        <strong>Recherche rapide</strong>
        <input id="quick-search" placeholder="Trouver un utilisateur">
        <div id="quick-results" class="list"></div>
      </div>
      <button class="btn btn-danger" id="logout-btn">Deconnexion</button>
    </div>
  `;
}

async function loadFeed() {
  const main = document.getElementById('main-panel');
  main.innerHTML = `
    <div class="topbar"><div><h1>Fil social</h1><p class="muted">Publiez, reagissez et lancez des conversations.</p></div></div>
    <form class="card stack" id="post-form">
      <div class="row">${avatar(state.user)}<textarea name="content" placeholder="Quoi de neuf ?" required></textarea></div>
      <div class="split">
        <input name="image" type="file" accept="image/*">
        <select name="visibility"><option value="public">Public</option><option value="friends">Amis</option><option value="private">Prive</option></select>
        <button class="btn btn-primary">Publier</button>
      </div>
    </form>
    <section class="stack" id="posts"></section>
  `;
  await refreshPosts();
}

async function refreshPosts() {
  const { posts } = await api.get('/posts');
  state.posts = posts;
  document.getElementById('posts').innerHTML = posts.length ? posts.map(renderPost).join('') : '<div class="card empty">Aucune publication.</div>';
}

function renderPost(post) {
  return `
    <article class="card post-card" data-post="${post.id}">
      <div class="split">
        <div class="row">${avatar(post.author)}<div><strong>${escapeHtml(post.author.fullname)}</strong><div class="muted">@${escapeHtml(post.author.username)} · ${dateLabel(post.created_at)}</div></div></div>
        ${(post.user_id === state.user.id || state.user.role === 'admin') ? `<button class="btn btn-ghost btn-small" data-delete-post="${post.id}">Supprimer</button>` : ''}
      </div>
      <p>${escapeHtml(post.content)}</p>
      ${post.image ? `<img class="post-image" src="${fileUrl(post.image)}" alt="">` : ''}
      <div class="actions">
        <button class="btn btn-ghost btn-small" data-like="${post.id}">${post.user_liked ? 'Aime' : 'J aime'} · ${post.likes_count}</button>
        <button class="btn btn-ghost btn-small" data-comments="${post.id}">Commentaires · ${post.comments_count}</button>
        <button class="btn btn-ghost btn-small" data-share="${post.id}">Partager</button>
      </div>
      <div class="comment-box" id="comments-${post.id}" hidden></div>
    </article>
  `;
}

async function toggleComments(postId) {
  const box = document.getElementById(`comments-${postId}`);
  box.hidden = !box.hidden;
  if (box.hidden) return;
  const { comments } = await api.get(`/comments/post/${postId}`);
  box.innerHTML = `
    <div class="stack">
      ${comments.map((c) => `<div class="row">${avatar(c)}<div><strong>${escapeHtml(c.fullname)}</strong><div>${escapeHtml(c.content)}</div><small class="muted">${dateLabel(c.created_at)}</small></div></div>`).join('') || '<span class="muted">Aucun commentaire</span>'}
      <form class="row" data-comment-form="${postId}">
        <input name="content" placeholder="Ajouter un commentaire" required>
        <button class="btn btn-primary btn-small">Envoyer</button>
      </form>
    </div>
  `;
}

async function loadMessages() {
  document.getElementById('main-panel').innerHTML = `
    <section class="chat-layout">
      <div class="stack"><h1>Messages</h1><div id="conversation-list" class="list"></div></div>
      <div class="chat" id="chat"><div class="empty">Choisissez une conversation.</div></div>
    </section>
  `;
  const { conversations } = await api.get('/messages');
  document.getElementById('conversation-list').innerHTML = conversations.length ? conversations.map((c) => `
    <button class="list-item" data-open-chat="${c.other_user_id}">
      ${avatar(c)}
      <span><strong>${escapeHtml(c.fullname)}</strong><br><small class="muted">${escapeHtml(c.last_message || 'Aucun message')}</small></span>
    </button>
  `).join('') : '<div class="card empty">Cherchez un utilisateur pour demarrer un chat.</div>';
}

async function openChat(userId) {
  const { conversationId, otherUser, messages } = await api.get(`/messages/${userId}`);
  state.activeChat = { conversationId, otherUser };
  document.getElementById('chat').innerHTML = `
    <header class="chat-header"><strong>${escapeHtml(otherUser.fullname)}</strong><div>@${escapeHtml(otherUser.username)}</div></header>
    <div class="messages" id="message-thread">
      ${messages.map((m) => `<div class="bubble ${m.sender_id === state.user.id ? 'mine' : ''}">${escapeHtml(m.content)}<br><small>${dateLabel(m.created_at)}</small></div>`).join('')}
    </div>
    <form class="composer" id="message-form">
      <input name="content" placeholder="Message" autocomplete="off" required>
      <button class="btn btn-primary">Envoyer</button>
    </form>
  `;
  document.getElementById('message-thread').scrollTop = document.getElementById('message-thread').scrollHeight;
}

async function loadFriends() {
  const [{ friends }, { requests }, { suggestions }] = await Promise.all([
    api.get('/friends'),
    api.get('/friends/requests'),
    api.get('/friends/suggestions')
  ]);
  document.getElementById('main-panel').innerHTML = `
    <div class="topbar"><h1>Amis</h1></div>
    <div class="stack">
      <section class="card stack"><h2>Demandes</h2><div class="grid">${requests.map(renderRequest).join('') || '<p class="muted">Aucune demande.</p>'}</div></section>
      <section class="card stack"><h2>Mes amis</h2><div class="grid">${friends.map(renderFriend).join('') || '<p class="muted">Aucun ami pour le moment.</p>'}</div></section>
      <section class="card stack"><h2>Suggestions</h2><div class="grid">${suggestions.map(renderSuggestion).join('') || '<p class="muted">Aucune suggestion.</p>'}</div></section>
    </div>
  `;
}

function renderFriend(user) {
  return `<div class="card stack">${avatar(user, 'large')}<strong>${escapeHtml(user.fullname)}</strong><button class="btn btn-primary btn-small" data-open-chat="${user.id}">Message</button><button class="btn btn-ghost btn-small" data-remove-friend="${user.id}">Retirer</button></div>`;
}

function renderSuggestion(user) {
  return `<div class="card stack">${avatar(user, 'large')}<strong>${escapeHtml(user.fullname)}</strong><span class="muted">@${escapeHtml(user.username)}</span><button class="btn btn-primary btn-small" data-add-friend="${user.id}">Ajouter</button></div>`;
}

function renderRequest(req) {
  return `<div class="card stack">${avatar(req, 'large')}<strong>${escapeHtml(req.fullname)}</strong><button class="btn btn-primary btn-small" data-respond="${req.id}" data-accept="true">Accepter</button><button class="btn btn-danger btn-small" data-respond="${req.id}" data-accept="false">Refuser</button></div>`;
}

async function loadNotifications() {
  const { notifications, unread } = await api.get('/notifications');
  document.getElementById('main-panel').innerHTML = `
    <div class="topbar"><h1>Notifications</h1><button class="btn btn-secondary" id="read-all">Tout lire (${unread})</button></div>
    <div class="stack">${notifications.map((n) => `<div class="card split"><div><strong>${escapeHtml(n.title)}</strong><p class="muted">${escapeHtml(n.message)} · ${dateLabel(n.created_at)}</p></div><button class="btn btn-ghost btn-small" data-read-notif="${n.id}">${n.is_read ? 'Lu' : 'Lire'}</button></div>`).join('') || '<div class="card empty">Aucune notification.</div>'}</div>
  `;
}

async function loadSearch() {
  document.getElementById('main-panel').innerHTML = `
    <div class="topbar"><h1>Recherche</h1></div>
    <div class="card stack"><input id="search-input" placeholder="Rechercher des personnes"><div id="search-results" class="grid"></div></div>
  `;
}

async function runSearch(targetId, query) {
  const { users } = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
  document.getElementById(targetId).innerHTML = users.map((user) => `
    <div class="card stack">${avatar(user, 'large')}<strong>${escapeHtml(user.fullname)}</strong><span class="muted">@${escapeHtml(user.username)}</span><button class="btn btn-primary btn-small" data-open-chat="${user.id}">Message</button><button class="btn btn-secondary btn-small" data-add-friend="${user.id}">Ajouter</button></div>
  `).join('') || '<p class="muted">Aucun resultat.</p>';
}

async function loadProfile() {
  const { user } = await api.get('/users/profile');
  state.user = user;
  document.getElementById('main-panel').innerHTML = `
    <form class="card stack" id="profile-form">
      <div class="row">${avatar(user, 'large')}<div><h1>${escapeHtml(user.fullname)}</h1><p class="muted">@${escapeHtml(user.username)}</p></div></div>
      <label class="field"><span>Nom complet</span><input name="fullname" value="${escapeHtml(user.fullname)}" required></label>
      <label class="field"><span>Nom utilisateur</span><input name="username" value="${escapeHtml(user.username)}" required></label>
      <label class="field"><span>Bio</span><textarea name="bio">${escapeHtml(user.bio || '')}</textarea></label>
      <label class="field"><span>Avatar</span><input name="avatar" type="file" accept="image/*"></label>
      <button class="btn btn-primary">Enregistrer</button>
    </form>
  `;
}

async function loadAdmin() {
  const [{ stats }, { users }, { posts }] = await Promise.all([
    api.get('/admin/stats'),
    api.get('/admin/users'),
    api.get('/admin/posts')
  ]);
  document.getElementById('main-panel').innerHTML = `
    <div class="topbar"><h1>Administration</h1></div>
    <section class="grid">
      ${Object.entries(stats).map(([k, v]) => `<div class="card stat"><span class="muted">${k}</span><strong>${v}</strong></div>`).join('')}
    </section>
    <section class="card stack" style="margin-top:14px"><h2>Utilisateurs</h2>${users.map((u) => `<div class="split"><span>${escapeHtml(u.fullname)} · ${escapeHtml(u.email)} · ${u.status}</span><span><button class="btn btn-secondary btn-small" data-toggle-user="${u.id}">Statut</button><button class="btn btn-danger btn-small" data-admin-delete-user="${u.id}">Supprimer</button></span></div>`).join('')}</section>
    <section class="card stack" style="margin-top:14px"><h2>Publications</h2>${posts.map((p) => `<div class="split"><span>${escapeHtml(p.username)}: ${escapeHtml(p.content).slice(0, 90)}</span><button class="btn btn-danger btn-small" data-admin-delete-post="${p.id}">Supprimer</button></div>`).join('')}</section>
  `;
}

document.addEventListener('click', async (event) => {
  const el = event.target.closest('button, [data-page]');
  if (!el) return;
  try {
    if (el.dataset.authTab) return renderAuth(el.dataset.authTab);
    if (el.dataset.page) return navigate(el.dataset.page);
    if (el.id === 'logout-btn') { await api.post('/auth/logout'); state.user = null; return renderAuth('login'); }
    if (el.dataset.like) { await api.post('/likes', { postId: el.dataset.like }); return refreshPosts(); }
    if (el.dataset.comments) return toggleComments(el.dataset.comments);
    if (el.dataset.deletePost) { await api.delete(`/posts/${el.dataset.deletePost}`); return refreshPosts(); }
    if (el.dataset.share) return navigator.clipboard?.writeText(`${location.origin}/posts/${el.dataset.share}`).then(() => notify('Lien copie'));
    if (el.dataset.addFriend) { await api.post(`/friends/request/${el.dataset.addFriend}`); notify('Demande envoyee'); if (state.page === 'friends') loadFriends(); }
    if (el.dataset.removeFriend) { await api.delete(`/friends/${el.dataset.removeFriend}`); return loadFriends(); }
    if (el.dataset.respond) { await api.post(`/friends/respond/${el.dataset.respond}`, { accept: el.dataset.accept === 'true' }); return loadFriends(); }
    if (el.dataset.openChat) { await navigate('messages'); return openChat(el.dataset.openChat); }
    if (el.id === 'read-all') { await api.patch('/notifications/read-all'); return loadNotifications(); }
    if (el.dataset.readNotif) { await api.patch(`/notifications/${el.dataset.readNotif}`); return loadNotifications(); }
    if (el.dataset.toggleUser) { await api.patch(`/admin/users/${el.dataset.toggleUser}/toggle`); return loadAdmin(); }
    if (el.dataset.adminDeleteUser) { await api.delete(`/admin/users/${el.dataset.adminDeleteUser}`); return loadAdmin(); }
    if (el.dataset.adminDeletePost) { await api.delete(`/admin/posts/${el.dataset.adminDeletePost}`); return loadAdmin(); }
  } catch (err) {
    notify(err.message);
  }
});

document.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  try {
    if (form.id === 'login-form') {
      const body = Object.fromEntries(new FormData(form));
      const { user } = await api.post('/auth/login', body);
      state.user = user;
      connectSocket();
      renderShell();
      return navigate('feed');
    }
    if (form.id === 'register-form') {
      const data = new FormData(form);
      const { user } = await api.post('/auth/register', data);
      state.user = user;
      connectSocket();
      renderShell();
      return navigate('feed');
    }
    if (form.id === 'post-form') {
      await api.post('/posts', new FormData(form));
      form.reset();
      return refreshPosts();
    }
    if (form.dataset.commentForm) {
      const content = new FormData(form).get('content');
      await api.post('/comments', { postId: form.dataset.commentForm, content });
      await refreshPosts();
      return toggleComments(form.dataset.commentForm);
    }
    if (form.id === 'message-form') {
      const content = new FormData(form).get('content');
      const receiverId = state.activeChat.otherUser.id;
      state.socket.emit('message:send', { senderId: state.user.id, receiverId, content });
      form.reset();
      setTimeout(() => openChat(receiverId), 250);
    }
    if (form.id === 'profile-form') {
      const { user } = await api.put('/users/profile', new FormData(form));
      state.user = user;
      renderShell();
      await navigate('profile');
      notify('Profil mis a jour');
    }
  } catch (err) {
    notify(err.message);
  }
});

document.addEventListener('input', async (event) => {
  if (event.target.id === 'search-input' && event.target.value.trim().length >= 2) {
    runSearch('search-results', event.target.value.trim());
  }
  if (event.target.id === 'quick-search' && event.target.value.trim().length >= 2) {
    runSearch('quick-results', event.target.value.trim());
  }
});

boot();
