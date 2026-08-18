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
      loading: 'Chargement\u2026',
      pendingTitle: 'Avis en attente de validation',
      refresh: 'Actualiser',
      empty: 'Aucun avis en attente de validation. Tous les avis ont été traités.',
      historySummary: 'Avis déjà publiés et refusés (historique)',
      approve: 'Publier',
      reject: 'Refuser',
      confirmed: 'L\u2019avis a été publié.',
      rejected: 'L\u2019avis a été refusé.',
      error: 'Une erreur est survenue. Réessayez.',
      networkError: 'Impossible de contacter le serveur. Vérifiez votre connexion.',
      stars: n => 'Note\u00a0: ' + n + '/5',
      noOrg: n => n || '—',
      date: d => {
        try { return new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }); }
        catch (_e) { return d; }
      },
      footer: 'LNK Design Touch — Administration des avis. Cette page n\u2019est pas indexée et ne doit pas être partagée.'
    },
    en: {
      loginTitle: 'Restricted access',
      loginBody: 'This page is reserved for the administrator of LNK Design Touch.',
      tokenLabel: 'Access key',
      tokenPlaceholder: 'Access key',
      submit: 'Sign in',
      wrongToken: 'Invalid access key.',
      loading: 'Loading\u2026',
      pendingTitle: 'Reviews pending approval',
      refresh: 'Refresh',
      empty: 'No reviews awaiting approval. All reviews have been processed.',
      historySummary: 'Published and rejected reviews (history)',
      approve: 'Publish',
      reject: 'Reject',
      confirmed: 'The review has been published.',
      rejected: 'The review has been rejected.',
      error: 'An error occurred. Please try again.',
      networkError: 'Unable to reach the server. Check your connection.',
      stars: n => 'Rating\u00a0: ' + n + '/5',
      noOrg: n => n || '—',
      date: d => {
        try { return new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }); }
        catch (_e) { return d; }
      },
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

  function cardMarkup(item) {
    return (
      `<article class="admin-item" data-id="${escapeHtml(item.id)}">` +
      `<div class="admin-item-head"><p class="admin-item-name">${escapeHtml(item.name)}</p><p class="admin-item-org">${escapeHtml(str('noOrg')(item.organization))} · ${escapeHtml(item.project || '—')}</p><p class="admin-item-rating">${str('stars')(item.rating)} ${starsMarkup(item.rating)}</p><p class="admin-item-date">${str('date')(item.created_at)}</p></div>` +
      `<blockquote class="admin-item-review">${escapeHtml(item.review)}</blockquote>` +
      `<div class="admin-item-actions"><button type="button" class="admin-btn-approve" data-action="approve">${str('approve')}</button><button type="button" class="admin-btn-reject" data-action="reject">${str('reject')}</button></div>` +
      `</article>`
    );
  }

  function setStatus(element, message, isError) {
    element.textContent = message;
    element.className = 'admin-status' + (isError ? ' is-error' : ' is-success');
  }

  const state = { token: sessionStorage.getItem(TOKEN_KEY) || '' };

  function showPanel() {
    document.getElementById('admin-login').hidden = true;
    document.getElementById('admin-panel').hidden = false;
    document.getElementById('admin-logout').hidden = false;
    document.getElementById('admin-refresh').textContent = str('refresh');
    loadAll();
  }

  function showLogin(error) {
    state.token = '';
    sessionStorage.removeItem(TOKEN_KEY);
    document.getElementById('admin-login').hidden = false;
    document.getElementById('admin-panel').hidden = true;
    document.getElementById('admin-logout').hidden = true;
    const status = document.getElementById('admin-login-status');
    if (error) setStatus(status, str('wrongToken'), true);
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
    const response = await fetch(ADMIN_ENDPOINT + (path ? '?' + path : ''), {
      headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${state.token}` }
    });
    if (response.status === 401) throw new Error('unauthorized');
    if (!response.ok) throw new Error('network');
    return await response.json();
  }

  async function loadAll() {
    const list = document.getElementById('admin-list');
    const empty = document.getElementById('admin-empty');
    const history = document.getElementById('admin-history-list');
    list.innerHTML = `<p class="admin-status">${str('loading')}</p>`;
    try {
      const pending = await api('status=pending');
      const others = await api('status=all');
      const pendingRows = pending.testimonials || [];
      const otherRows = (others.testimonials || []).filter(item => item.status !== 'pending');
      list.innerHTML = pendingRows.map(cardMarkup).join('');
      empty.hidden = pendingRows.length > 0;
      history.innerHTML = otherRows.length
        ? otherRows.map(cardMarkup).join('')
        : `<p class="admin-empty">—</p>`;
      attachActions();
    } catch (err) {
      list.innerHTML = '';
      setStatus(list, err.message === 'unauthorized' ? str('wrongToken') : str('networkError'), true);
      if (err.message === 'unauthorized') setTimeout(() => showLogin(true), 1500);
    }
  }

  function attachActions() {
    document.querySelectorAll('#admin-list .admin-item-actions button').forEach(btn => {
      btn.addEventListener('click', async () => {
        const card = btn.closest('.admin-item');
        const id = card.dataset.id;
        const action = btn.dataset.action;
        btn.disabled = true;
        try {
          const response = await fetch(ADMIN_ENDPOINT, {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.token}` },
            body: JSON.stringify({ id, action })
          });
          if (response.status === 401) throw new Error('unauthorized');
          const result = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(result.message || 'error');
          card.remove();
          if (!document.getElementById('admin-list').querySelector('.admin-item')) {
            document.getElementById('admin-empty').hidden = false;
          }
        } catch (err) {
          btn.disabled = false;
          if (err.message === 'unauthorized') showLogin(true);
          else setStatus(card.querySelector('.admin-item-actions') || card, str('error'), true);
        }
      });
    });
  }

  async function tryLogin(token) {
    const status = document.getElementById('admin-login-status');
    setStatus(status, str('loading'), false);
    try {
      await api('status=pending');
      state.token = token;
      sessionStorage.setItem(TOKEN_KEY, token);
      showPanel();
    } catch (err) {
      // Diagnostic discret : indiquer la longueur attendue vs saisie pour détecter une erreur de copie
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

  // Connexion directe par URL : admin-reviews.html?t=<clé> ou #t=<clé> (le hash survive aux redirections)
  const params = new URLSearchParams(location.search);
  const urlToken = params.get('t') || new URLSearchParams(location.hash.replace(/^#/, '')).get('t');
  if (urlToken) tryLogin(urlToken);

  // Gérer les changements de hash sans rechargement (ex. copie du lien après ouverture)
  window.addEventListener('hashchange', () => {
    const hashToken = new URLSearchParams(location.hash.replace(/^#/, '')).get('t');
    if (hashToken && !state.token) tryLogin(hashToken);
  });

  document.getElementById('admin-logout').addEventListener('click', () => showLogin(false));
  document.getElementById('admin-refresh').addEventListener('click', loadAll);
  new MutationObserver(() => {
    document.getElementById('admin-refresh').textContent = str('refresh');
    document.getElementById('admin-panel-title') && (document.querySelector('.admin-panel-title').textContent = str('pendingTitle'));
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  if (state.token) showPanel();
})();
