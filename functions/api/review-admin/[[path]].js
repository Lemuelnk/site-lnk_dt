const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'} });

function authorized(request, env){
  const expected = env.REVIEW_ADMIN_TOKEN;
  if(!expected) return false;
  const header = request.headers.get('Authorization') || '';
  if(header === `Bearer ${expected}`) return true;
  // Fallback : header X-Admin-Token ou paramètre ?token= (réseaux/proxys qui suppriment Authorization)
  const alt = request.headers.get('X-Admin-Token') || '';
  if(alt && alt.trim() === expected) return true;
  const url = new URL(request.url);
  const qt = url.searchParams.get('token') || '';
  return qt === expected;
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
  if(!authorized(context.request, context.env)) return json({message:'Unauthorized.'},401);
  const db = context.env.REVIEWS_DB;
  if(!db) return json({message:'Reviews database is not configured.'},503);
  await migrate(db);
  await purgeTrash(db);
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
