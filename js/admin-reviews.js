(() => {
  const ADMIN_ENDPOINT = '/api/review-admin';
  const TOKEN_KEY = 'lnk_dt_admin_token';
  const isEnglish = () => String(document.documentElement.lang || 'fr').startsWith('en');

  const t = {
    fr: {
      loginTitle: 'Accès réservé',
      loginBody: 'Cette page est réservée à l\u2019administrateur de LNK Design Touch.',
      tokenLabel: 'Clé d\u2019accès',
      tokenPlaceholder: 'Clé d\u2019accès',
      submit: 'Accéder',
      wrongToken: 'Clé d\u2019accès invalide.',
      rateLimited: 'Trop de tentatives. Réessayez dans quelques minutes.',
      sessionExpired: 'Session expirée après inactivité. Reconnectez-vous.',
      loading: 'Chargement\u2026',
      pendingTitle: 'Avis en attente de validation',
      refresh: 'Actualiser',
      empty: 'Aucun avis en attente de validation. Tous les avis ont été traités.',
      historySummary: 'Avis déjà publiés et refusés (historique)',
      trashSummary: 'Corbeille — ces avis seront définitivement supprimés 30 jours après leur mise à la corbeille.',
      emptyTrash: 'La corbeille est vide.',
      badgePublished: 'Publié',
      badgeRejected: 'Refusé',
      badgeDeleted: 'Corbeille',
      approve: 'Publier',
      reject: 'Refuser',
      putBack: 'Remettre en attente',
      delete: 'Supprimer',
      restore: 'Restaurer',
      deleteForever: 'Supprimer définitivement',
      confirmed: 'L\u2019avis a été publié.',
      rejected: 'L\u2019avis a été refusé.',
      restored: 'L\u2019avis est de nouveau en attente de validation.',
      deleted: 'L\u2019avis a été placé dans la corbeille.',
      foreverDeleted: 'L\u2019avis a été définitivement supprimé.',
      error: 'Une erreur est survenue. Réessayez.',
      networkError: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
      confirmApprove: n => `Publier l\u2019avis de \u00ab${n}\u00bb ? Il sera visible sur le site.`,
      confirmReject: n => `Refuser l\u2019avis de \u00ab${n}\u00bb ? Il ne sera pas publié.`,
      confirmRestore: n => `Remettre l\u2019avis de \u00ab${n}\u00bb en attente de validation ?`,
      confirmDelete: n => `Placer l\u2019avis de \u00ab${n}\u00bb dans la corbeille ? Il sera définitivement supprimé dans 30 jours.`,
      confirmDeleteForever: n => `Supprimer définitivement l\u2019avis de \u00ab${n}\u00bb ? Cette action est irréversible.`,
      trashExpiresOn: d => {
        try {
          const exp = new Date(d);
          exp.setDate(exp.getDate() + 30);
          return `Supprimé définitivement le\u00a0${exp.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}`;
        } catch (_e) { return ''; }
      },
      stars: n => 'Note\u00a0: ' + n + '/5',
      noOrg: n => n || '—',
      date: d => {
        try { return new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }); }
        catch (_e) { return d; }
      },
      filterAll: 'Tous',
      footer: 'LNK Design Touch — Administration des avis. Cette page n\u2019est pas indexée et ne doit pas être partagée.'
    },
    en: {
      loginTitle: 'Restricted access',
      loginBody: 'This page is reserved for the administrator of LNK Design Touch.',
      tokenLabel: 'Access key',
      tokenPlaceholder: 'Access key',
      submit: 'Sign in',
      wrongToken: 'Invalid access key.',
      rateLimited: 'Too many attempts. Please try again in a few minutes.',
      sessionExpired: 'Session expired after inactivity. Please sign in again.',
      loading: 'Loading\u2026',
      pendingTitle: 'Reviews pending approval',
      refresh: 'Refresh',
      empty: 'No reviews awaiting approval. All reviews have been processed.',
      historySummary: 'Published and rejected reviews (history)',
      trashSummary: 'Trash — these reviews will be permanently deleted 30 days after being trashed.',
      emptyTrash: 'The trash is empty.',
      badgePublished: 'Published',
      badgeRejected: 'Rejected',
      badgeDeleted: 'Trashed',
      approve: 'Publish',
      reject: 'Reject',
      putBack: 'Put back to pending',
      delete: 'Delete',
      restore: 'Restore',
      deleteForever: 'Delete permanently',
      confirmed: 'The review has been published.',
      rejected: 'The review has been rejected.',
      restored: 'The review is back to pending approval.',
      deleted: 'The review has been moved to the trash.',
      foreverDeleted: 'The review has been permanently deleted.',
      error: 'An error occurred. Please try again.',
      networkError: 'Unable to reach the server. Check your connection.',
      confirmApprove: n => `Publish the review from \u201c${n}\u201d? It will become visible on the website.`,
      confirmReject: n => `Reject the review from \u201c${n}\u201d? It will not be published.`,
      confirmRestore: n => `Put the review from \u201c${n}\u201d back to pending approval?`,
      confirmDelete: n => `Move the review from \u201c${n}\u201d to the trash? It will be permanently deleted in 30 days.`,
      confirmDeleteForever: n => `Permanently delete the review from \u201c${n}\u201d? This action cannot be undone.`,
      trashExpiresOn: d => {
        try {
          const exp = new Date(d);
          exp.setDate(exp.getDate() + 30);
          return `Permanently deleted on\u00a0${exp.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}`;
        } catch (_e) { return ''; }
      },
      stars: n => 'Rating\u00a0: ' + n + '/5',
      noOrg: n => n || '—',
      date: d => {
        try { return new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }); }
        catch (_e) { return d; }
      },
      filterAll: 'All',
      footer: 'LNK Design Touch — Reviews administration. This page is not indexed and should not be shared.'
    }
  };

  const str = key => t[isEnglish() ? 'en' : 'fr'][key];

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  }

  function starsMarkup(rating) {
    const n = Math.max(1, Math.min(5, Number(rating) || 0));
    return Array.from({ length: 5 }, (_, i) => `<span class="admin-star${i < n ? ' is-active' : ''}" aria-hidden="true">★</span>`).join('');
  }

  /**
   * Rend la carte d'un avis avec les boutons adaptés à son statut.
   * pending  → Publier / Refuser
   * approved → Remettre en attente / Supprimer (corbeille 30 jours)
   * rejected → Restaurer (pendant 30 jours) / Supprimer définitivement
   * deleted  → Restaurer (pendant 30 jours)
   */
  function cardMarkup(item, context) {
    const isTrashed = item.status === 'deleted';
    // Badge de statut pour l'historique et la corbeille
    let statusBadge = '';
    if (context === 'history' && !isTrashed) {
      const badgeClass = item.status === 'approved' ? 'admin-badge-approved' : 'admin-badge-rejected';
      const badgeText = item.status === 'approved' ? str('badgePublished') : str('badgeRejected');
      statusBadge = `<span class="admin-status-badge ${badgeClass}">${badgeText}</span>`;
    } else if (context === 'trash') {
      statusBadge = `<span class="admin-status-badge admin-badge-deleted">${str('badgeDeleted')}</span>`;
    }
    let actions = '';
    if (context === 'pending') {
      actions =
        `<button type="button" class="admin-btn-approve" data-action="approve">${str('approve')}</button>` +
        `<button type="button" class="admin-btn-reject" data-action="reject">${str('reject')}</button>`;
    } else if (context === 'history') {
      actions =
        `<button type="button" class="admin-btn-restore" data-action="reset">${str('putBack')}</button>` +
        `<button type="button" class="admin-btn-delete" data-action="delete">${str('delete')}</button>`;
    } else if (context === 'trash') {
      actions =
        `<button type="button" class="admin-btn-restore" data-action="reset">${str('restore')}</button>` +
        `<button type="button" class="admin-btn-delete-forever" data-action="deleteForever">${str('deleteForever')}</button>`;
      if (item.deleted_at) {
        actions += `<p class="admin-item-trash-expiry">${escapeHtml(str('trashExpiresOn')(item.deleted_at))}</p>`;
      }
    }
    return (
      `<article class="admin-item${isTrashed ? ' is-trashed' : ''}" data-id="${escapeHtml(item.id)}">` +
      `<div class="admin-item-head">${statusBadge}<p class="admin-item-name">${escapeHtml(item.name)}</p><p class="admin-item-org">${escapeHtml(str('noOrg')(item.organization))} · ${escapeHtml(item.project || '—')}</p><p class="admin-item-rating">${str('stars')(item.rating)} ${starsMarkup(item.rating)}</p><p class="admin-item-date">${str('date')(item.created_at)}</p></div>` +
      `<blockquote class="admin-item-review">${escapeHtml(item.review)}</blockquote>` +
      `<div class="admin-item-actions">${actions}</div>` +
      `</article>`
    );
  }

  function setStatus(element, message, isError) {
    element.textContent = message;
    element.className = 'admin-status' + (isError ? ' is-error' : ' is-success');
  }

  const state = { token: sessionStorage.getItem(TOKEN_KEY) || '' };

  function updateAdminStat(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value);
  }

  function showPanel() {
    document.getElementById('admin-login').hidden = true;
    document.getElementById('admin-panel').hidden = false;
    document.getElementById('admin-logout').hidden = false;
    document.getElementById('admin-refresh').textContent = str('refresh');
    resetIdleTimer();
    loadAll();
  }

  function showLogin(error) {
    state.token = '';
    sessionStorage.removeItem(TOKEN_KEY);
    if (idleTimer) { clearTimeout(idleTimer); idleTimer = null; }
    document.getElementById('admin-login').hidden = false;
    document.getElementById('admin-panel').hidden = true;
    document.getElementById('admin-logout').hidden = true;
    const status = document.getElementById('admin-login-status');
    if (error) setStatus(status, str(typeof error === 'string' ? error : 'wrongToken'), true);
    else status.textContent = '';
    document.getElementById('admin-token').value = '';
    document.getElementById('admin-token').focus();
    document.getElementById('admin-login-form').querySelector('h1') && (document.getElementById('admin-login').querySelector('h1').textContent = str('loginTitle'));
    document.getElementById('admin-login').querySelector('p').textContent = str('loginBody');
    document.getElementById('admin-login').querySelector('label').textContent = str('tokenLabel');
    document.getElementById('admin-token').placeholder = str('tokenPlaceholder');
    document.getElementById('admin-login').querySelector('button[type="submit"]').textContent = str('submit');
  }

  async function api(path) {
    const url = path ? `${ADMIN_ENDPOINT}?${path}` : ADMIN_ENDPOINT;
    const response = await fetch(url, { cache: 'no-store',
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${state.token}` }
    });
    if (response.status === 401) throw new Error('unauthorized');
    if (response.status === 429) throw new Error('rateLimited');
    if (!response.ok) throw new Error('network');
    return await response.json();
  }

  async function loadDashboardStats() {
    try {
      const token = sessionStorage.getItem(TOKEN_KEY);
      // 1. Projets
      const projResp = await fetch('/api/contact?status=new', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (projResp.ok) {
        const { requests } = await projResp.json();
        updateAdminStat('admin-stat-projects', requests.length);
      }
      // 2. Clics Promo
      const promoResp = await fetch('/api/news-admin?action=get-all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (promoResp.ok) {
        const { results } = await promoResp.json();
        const active = (results || []).find(r => r.featured === 1);
        updateAdminStat('admin-stat-promo-clicks', active ? (active.click_count || 0) : 0);
      }
    } catch (e) {}
  }

  async function doAction(id, action) {
    const response = await fetch(ADMIN_ENDPOINT, { cache: 'no-store',
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
      body: JSON.stringify({ id, action })
    });
    if (response.status === 401) throw new Error('unauthorized');
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'error');
    return result;
  }

  /**
   * Demande de confirmation avant l'action. Si la plate-forme le permet,
   * une boîte de dialogue native (alerte/confirmation système sur mobile) est utilisée.
   */
  function confirmAction(message) {
    return window.confirm(message);
  }

  async function handleModeration(card, action, context) {
    const name = card.querySelector('.admin-item-name')?.textContent || '';
    let question;
    if (action === 'approve') question = str('confirmApprove')(name);
    else if (action === 'reject') question = str('confirmReject')(name);
    else if (action === 'reset') question = str('confirmRestore')(name);
    else if (action === 'delete') question = str('confirmDelete')(name);
    else if (action === 'deleteForever') question = str('confirmDeleteForever')(name);
    if (!confirmAction(question)) return;

    const buttons = card.querySelectorAll('.admin-item-actions button');
    buttons.forEach(btn => { btn.disabled = true; });
    try {
      const result = await doAction(card.dataset.id, action);
      card.remove();
      // Actualiser les sections concernées
      await loadAll();
      if (action === 'approve') flash(str('confirmed'), false);
      else if (action === 'reject') flash(str('rejected'), false);
      else if (action === 'reset') flash(str('restored'), false);
      else if (action === 'delete') flash(str('deleted'), false);
      else if (action === 'deleteForever') flash(str('foreverDeleted'), false);
    } catch (err) {
      buttons.forEach(btn => { btn.disabled = false; });
      if (err.message === 'unauthorized') showLogin(true);
      else setStatus(card.querySelector('.admin-item-actions') || card, str('error'), true);
    }
  }

  // Review history filter
  let reviewHistoryFilter = 'all';
  function filterHistoryItems(items) {
    if (reviewHistoryFilter === 'all') return items;
    return items.filter(i => i.status === reviewHistoryFilter);
  }
  function renderReviewFilters() {
    const bar = document.getElementById('admin-reviews-filters');
    if (!bar) return;
    const filters = [
      { key: 'all', label: str('filterAll') },
      { key: 'approved', label: str('badgePublished') },
      { key: 'rejected', label: str('badgeRejected') }
    ];
    bar.innerHTML = filters.map(f =>
      `<button type="button" class="admin-filter-btn${reviewHistoryFilter === f.key ? ' is-active' : ''}" data-filter="${f.key}">${f.label}</button>`
    ).join('');
    bar.querySelectorAll('.admin-filter-btn').forEach(btn => {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener('click', () => {
        reviewHistoryFilter = btn.dataset.filter;
        applyHistoryFilter();
        renderReviewFilters();
      });
    });
  }
  function applyHistoryFilter() {
    const history = document.getElementById('admin-history-list');
    if (!history || !history._allItems) return;
    const filtered = filterHistoryItems(history._allItems);
    history.innerHTML = filtered.length
      ? filtered.map(item => cardMarkup(item, 'history')).join('')
      : `<p class="admin-empty">—</p>`;
    attachActions();
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

  async function loadAll() {
    const list = document.getElementById('admin-list');
    const empty = document.getElementById('admin-empty');
    const history = document.getElementById('admin-history-list');
    const trashList = document.getElementById('admin-trash-list');
    const trashEmpty = document.getElementById('admin-trash-empty');
    list.innerHTML = `<p class="admin-status">${str('loading')}</p>`;
    try {
      const pending = await api('status=pending');
      const approved = await api('status=approved');
      const rejected = await api('status=rejected');
      const trash = await api('status=trash');
      const pendingRows = pending.testimonials || [];
      const historyRows = [...(approved.testimonials || []), ...(rejected.testimonials || [])];
      const trashRows = trash.testimonials || [];
      updateAdminStat('admin-stat-pending', pendingRows.length);
      updateAdminStat('admin-stat-approved', (approved.testimonials || []).length);
      list.innerHTML = pendingRows.map(item => cardMarkup(item, 'pending')).join('');
      empty.hidden = pendingRows.length > 0;
      history._allItems = historyRows;
      applyHistoryFilter();
      renderReviewFilters();
      if (trashList) {
        trashList.innerHTML = trashRows.length
          ? trashRows.map(item => cardMarkup(item, 'trash')).join('')
          : `<p class="admin-empty">—</p>`;
        if (trashEmpty) trashEmpty.hidden = trashRows.length > 0;
      }
      attachActions();
      loadDashboardStats();
      renderCharts(pendingRows, approved.testimonials || [], rejected.testimonials || [], trashRows);
      if (window.lucide) {
        window.lucide.createIcons({
          attrs: {
            'stroke-width': 2,
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
          }
        });
      }
    } catch (err) {
      list.innerHTML = '';
      setStatus(list, err.message === 'unauthorized' ? str('wrongToken') : str('networkError'), true);
      if (err.message === 'unauthorized') setTimeout(() => showLogin(true), 1500);
    }
  }

  function attachActions() {
    const bind = () => {
      document.querySelectorAll('#admin-list .admin-item-actions button, #admin-history-list .admin-item-actions button, #admin-trash-list .admin-item-actions button').forEach(btn => {
        if (btn._bound) return;
        btn._bound = true;
        btn.addEventListener('click', async () => {
          const card = btn.closest('.admin-item');
          const container = card?.closest('#admin-list, #admin-history-list, #admin-trash-list');
          const context = container?.id === 'admin-list' ? 'pending'
            : container?.id === 'admin-trash-list' ? 'trash' : 'history';
          await handleModeration(card, btn.dataset.action, context);
        });
      });
    };
    // Observer pour re-binder après un re-rendu (loadAll)
    const observer = new MutationObserver(bind);
    observer.observe(document.getElementById('admin-panel'), { childList: true, subtree: true });
    bind();
  }

  async function tryLogin(token) {
    const status = document.getElementById('admin-login-status');
    setStatus(status, str('loading'), false);
    try {
      state.token = token;
      await api('status=pending');
      sessionStorage.setItem(TOKEN_KEY, token);
      showPanel();
    } catch (err) {
      state.token = '';
      if (err.message === 'rateLimited') {
        status.textContent = str('rateLimited');
        showLogin('rateLimited');
        return;
      }
      const len = token.length;
      status.textContent = str('wrongToken') + (len ? ` (${len} caractères saisis)` : '');
      showLogin(true);
    }
  }

  document.getElementById('admin-login-form').addEventListener('submit', async e => {
    e.preventDefault();
    e.stopPropagation();
    await tryLogin(document.getElementById('admin-token').value.trim());
  });

  // Sécurité : la connexion se fait uniquement via le formulaire ci-dessus.
  // Un token passé par ?t= ou #t= resterait dans l'historique du navigateur
  // et les journaux serveur — ce chemin d'auto-connexion a été retiré.

  // ===== CHARTS =====
  function renderCharts(pending, approved, rejected, trash) {
    drawStatusChart(pending.length, approved.length, rejected.length, trash.length);
    drawNotesChart([...approved, ...rejected, ...pending]);
  }

  function drawStatusChart(pending, approved, rejected, trash) {
    const canvas = document.getElementById('admin-chart-status');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = 280, h = 200;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const total = pending + approved + rejected + trash;
    if (total === 0) { ctx.font = '13px Montserrat'; ctx.fillStyle = '#999'; ctx.textAlign = 'center'; ctx.fillText('Aucun avis', w/2, h/2); return; }

    const data = [
      { label: 'En attente', value: pending, color: '#F2C94C' },
      { label: 'Publié', value: approved, color: '#009688' },
      { label: 'Refusé', value: rejected, color: '#E8927C' },
      { label: 'Corbeille', value: trash, color: '#CCC' },
    ].filter(d => d.value > 0);

    // Donut chart
    const cx = 75, cy = 90, r = 55, innerR = 32;
    let startAngle = -Math.PI / 2;
    data.forEach(d => {
      const sweep = (d.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, startAngle + sweep);
      ctx.arc(cx, cy, innerR, startAngle + sweep, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.fill();
      startAngle += sweep;
    });
    ctx.font = 'bold 20px Montserrat';
    ctx.fillStyle = '#1A1A2E';
    ctx.textAlign = 'center';
    ctx.fillText(total, cx, cy + 6);

    // Legend
    let ly = 20;
    ctx.font = '12px Open Sans';
    data.forEach(d => {
      ctx.fillStyle = d.color;
      ctx.fillRect(w - 120, ly, 10, 10);
      ctx.fillStyle = '#333';
      ctx.textAlign = 'left';
      ctx.fillText(`${d.label} (${d.value})`, w - 104, ly + 10);
      ly += 22;
    });
  }

  function drawNotesChart(items) {
    const canvas = document.getElementById('admin-chart-notes');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = 280, h = 200;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const counts = [0, 0, 0, 0, 0];
    items.forEach(item => {
      const n = item.rating || item.note || 0;
      if (n >= 1 && n <= 5) counts[n - 1]++;
    });
    const max = Math.max(...counts, 1);

    const barW = 32, gap = 12, startX = 30;
    const chartH = 130, baseY = h - 35;
    ctx.font = '11px Open Sans';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';

    counts.forEach((count, i) => {
      const x = startX + i * (barW + gap);
      const barH = max > 0 ? (count / max) * chartH : 0;
      // Gradient bar
      const grad = ctx.createLinearGradient(x, baseY - barH, x, baseY);
      grad.addColorStop(0, '#009688');
      grad.addColorStop(1, '#00695C');
      ctx.fillStyle = grad;
      ctx.fillRect(x, baseY - barH, barW, barH);
      // Number on top
      ctx.fillStyle = '#1A1A2E';
      ctx.font = 'bold 11px Montserrat';
      ctx.fillText(count, x + barW / 2, baseY - barH - 5);
      // Star label
      ctx.font = '11px Open Sans';
      ctx.fillStyle = '#666';
      ctx.fillText(i + 1 + '★', x + barW / 2, baseY + 15);
    });
  }

  document.getElementById('admin-logout').addEventListener('click', () => showLogin(false));
  document.getElementById('admin-refresh').addEventListener('click', loadAll);

  // ===== Déconnexion automatique après inactivité =====
  // sessionStorage garde la session ouverte tant que l'onglet reste ouvert ;
  // sur un poste partagé, un admin qui oublie l'onglet resterait connecté
  // indéfiniment. On force une reconnexion après 20 minutes sans activité.
  const IDLE_TIMEOUT_MS = 20 * 60 * 1000;
  let idleTimer = null;
  function resetIdleTimer() {
    if (!state.token) return;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (state.token) showLogin('sessionExpired');
    }, IDLE_TIMEOUT_MS);
  }
  ['pointerdown', 'keydown', 'visibilitychange'].forEach(evt => {
    document.addEventListener(evt, resetIdleTimer, { passive: true });
  });

  new MutationObserver(() => {
    document.getElementById('admin-refresh').textContent = str('refresh');
    document.getElementById('admin-panel-title') && (document.querySelector('.admin-panel-title').textContent = str('pendingTitle'));
    const historySummary = document.getElementById('admin-history-summary');
    if (historySummary) historySummary.textContent = str('historySummary');
    const trashSummary = document.getElementById('admin-trash-summary');
    if (trashSummary) trashSummary.textContent = str('trashSummary');
    const trashEmpty = document.getElementById('admin-trash-empty');
    if (trashEmpty) trashEmpty.textContent = str('emptyTrash');
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  if (state.token) showPanel();
})();
