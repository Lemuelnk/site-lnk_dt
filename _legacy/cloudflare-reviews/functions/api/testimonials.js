const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
});

const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS' };
const withCors = response => { Object.entries(corsHeaders).forEach(([k,v]) => response.headers.set(k,v)); return response; };

function clean(value, max){ return String(value ?? '').trim().slice(0, max); }
function validRating(value){ const n = Number(value); return Number.isInteger(n) && n >= 1 && n <= 5; }

async function validateTurnstile(token, secret, ip){
  if(!secret || !token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if(ip) body.set('remoteip', ip);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method:'POST', body });
  if(!response.ok) return false;
  const result = await response.json();
  return result.success === true;
}

export async function onRequestOptions(){ return withCors(new Response(null, { status:204 })); }

export async function onRequestGet(context){
  const db = context.env.REVIEWS_DB;
  if(!db) return withCors(json({message:'Reviews database is not configured.'}, 503));
  try{
    const { results } = await db.prepare(`SELECT id,name,organization,project,rating,review,photo,created_at FROM testimonials WHERE status='approved' ORDER BY created_at DESC`).all();
    const rows = results || [];
    const breakdown = {1:0,2:0,3:0,4:0,5:0};
    let sum = 0;
    rows.forEach(row => { const r = Number(row.rating); if(breakdown[r] !== undefined) breakdown[r]++; sum += r; });
    return withCors(json({ testimonials: rows, stats:{ count:rows.length, average:rows.length ? Number((sum/rows.length).toFixed(2)) : 0, breakdown } }));
  }catch(error){ return withCors(json({message:'Unable to load testimonials.'},500)); }
}

export async function onRequestPost(context){
  const db = context.env.REVIEWS_DB;
  if(!db) return withCors(json({message:'Reviews database is not configured.'}, 503));
  try{
    const payload = await context.request.json();
    if(payload.website) return withCors(json({message:'Unable to process submission.'},400));
    const name = clean(payload.name,80);
    const organization = clean(payload.organization,120);
    const project = clean(payload.project,80);
    const review = clean(payload.review,1000);
    const rating = Number(payload.rating);
    if(name.length < 2 || review.length < 10 || !validRating(rating)) return withCors(json({message:'Nom, témoignage et note valide sont requis.'},400));
    const ok = await validateTurnstile(payload.turnstileToken, context.env.TURNSTILE_SECRET, context.request.headers.get('CF-Connecting-IP'));
    if(!ok) return withCors(json({message:'La vérification anti-spam a échoué. Réessayez.'},400));

    const id = crypto.randomUUID();
    await db.prepare(`INSERT INTO testimonials (id,name,organization,project,rating,review,photo,status,created_at) VALUES (?,?,?,?,?,?,?,'pending',CURRENT_TIMESTAMP)`)
      .bind(id,name,organization,project,rating,review,'').run();

    await notifyAdmin(context.env, {id,name,organization,project,rating,review});
    return withCors(json({ok:true,message:'Votre avis a bien été reçu et sera publié après validation.'},201));
  }catch(error){
    return withCors(json({message:'Impossible d’enregistrer votre avis pour le moment.'},500));
  }
}

async function notifyAdmin(env, item){
  if(!env.CF_ACCOUNT_ID || !env.CF_EMAIL_API_TOKEN || !env.REVIEW_FROM || !env.REVIEW_ADMIN_EMAIL) return;
  const subject = `Nouveau témoignage LNK_DT — ${item.rating}/5`;
  const text = `Un nouvel avis est en attente de validation.\n\nNom: ${item.name}\nOrganisation: ${item.organization || '-'}\nProjet: ${item.project || '-'}\nNote: ${item.rating}/5\n\nTémoignage:\n${item.review}\n\nID: ${item.id}\n\nOuvrez l'espace d'administration des avis pour valider ou refuser ce témoignage.`;
  try{
    await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/email/sending/send`, {
      method:'POST', headers:{'Authorization':`Bearer ${env.CF_EMAIL_API_TOKEN}`,'Content-Type':'application/json'},
      body:JSON.stringify({from:env.REVIEW_FROM,to:[env.REVIEW_ADMIN_EMAIL],subject,text})
    });
  }catch(_){ /* Notification failure must not erase a valid pending review. */ }
}
