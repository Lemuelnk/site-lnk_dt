(function(){
  const grid = document.getElementById('testimonials-grid');
  const summary = document.getElementById('testimonials-summary');
  if(!grid || !summary) return;

  const state = { approved: [], stats: { count:0, average:0, breakdown:{1:0,2:0,3:0,4:0,5:0} } };
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const initials = value => escapeHtml(String(value || '?').trim().split(/\s+/).slice(0,2).map(p => p[0] || '').join('').toUpperCase());
  const ratingStars = rating => Array.from({length:5}, (_,i) => i < rating ? '★' : '☆').join('');
  const formatAverage = value => Number(value || 0).toFixed(1).replace('.', ',');

  function computeStats(){
    const breakdown={1:0,2:0,3:0,4:0,5:0};
    state.approved.forEach(item => breakdown[Math.max(1,Math.min(5,Number(item.rating)||0))]++);
    const count=state.approved.length;
    const sum=state.approved.reduce((s,item)=>s+Number(item.rating||0),0);
    state.stats={count,average:count?sum/count:0,breakdown};
  }

  function renderSummary(target=document){
    const avg=state.stats.count?formatAverage(state.stats.average):'—', count=state.stats.count||0;
    const averageEl=target.getElementById?.('testimonials-average'); if(averageEl) averageEl.textContent=avg;
    const countEl=target.getElementById?.('testimonials-count'); if(countEl) countEl.textContent=count;
    const starsEl=target.getElementById?.('testimonials-average-stars'); if(starsEl) starsEl.textContent=count?ratingStars(Math.round(state.stats.average)):'☆☆☆☆☆';
    const breakdown=target.getElementById?.('testimonials-breakdown');
    if(breakdown) breakdown.innerHTML=[5,4,3,2,1].map(r=>{const n=state.stats.breakdown[r]||0,pct=count?Math.round(n/count*100):0;return `<div class="rating-row"><span>${r} ★</span><span class="rating-track"><i style="width:${pct}%"></i></span><strong>${n}</strong></div>`;}).join('');
  }

  function card(item,index){
    const rating=Math.max(1,Math.min(5,Number(item.rating)||0));
    const photo=item.photo?`<img src="${escapeHtml(item.photo)}" alt="" loading="lazy">`:`<span aria-hidden="true">${initials(item.name)}</span>`;
    return `<article class="testimonial-card"><span class="testimonial-number">${String(index+1).padStart(2,'0')}</span><div class="testimonial-stars" aria-label="Note : ${rating} sur 5">${ratingStars(rating)}</div><blockquote class="testimonial-quote">${escapeHtml(item.review)}</blockquote><div class="testimonial-meta"><div class="testimonial-avatar">${photo}</div><div><p class="testimonial-name">${escapeHtml(item.name)}</p>${item.organization?`<p class="testimonial-org">${escapeHtml(item.organization)}</p>`:''}${item.project?`<span class="testimonial-project">${escapeHtml(item.project)}</span>`:''}</div></div></article>`;
  }

  function renderAll(){
    grid.innerHTML=state.approved.length?state.approved.slice(0,3).map(card).join(''):'<p class="testimonials-empty">Les premiers témoignages apparaîtront ici après validation.</p>';
    const viewAll=document.getElementById('testimonials-view-all');
    if(viewAll){viewAll.disabled=!state.approved.length;viewAll.textContent=`Voir tous les avis${state.stats.count?` (${state.stats.count})`:''}`;}
    renderSummary(document);
  }

  function renderModal(){
    const all=document.getElementById('testimonials-all-grid'), modalSummary=document.getElementById('testimonials-modal-summary');
    if(!all) return;
    all.innerHTML=state.approved.length?state.approved.map(card).join(''):'<p class="testimonials-empty">Aucun avis publié pour le moment.</p>';
    if(modalSummary) modalSummary.innerHTML=`<strong>${state.stats.count?formatAverage(state.stats.average):'—'} / 5</strong><span>${ratingStars(state.stats.count?Math.round(state.stats.average):0)}</span><em>${state.stats.count} avis</em>`;
  }

  function setupModal(){
    const modal=document.getElementById('testimonials-modal'),open=document.getElementById('testimonials-view-all'),close=document.getElementById('testimonials-modal-close');
    if(!modal||!open||!close)return;
    open.addEventListener('click',()=>{renderModal();modal.showModal();});
    close.addEventListener('click',()=>modal.close());
    modal.addEventListener('click',e=>{if(e.target===modal)modal.close();});
  }

  function setupRating(){
    const input=document.getElementById('testimonial-rating');
    document.querySelectorAll('.star-choice').forEach(btn=>btn.addEventListener('click',()=>{
      const rating=Number(btn.dataset.rating); if(input) input.value=rating;
      document.querySelectorAll('.star-choice').forEach(star=>{const active=Number(star.dataset.rating)<=rating;star.classList.toggle('is-selected',active);star.setAttribute('aria-checked',String(Number(star.dataset.rating)===rating));});
    }));
  }

  async function submitReview(payload){
    const response=await fetch('/api/testimonials',{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify(payload)});
    const result=await response.json().catch(()=>({}));
    if(!response.ok) throw new Error(result.error||result.message||'Impossible d’envoyer votre avis.');
    return result;
  }

  function setupForm(){
    const form=document.getElementById('testimonial-form'),status=document.getElementById('testimonial-form-status');
    if(!form||!status)return;
    form.addEventListener('submit',async e=>{
      e.preventDefault();
      const data=Object.fromEntries(new FormData(form).entries());
      if(!data.rating){status.textContent='Choisissez une note de 1 à 5 étoiles.';status.className='testimonial-form-status is-error';return;}
      if(!String(data.name||'').trim()||!String(data.review||'').trim()){status.textContent='Merci de renseigner votre nom et votre témoignage.';status.className='testimonial-form-status is-error';return;}
      const turnstileToken = data['cf-turnstile-response'] || '';
      if(!turnstileToken){status.textContent='Veuillez patienter pendant la vérification anti-spam, puis réessayez.';status.className='testimonial-form-status is-error';return;}
      data.turnstileToken = turnstileToken;
      const button=form.querySelector('button[type="submit"]'); if(button)button.disabled=true;
      status.textContent='Envoi en cours…';status.className='testimonial-form-status';
      try{
        await submitReview(data);
        form.reset();
        document.querySelectorAll('.star-choice').forEach(star=>{star.classList.remove('is-selected');star.setAttribute('aria-checked','false');});
        status.textContent='Merci ! Votre avis a bien été reçu et sera publié après validation.';
        status.className='testimonial-form-status is-success';
      }catch(err){
        status.textContent=err.message||'Une erreur est survenue. Réessayez plus tard.';
        status.className='testimonial-form-status is-error';
      }finally{if(button)button.disabled=false;}
    });
  }

  async function load(){
    try{
      const response=await fetch('/api/testimonials',{headers:{'Accept':'application/json'}});
      if(!response.ok)throw new Error('Impossible de charger les avis.');
      const data=await response.json();
      state.approved=Array.isArray(data.testimonials)?data.testimonials.filter(item=>item.status==='approved'&&item.review):[];
    }catch(_){state.approved=[];}
    computeStats(); renderAll();
  }

  setupModal(); setupRating(); setupForm(); load();
})();
