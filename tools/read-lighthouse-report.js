const fs = require('fs');
const path = process.argv[2];
const report = JSON.parse(fs.readFileSync(path, 'utf8'));
const categories = report.categories || {};
const audits = report.audits || {};
const pick = id => audits[id]?.displayValue ?? audits[id]?.numericValue ?? null;
const output = {
  fetchTime: report.fetchTime,
  finalUrl: report.finalUrl,
  performance: categories.performance?.score == null ? null : Math.round(categories.performance.score * 100),
  metrics: {
    FCP: pick('first-contentful-paint'),
    LCP: pick('largest-contentful-paint'),
    TBT: pick('total-blocking-time'),
    CLS: pick('cumulative-layout-shift'),
    SI: pick('speed-index'),
    TTI: pick('interactive')
  },
  diagnostics: {
    payload: pick('total-byte-weight'),
    domSize: pick('dom-size'),
    mainThread: pick('mainthread-work-breakdown'),
    unusedCss: pick('unused-css-rules'),
    unusedJs: pick('unused-javascript'),
    lcpElement: audits['largest-contentful-paint-element']?.details?.items?.[0]?.node?.snippet || null,
    renderBlocking: (audits['render-blocking-resources']?.details?.items || []).slice(0, 12).map(item => ({url: item.url, wastedMs: item.wastedMs || null}))
  }
};
console.log(JSON.stringify(output, null, 2));
const failed = Object.entries(audits).filter(([id, audit]) => audit.score === 0 && ['errors-in-console','render-blocking-resources','unminified-css','unminified-javascript'].includes(id));
if (failed.length) console.log('notableFailures=' + JSON.stringify(failed.map(([id]) => id)));
