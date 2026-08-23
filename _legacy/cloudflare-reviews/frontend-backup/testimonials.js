const FORMSPREE_REVIEWS_ENDPOINT = 'https://formspree.io/f/xljrbrnk';
(function(){
  const grid = document.getElementById('testimonials-grid');
  const summary = document.getElementById('testimonials-summary');
  if(!grid || !summary) return;

  const API_URL = '/api/testimonials';
  const TURNSTILE_SITE_KEY = document.documentElement.dataset.turnstileSiteKey || '';
  const state = { approved: [], stats: { count: 0, average: 0, breakdown: {1:0,2:0,3:0,4:0,5:0} }, turnstileToken: '' };
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const initials = value => escapeHtml(String(value || '?').trim().split(/\s+/).slice(0,2).map(part => part[0] || '').join('').toUpperCase());
  const ratingStars = rating => Array.from({length:5}, (_, i) => i < rating ? '★' : '☆').join('');
  const formatAverage = value => Number(value || 0).toFixed(1).replace('.', ',');

  function renderSummary(target=document){
    const avg = state.stats.count ? formatAverage(state.stats.average) : '—';
    const count = state.stats.count || 0;
    const averageEl = target.getElementById ? target.getElementById('testimonials-average') : null;
    if(averageEl) averageEl.textContent = avg;
    const countEl = target.getElementById ? target.getElementById('testimonials-count') : null;
    if(countEl) countEl.textContent = count;
    const starsEl = target.getElementById ? target.getElementById('testimonials-average-stars') : null;
    if(starsEl) starsEl.textContent = count ? ratingStars(Math.round(state.stats.average)) : '☆☆☆☆☆';
    const breakdown = target.getElementById ? target.getElementById('testimonials-breakdown') : null;
    if(breakdown){
      breakdown.innerHTML = [5,4,3,2,1].map(r => {
        const n = Number(state.stats.breakdown?.[r] || 0);
        const pct = count ? Math.round((n / count) * 100) : 0;
        return `<div class="rating-row"><span>${r} ★</span><span class="rating-track"><i style="width:${pct}%"></i></span><strong>${n}</strong></div>`;
      }).join('');
    }
  }

  function card(item, index){
    const rating = Math.max(1, Math.min(5, Number(item.rating) || 0));
    const photo = item.photo ? `<img src="${escapeHtml(item.photo)}" alt="" loading="lazy">` : `<span aria-hidden="true">${initials(item.name)}</span>`;
    return `<article class="testimonial-card">
      <span class="testimonial-number">${String(index + 1).padStart(2,'0')}</span>
      <div class="testimonial-stars" aria-label="Note : ${rating} sur 5">${ratingStars(rating)}</div>
      <blockquote class="testimonial-quote">${escapeHtml(item.review)}</blockquote>
      <div class="testimonial-meta">
        <div class="testimonial-avatar">${photo}</div>
        <div>
          <p class="testimonial-name">${escapeHtml(item.name)}</p>
          ${item.organization ? `<p class="testimonial-org">${escapeHtml(item.organization)}</p>` : ''}
          ${item.project ? `<span class="testimonial-project">${escapeHtml(item.project)}</span>` : ''}
        </div>
      </div>
    </article>`;
  }

  function renderAll(){
    grid.innerHTML = state.approved.length
      ? state.approved.slice(0,3).map(card).join('')
      : '<p class="testimonials-empty">Les premiers témoignages apparaîtront ici après validation.</p>';
    const viewAll = document.getElementById('testimonials-view-all');
    if(viewAll){ viewAll.disabled = state.approved.length === 0; viewAll.textContent = `Voir tous les avis${state.stats.count ? ` (${state.stats.count})` : ''}`; }
    renderSummary(document);
  }

  function renderModal(){
    const all = document.getElementById('testimonials-all-grid');
    const modalSummary = document.getElementById('testimonials-modal-summary');
    if(!all) return;
    all.innerHTML = state.approved.length ? state.approved.map(card).join('') : '<p class="testimonials-empty">Aucun avis publié pour le moment.</p>';
    if(modalSummary) modalSummary.innerHTML = `<strong>${state.stats.count ? formatAverage(state.stats.average) : '—'} / 5</strong><span>${ratingStars(state.stats.count ? Math.round(state.stats.average) : 0)}</span><em>${state.stats.count} avis</em>`;
  }

  function setupModal(){
    const modal = document.getElementById('testimonials-modal');
    const open = document.getElementById('testimonials-view-all');
    const close = document.getElementById('testimonials-modal-close');
    if(!modal || !open || !close) return;
    open.addEventListener('click', () => { renderModal(); modal.showModal(); });
    close.addEventListener('click', () => modal.close());
    modal.addEventListener('click', e => { if(e.target === modal) modal.close(); });
  }

  function setupRating(){
    const input = document.getElementById('testimonial-rating');
    document.querySelectorAll('.star-choice').forEach(btn => btn.addEventListener('click', () => {
      const rating = Number(btn.dataset.rating);
      input.value = rating;
      document.querySelectorAll('.star-choice').forEach(star => {
        const active = Number(star.dataset.rating) <= rating;
        star.classList.toggle('is-selected', active);
        star.setAttribute('aria-checked', String(Number(star.dataset.rating) === rating));
      });
    }));
  }

  function setupTurnstile(){
    const host = document.getElementById('testimonial-turnstile');
    if(!host || !TURNSTILE_SITE_KEY) return;
    const render = () => {
      if(window.turnstile && !host.dataset.rendered){
        window.turnstile.render(host, {sitekey: TURNSTILE_SITE_KEY, callback: token => { state.turnstileToken = token; }, 'expired-callback': () => { state.turnstileToken = ''; }, 'error-callback': () => { state.turnstileToken = ''; }});
        host.dataset.rendered = 'true';
      }
    };
    if(window.turnstile) render(); else window.addEventListener('load', render, {once:true});
  }

  function setupForm(){
    const form = document.getElementById('testimonial-form');
    const status = document.getElementById('testimonial-form-status');
    if(!form || !status) return;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if(!data.rating){ status.textContent = 'Choisissez une note de 1 à 5 étoiles.'; status.className = 'testimonial-form-status is-error'; return; }
      if(!data.name.trim() || !data.review.trim()){ status.textContent = 'Merci de renseigner votre nom et votre témoignage.'; status.className = 'testimonial-form-status is-error'; return; }
      if(!TURNSTILE_SITE_KEY){ status.textContent = 'Le formulaire sera activé dès que la protection anti-spam du site sera configurée.'; status.className = 'testimonial-form-status is-error'; return; }
      if(!state.turnstileToken){ status.textContent = 'Validez la protection anti-spam avant l’envoi.'; status.className = 'testimonial-form-status is-error'; return; }
      data.turnstileToken = state.turnstileToken;
      delete data.website;
      const button = form.querySelector('button[type="submit"]');
      button.disabled = true;
      status.textContent = 'Envoi en cours…'; status.className = 'testimonial-form-status';
      try{
        const response = await fetch(API_URL, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
        const result = await response.json().catch(() => ({}));
        if(!response.ok) throw new Error(result.message || 'Impossible d’envoyer votre avis.');
        form.reset();
        document.querySelectorAll('.star-choice').forEach(star => { star.classList.remove('is-selected'); star.setAttribute('aria-checked','false'); });
        state.turnstileToken = '';
        if(window.turnstile) window.turnstile.reset();
        status.textContent = 'Merci ! Votre avis a bien été reçu et sera publié après validation.';
        status.className = 'testimonial-form-status is-success';
      }catch(err){
        status.textContent = err.message || 'Une erreur est survenue. Réessayez plus tard.';
        status.className = 'testimonial-form-status is-error';
      }finally{ button.disabled = false; }
    });
  }

  async function loadDemoTestimonials(){
    try{
      const response = await fetch('data/testimonials.json');
      if(!response.ok) return;
      const data = await response.json();
      const demo = Array.isArray(data.testimonials)
        ? data.testimonials.filter(item => item.status === 'approved' && item.demo === true && item.review)
        : [];
      state.approved = demo;
      const breakdown = {1:0,2:0,3:0,4:0,5:0};
      state.approved.forEach(item => {
        const r = Math.max(1, Math.min(5, Number(item.rating) || 0));
        breakdown[r]++;
      });
      const count = state.approved.length;
      const sum = state.approved.reduce((s, item) => s + Number(item.rating || 0), 0);
      state.stats = {count, average: count ? sum / count : 0, breakdown};
    }catch(_){}
  }

  async function load(){
    try{
      const response = await fetch(`${API_URL}?status=approved`, {headers:{'Accept':'application/json'}});
      if(!response.ok) throw new Error('API unavailable');
      const data = await response.json();
      state.approved = Array.isArray(data.testimonials) ? data.testimonials : [];
      state.stats = data.stats || state.stats;

      // Preview/demo fallback: when the connected reviews database is empty,
      // display the five approved demo testimonials shipped with the site.
      if(state.approved.length === 0) await loadDemoTestimonials();
    }catch(_){
      await loadDemoTestimonials();
    }
    renderAll();
  }

  setupModal();
  setupRating();
  setupForm();
  setupTurnstile();
  load();
})();

/* PASS 3 demo testimonials — FICTIONAL, for display testing only. */
window.LNK_DEMO_TESTIMONIALS = [
  { name:"Amina K.", organization:"Projet exemple", project:"Identité visuelle", rating:5, review:"Très bonne expérience. Le rendu correspond parfaitement à nos attentes.", approved:true },
  { name:"David M.", organization:"Projet exemple", project:"Affiche", rating:4, review:"Une collaboration claire et un résultat propre.", approved:true },
  { name:"Sarah L.", organization:"Projet exemple", project:"Branding", rating:5, review:"Créatif, attentif aux détails et à l'écoute du besoin.", approved:true },
  { name:"Patrick N.", organization:"Projet exemple", project:"Flyer", rating:5, review:"Travail soigné et communication efficace.", approved:true },
  { name:"Chris B.", organization:"Projet exemple", project:"Design social media", rating:4, review:"Une identité visuelle cohérente et un bon accompagnement.", approved:true }
];


/*
 * Formspree reviews migration:
 * Endpoint: https://formspree.io/f/xljrbrnk
 * Approved reviews remain managed in the site's published testimonial data.
 * Legacy Cloudflare/D1 review files are preserved under _legacy/cloudflare-reviews/.
 */
async function submitReviewToFormspree(payload) {
  const response = await fetch(FORMSPREE_REVIEWS_ENDPOINT, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    let detail = '';
    try { detail = (await response.json()).error || ''; } catch (_) {}
    throw new Error(detail || `Formspree submission failed (${response.status})`);
  }
  return response.json().catch(() => ({}));
}
