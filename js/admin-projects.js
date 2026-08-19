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
      whatsapp: 'WhatsApp',
      copyEmail: 'Copier email',
      copied: 'Email copié !',
      confirmRead: n => `Marquer la demande de \u00ab${n}\u00bb comme lue ?`,
      confirmArchive: n => `Archiver la demande de \u00ab${n}\u00bb ?`,
      confirmDelete: n => `Supprimer définitivement la demande de \u00ab${n}\u00bb ? Cette action est irréversible.`,
      error: 'Une erreur est survenue. Réessayez.',
      networkError: 'Impossible de contacter le serveur.',
      actionDone: 'Action effectuée.',
      phone: 'Téléphone',
      clientType: 'Type de client',
      projectType: 'Type de projet',
      description: 'Description',
      all: 'Tout',
      new: 'Nouveaux',
      read: 'Lus',
      archived: 'Archivés',
      newCount: n => `${n} nouveau${n > 1 ? 'x' : ''}`,
      projectTypes: {
        'affiche-flyer': 'Affiche / Flyer',
        'support-professionnel': 'Support professionnel',
        'banniere': 'Bannière',
        'calendrier': 'Calendrier',
        'invitation': 'Invitation',
        'design-production': 'Conception → Matérialisation',
        'autre': 'Autre'
      },
      clientTypes: {
        'particulier': 'Particulier',
        'pme': 'PME',
        'entrepreneur': 'Entrepreneur',
        'organisation': 'Organisation'
      }
    },
    en: {
      title: 'Project Requests',
      empty: 'No project requests.',
      emptySub: 'Messages sent via the contact form will appear here.',
      markRead: 'Mark as read',
      archive: 'Archive',
      delete: 'Delete',
      whatsapp: 'WhatsApp',
      copyEmail: 'Copy email',
      copied: 'Email copied!',
      confirmRead: n => `Mark the request from \u201c${n}\u201d as read?`,
      confirmArchive: n => `Archive the request from \u201c${n}\u201d?`,
      confirmDelete: n => `Permanently delete the request from \u201c${n}\u201d? This cannot be undone.`,
      error: 'An error occurred. Please try again.',
      networkError: 'Unable to reach the server.',
      actionDone: 'Action completed.',
      phone: 'Phone',
      clientType: 'Client type',
      projectType: 'Project type',
      description: 'Description',
      all: 'All',
      new: 'New',
      read: 'Read',
      archived: 'Archived',
      newCount: n => `${n} new`,
      projectTypes: {
        'affiche-flyer': 'Poster / Flyer',
        'support-professionnel': 'Professional material',
        'banniere': 'Banner',
        'calendrier': 'Calendar',
        'invitation': 'Invitation',
        'design-production': 'Design → Production',
        'autre': 'Other'
      },
      clientTypes: {
        'particulier': 'Individual',
        'pme': 'SME',
        'entrepreneur': 'Entrepreneur',
        'organisation': 'Organization'
      }
    }
  };

  const str = key => t[isEnglish() ? 'en' : 'fr'][key];

  // Type colors for badges
  const typeColors = {
    'affiche-flyer': '#FF7043',
    'support-professionnel': '#009688',
    'banniere': '#FFC107',
    'calendrier': '#607D8B',
    'invitation': '#E91E63',
    'design-production': '#001A17',
    'autre': '#9C27B0'
  };

  function formatDate(isoString) {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      const opts = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return d.toLocaleString(isEnglish() ? 'en' : 'fr', opts);
    } catch (_e) { return isoString; }
  }

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

  function extractField(message, prefix) {
    const safe = String(message || '');
    if (!safe) return '';
    const regex = new RegExp(`${prefix}\\s*:\\s*(.+?)(?:\\n\\n|$)`, 'is');
    const match = safe.match(regex);
    return match ? match[1].trim() : '';
  }

  function getTypeBadge(item) {
    const typeKey = (item.project_type || item.type || '').toLowerCase();
    const types = str('projectTypes');
    const label = types[typeKey] || types['autre'] || str('projectType');
    const color = typeColors[typeKey] || typeColors['autre'];
    return `<span class="admin-type-badge" style="background:${color};color:#fff">${escapeHtml(label)}</span>`;
  }

  function cardMarkup(item) {
    const isNew = item.status === 'new';
    const phone = extractField(item.message, 'Téléphone') || extractField(item.message, 'Phone') || '—';
    const descParts = item.message.split('\n\n').map(p => p.trim()).filter(p => p && !p.startsWith('Description') && !p.startsWith('Téléphone') && !p.startsWith('Phone'));
    const desc = descParts.join('\n\n') || item.message;

    const whatsappLink = phone !== '—'
      ? `https://wa.me/${phone.replace(/[^0-9]/g, '')}`
      : '';

    const safeName = String(item.name || 'Sans nom');
    const safeEmail = String(item.email || '');
    const safeSubject = String(item.project_type || item.type || item.subject || '');
    const dateStr = formatDate(item.created_at);

    return (
      `<article class="admin-item${isNew ? ' is-new' : ''}" data-id="${escapeHtml(item.id)}">` +
      `<div class="admin-item-head">` +
      `<div class="admin-item-head-top">` +
      `<p class="admin-item-name">${escapeHtml(safeName)}${isNew ? ` <span class="admin-badge">${str('newCount')(1)}</span>` : ''}</p>` +
      `${getTypeBadge(item)}` +
      `</div>` +
      `<p class="admin-item-org">${escapeHtml(safeEmail)}</p>` +
      (safeSubject ? `<p class="admin-item-rating">${escapeHtml(safeSubject)}</p>` : '') +
      `<p class="admin-item-date">${dateStr}</p>` +
      `</div>` +
      `<div class="admin-item-details">` +
      (phone !== '—' ? `<div class="admin-item-detail-row"><span class="admin-detail-label">${str('phone')}</span><span class="admin-detail-value">${escapeHtml(phone)}</span></div>` : '') +
      `<div class="admin-item-detail-row"><span class="admin-detail-label">Email</span><span class="admin-detail-value admin-detail-value-copy">${escapeHtml(safeEmail)} <button class="admin-copy-btn" type="button" data-copy="${escapeHtml(safeEmail)}" title="${str('copyEmail')}">📋</button></span></div>` +
      `</div>` +
      (desc ? `<blockquote class="admin-item-review">${escapeHtml(desc)}</blockquote>` : '') +
      `<div class="admin-item-actions">` +
      (whatsappLink ? `<a class="admin-btn-whatsapp" href="${whatsappLink}" target="_blank" rel="noopener">${str('whatsapp')}</a>` : '') +
      (isNew ? `<button type="button" class="admin-btn-restore" data-action="read">${str('markRead')}</button>` : '') +
      `<button type="button" class="admin-btn-reject" data-action="archive">${str('archive')}</button>` +
      `<button type="button" class="admin-btn-delete-forever" data-action="delete">${str('delete')}</button>` +
      `</div>` +
      `</article>`
    );
  }

  function playNotificationSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (_e) { /* silence if AudioContext not available */ }
  }

  let lastCount = 0;

  function updateNewCount(count) {
    const badge = document.getElementById('admin-projects-new-badge');
    if (badge) {
      if (count > 0) {
        badge.textContent = str('newCount')(count);
        badge.hidden = false;
        if (lastCount > 0 && count > lastCount) {
          playNotificationSound();
        }
      } else {
        badge.hidden = true;
      }
    }
    lastCount = count;
  }

  let currentFilter = 'all';

  function filterProjects(items) {
    if (currentFilter === 'all') return items;
    if (currentFilter === 'new') return items.filter(i => i.status === 'new');
    if (currentFilter === 'read') return items.filter(i => i.status === 'read');
    if (currentFilter === 'archived') return items.filter(i => i.status === 'archived');
    return items;
  }

  function renderFilterButtons() {
    const filterBar = document.getElementById('admin-projects-filters');
    if (!filterBar) return;
    const filters = [
      { key: 'all', label: str('all') },
      { key: 'new', label: str('new') },
      { key: 'read', label: str('read') },
      { key: 'archived', label: str('archived') }
    ];
    filterBar.innerHTML = filters.map(f =>
      `<button type="button" class="admin-filter-btn${currentFilter === f.key ? ' is-active' : ''}" data-filter="${f.key}">${f.label}</button>`
    ).join('');
    filterBar.querySelectorAll('.admin-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentFilter = btn.dataset.filter;
        renderFilterButtons();
        loadProjects(true);
      });
    });
  }

  function loadProjects(silent) {
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
      const newItems = items.filter(i => i.status === 'new');
      const stat = document.getElementById('admin-stat-projects');
      if (stat) stat.textContent = String(newItems.length);
      updateNewCount(newItems.length);

      const filtered = filterProjects(items);
      list.innerHTML = filtered.map(cardMarkup).join('');
      empty.hidden = filtered.length > 0;

      const emptyMsg = empty.querySelector('.admin-empty-msg');
      if (emptyMsg) {
        if (currentFilter === 'all') {
          emptyMsg.textContent = str('empty');
        } else {
          emptyMsg.textContent = currentFilter === 'new' ? str('empty') : str('empty');
        }
      }
      attachActions();
      if (!silent && newItems.length > 0 && lastCount !== newItems.length) {
        playNotificationSound();
      }
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
        const name = card.querySelector('.admin-item-name')?.textContent?.replace(/\s*\d+\s*$/, '').trim() || '';

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
          loadProjects(true);
        } catch (err) {
          buttons.forEach(b => { b.disabled = false; });
          flash(str('error'), true);
        }
      });
    });

    // Copy email buttons
    document.querySelectorAll('[data-copy]').forEach(btn => {
      if (btn._copyBound) return;
      btn._copyBound = true;
      btn.addEventListener('click', async () => {
        const email = btn.dataset.copy;
        try {
          await navigator.clipboard.writeText(email);
          flash(str('copied'), false);
        } catch (_e) {
          // Fallback
          const ta = document.createElement('textarea');
          ta.value = email;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          flash(str('copied'), false);
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
    renderFilterButtons();
    loadProjects();
    setInterval(loadProjects, 60000); // Refresh every minute
  }
})();
