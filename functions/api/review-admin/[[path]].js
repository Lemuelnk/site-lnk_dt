const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'} });

function authorized(request, env){
  const expected = env.REVIEW_ADMIN_TOKEN;
  const header = request.headers.get('Authorization') || '';
  return expected && header === `Bearer ${expected}`;
}

export async function onRequest(context){
  if(!authorized(context.request, context.env)) return json({message:'Unauthorized.'},401);
  const db = context.env.REVIEWS_DB;
  if(!db) return json({message:'Reviews database is not configured.'},503);
  const url = new URL(context.request.url);
  if(context.request.method === 'GET'){
    const status = url.searchParams.get('status') || 'pending';
    const allowed = ['pending','approved','rejected','all'];
    if(!allowed.includes(status)) return json({message:'Invalid status.'},400);
    const query = status === 'all' ? `SELECT * FROM testimonials ORDER BY created_at DESC` : `SELECT * FROM testimonials WHERE status=? ORDER BY created_at DESC`;
    const result = status === 'all' ? await db.prepare(query).all() : await db.prepare(query).bind(status).all();
    return json({testimonials:result.results || []});
  }
  if(context.request.method === 'POST'){
    const payload = await context.request.json();
    const id = String(payload.id || '');
    const action = String(payload.action || '');
    if(!id || !['approve','reject'].includes(action)) return json({message:'Invalid moderation request.'},400);
    const nextStatus = action === 'approve' ? 'approved' : 'rejected';
    const result = await db.prepare(`UPDATE testimonials SET status=? WHERE id=?`).bind(nextStatus,id).run();
    if(!result.success) return json({message:'Unable to update review.'},500);
    return json({ok:true,status:nextStatus});
  }
  return json({message:'Method not allowed.'},405);
}
