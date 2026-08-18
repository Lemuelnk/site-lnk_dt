(() => {
  const ENDPOINT = '/api/contact';
  const TOKEN_KEY = 'lnk_dt_admin_token';
  const isEnglish = () => String(document.documentElement.lang || 'fr').startsWith('en');

  const t = {
    fr: {
      title: 'Demandes de projets',
      empty: 'Aucune demande de projet.',
      emptySub: 'Les messages envoyés via le formulaire de contact apparaîtront ici.',
      markRead: 'Marquer lu',
      archive: 'Archiver',
      delete: 'Supprimer',
      confirmRead: n => `Marquer la demande de \u00ab${n}\u00bb comme lue ?`,
      confirmArchive: n => `Archiver la demande de \u00ab${n}\u00bb ?`,
      confirmDelete: n => `Supprimer définitivement la demande de \u00ab${n}\u00bb ? Cette action est irréversible.`,
      error: 'Une erreur est survenue. Réessayez.',
      networkError: 'Impossible de contacter le serveur.',
      actionDone: 'Action effectuée.',
      stars: n => 'Note\u00a0: ' + n + '/5',
      noOrg: n => n || '—',
      date: d => {
        try { return new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
        catch (_e) { return d; }
      },
      unreadBadge: 'nouveau'
    },
    en: {
      title: 'Project Requests',
      empty: 'No project requests.',
      emptySub: 'Messages sent via the contact form will appear here.',
      markRead: 'Mark as read',
      archive: 'Archive',
      delete: 'Delete',
      confirmRead: n => `Mark the request from \u201c${n}\u201d as read?`,
      confirmArchive: n => `Archive the request from \u201c${n}\u201d?`,
      confirmDelete: n => `Permanently delete the request from \u201c${n}\u201d? This cannot be undone.`,
      error: 'An error occurred. Please try again.',
      networkError: 'Unable to reach the server.',
      actionDone: 'Action completed.',
      stars: n => 'Rating\u00a0: ' + n + '/5',
      noOrg: n => n || '—',
      date: d => {
        try { return new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
        catch (_e) { return d; }
      },
      unreadBadge: 'new'
    }
  };

  const str = key => t[isEnglish() ? 'en' : 'fr'][key];

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  }

  function flash(message, isError) {
    const banner = document.getElementById('admin-flash');
    if (!banner) return;
    banner.textContent = message;
    banner.className = 'admin-status' + (isError ? ' is-error' : ' is-success');
    banner.hidden = false;
    clearTimeout(banner._timer);
    banner._timer = setTimeout(() => { banner.hidden = true; }, 4000);
  }

  function cardMarkup(item) {
    const isNew = item.status === 'new';
    return (
      `<article class="admin-item${isNew ? ' is-new' : ''}" data-id="${escapeHtml(item.id)}">` +
      `<div class="admin-item-head">` +
      `<p class="admin-item-name">${escapeHtml(item.name)}${isNew ? ` <span class="admin-badge">${str('unreadBadge')}</span>` : ''}</p>` +
      `<p class="admin-item-org">${escapeHtml(item.email)}</p>` +
      `<p class="admin-item-rating">${escapeHtml(item.subject || '—')}</p>` +
      `<p class="admin-item-date">${str('date')(item.created_at)}</p>` +
      `</div>` +
      `<blockquote class="admin-item-review">${escapeHtml(item.message)}</blockquote>` +
      `<div class="admin-item-actions">` +
      (isNew ? `<button type="button" class="admin-btn-restore" data-action="read">${str('markRead')}</button>` : '') +
      `<button type="button" class="admin-btn-reject" data-action="archive">${str('archive')}</button>` +
      `<button type="button" class="admin-btn-delete-forever" data-action="delete">${str('delete')}</button>` +
      `</div>` +
      `</article>`
    );
  }

  function loadProjects() {
    const token = sessionStorage.getItem(TOKEN_KEY);
    if (!token) return;
    
    fetch(`${ENDPOINT}?token=${encodeURIComponent(token)}`, {
      cache: 'no-store',
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${token}`, 'X-Admin-Token': token }
    })
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('admin-projects-list');
      const empty = document.getElementById('admin-projects-empty');
      if (!list || !empty) return;
      
      const items = data.requests || [];
      list.innerHTML = items.map(cardMarkup).join('');
      empty.hidden = items.length > 0;
      attachActions();
    })
    .catch(() => {});
  }

  function attachActions() {
    document.querySelectorAll('#admin-projects-list .admin-item-actions button').forEach(btn => {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener('click', async () => {
        const card = btn.closest('.admin-item');
        const id = card.dataset.id;
        const action = btn.dataset.action;
        const name = card.querySelector('.admin-item-name')?.textContent || '';
        
        let question;
        if (action === 'read') question = str('confirmRead')(name);
        else if (action === 'archive') question = str('confirmArchive')(name);
        else if (action === 'delete') question = str('confirmDelete')(name);
        
        if (!window.confirm(question)) return;

        const buttons = card.querySelectorAll('button');
        buttons.forEach(b => { b.disabled = true; });

        try {
          const response = await fetch(ENDPOINT, {
            cache: 'no-store',
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem(TOKEN_KEY)}` },
            body: JSON.stringify({ id, action })
          });
          if (!response.ok) throw new Error('error');
          card.remove();
          if (!document.getElementById('admin-projects-list').querySelector('.admin-item')) {
            document.getElementById('admin-projects-empty').hidden = false;
          }
          flash(str('actionDone'), false);
        } catch (err) {
          buttons.forEach(b => { b.disabled = false; });
          flash(str('error'), true);
        }
      });
    });
  }

  // Observer pour re-binder après modification du DOM
  const observer = new MutationObserver(() => {
    attachActions();
  });
  
  // Initialisation
  if (document.getElementById('admin-projects-section')) {
    loadProjects();
    setInterval(loadProjects, 60000); // Refresh every minute
  }
})();
