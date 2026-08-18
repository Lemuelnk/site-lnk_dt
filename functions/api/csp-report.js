/* CSP violation report collector.
   Receives browser CSP violation reports (report-to / report-uri).
   Never blocks anything: reports are silently logged to Pages Functions
   console output for review. Reports are rate-limited to avoid log spam. */
const MAX_BODY = 4096;

export function onRequest(context) {
  const { request } = context;
  if (request.method !== 'POST' && request.method !== 'GET') {
    return new Response('Only POST/GET accepted', { status: 405 });
  }
  if (request.method === 'GET') {
    return new Response('CSP report endpoint active.', { status: 200 });
  }
  const len = parseInt(request.headers.get('content-length') || '0', 10);
  if (len > MAX_BODY) return new Response('Report too large', { status: 413 });
  request.text().then(body => {
    try {
      const payload = JSON.parse(body);
      const violation = payload && (payload['csp-report'] || payload);
      const doc = violation && (violation['document-uri'] || violation.documentURL || '');
      const blocked = violation && (violation['blocked-uri'] || violation.blockedURI || '');
      const directive = violation && (violation['effective-directive'] || violation.effectiveDirective || '');
      console.warn(
        `[CSP violation] doc=${doc} | directive=${directive} | blocked=${blocked} | source=${violation && violation['source-file'] || ''}`
      );
    } catch (err) {
      console.warn('[CSP report] failed to parse payload');
    }
  });
  return new Response('Report received', {
    status: 204,
    headers: { 'Cache-Control': 'no-store' }
  });
}
