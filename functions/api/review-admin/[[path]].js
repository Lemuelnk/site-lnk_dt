const json = (data, status = 200, extraHeaders = {}) => new Response(JSON.stringify(data), { status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store', ...extraHeaders} });

function authorized(request, env){
  const expected = env.REVIEW_ADMIN_TOKEN;
  if(!expected) return false;
  const header = request.headers.get('Authorization') || '';
  return header === `Bearer ${expected}`;
}

// ===== Anti brute-force : limite de tentatives échouées par IP =====
const RATE_LIMIT_WINDOW_MINUTES = 10;
const RATE_LIMIT_MAX_ATTEMPTS = 8;

async function ensureAttemptsTable(db){
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS login_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, ip TEXT NOT NULL, created_at TEXT NOT NULL)`
  ).run().catch(() => {});
}

async function isRateLimited(db, ip){
  const row = await db.prepare(
    `SELECT COUNT(*) as n FROM login_attempts WHERE ip = ? AND created_at >= datetime('now', ?)`
  ).bind(ip, `-${RATE_LIMIT_WINDOW_MINUTES} minutes`).first().catch(() => null);
  return !!(row && row.n >= RATE_LIMIT_MAX_ATTEMPTS);
}

async function recordFailedAttempt(db, ip){
  await db.prepare(`INSERT INTO login_attempts (ip, created_at) VALUES (?, datetime('now'))`).bind(ip).run().catch(() => {});
}

async function purgeOldAttempts(db){
  await db.prepare(`DELETE FROM login_attempts WHERE created_at < datetime('now', '-1 day')`).run().catch(() => {});
}

/**
 * S'assure que la table contient les colonnes optionnelles (migration idempotente).
 * Appelée une fois par requête admin ; très peu coûteuse car les PRAGMA sont des no-ops
 * quand les colonnes existent déjà.
 */
async function migrate(db){
  await db.prepare(`ALTER TABLE testimonials ADD COLUMN status TEXT NOT NULL DEFAULT 'pending'`).run().catch(() => {});
  await db.prepare(`ALTER TABLE testimonials ADD COLUMN deleted_at TEXT`).run().catch(() => {});
  await db.prepare(`UPDATE testimonials SET deleted_at = created_at WHERE status = 'deleted' AND deleted_at IS NULL`).run().catch(() => {});
}

/**
 * Purge automatique de la corbeille : les avis supprimés depuis plus de 30 jours
 * sont définitivement effacés.
 */
async function purgeTrash(db){
  try {
    await db.prepare(`DELETE FROM testimonials WHERE status = 'rejected' AND deleted_at IS NOT NULL AND deleted_at <= datetime('now', '-30 days')`).run();
  } catch (_e) {}
}

export async function onRequest(context){
  const db = context.env.REVIEWS_DB;
  const ip = context.request.headers.get('CF-Connecting-IP') || 'unknown';

  if(db){
    await ensureAttemptsTable(db);
    if(await isRateLimited(db, ip)){
      return json(
        {message:'Trop de tentatives. Réessayez dans quelques minutes.'},
        429,
        {'Retry-After': String(RATE_LIMIT_WINDOW_MINUTES * 60)}
      );
    }
  }

  if(!authorized(context.request, context.env)){
    if(db) await recordFailedAttempt(db, ip);
    return json({message:'Unauthorized.'},401);
  }
  if(!db) return json({message:'Reviews database is not configured.'},503);
  await migrate(db);
  await purgeTrash(db);
  await purgeOldAttempts(db);
  const url = new URL(context.request.url);
  if(context.request.method === 'GET'){
    const status = url.searchParams.get('status') || 'pending';
    const allowed = ['pending','approved','rejected','all','trash'];
    if(!allowed.includes(status)) return json({message:'Invalid status.'},400);
    let query;
    let bind = [];
    if(status === 'all'){
      query = `SELECT * FROM testimonials ORDER BY created_at DESC`;
    } else if(status === 'trash'){
      query = `SELECT * FROM testimonials WHERE status = 'rejected' AND deleted_at IS NOT NULL ORDER BY deleted_at DESC`;
    } else {
      // Pour l'historique (all), exclure les éléments en corbeille (rejected + deleted_at non nul)
      if(status === 'rejected') {
         query = `SELECT * FROM testimonials WHERE status = 'rejected' AND deleted_at IS NULL ORDER BY created_at DESC`;
      } else {
         query = `SELECT * FROM testimonials WHERE status=? ORDER BY created_at DESC`;
         bind = [status];
      }
    }
    const result = bind.length
      ? await db.prepare(query).bind(...bind).all()
      : await db.prepare(query).all();
    return json({testimonials:result.results || []});
  }
  if(context.request.method === 'POST'){
    const payload = await context.request.json();
    const id = String(payload.id || '');
    const action = String(payload.action || '');
    if(!id || !['approve','reject','reset','delete','deleteForever'].includes(action)) return json({message:'Invalid moderation request.'},400);
    const now = new Date().toISOString();
    
    if(action === 'deleteForever'){
      const result = await db.prepare(`DELETE FROM testimonials WHERE id = ?`).bind(id).run();
      return json({ok:true, deleted:true});
    }

    let nextStatus = 'rejected';
    let deletedAt = null;
    
    if(action === 'approve') { nextStatus = 'approved'; }
    else if(action === 'reject') { nextStatus = 'rejected'; }
    else if(action === 'reset') { nextStatus = 'pending'; }
    else if(action === 'delete') { nextStatus = 'rejected'; deletedAt = now; }
    
    const result = await db.prepare(`UPDATE testimonials SET status = ?, deleted_at = ? WHERE id = ?`).bind(nextStatus, deletedAt, id).run();
    if(!result.success) return json({message:'Unable to update review.'},500);
    return json({ok:true,status:nextStatus,deleted_at: deletedAt});
  }
  return json({message:'Method not allowed.'},405);
}
