/**
 * LNK Design Touch — Case Studies Content Loader
 * Dynamically loads case study metadata
 */
(async function() {
  try {
    const res = await fetch('data/case-studies.json');
    if (!res.ok) return;
    const caseStudies = await res.json();
    window.LNK_CASE_STUDIES = caseStudies;
  } catch (e) {
    console.warn('[content-loader] Failed to load case studies:', e);
  }
})();
