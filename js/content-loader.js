/**
 * LNK Design Touch - Content Loader (Minimal Version)
 * Only handles Case Studies data.
 * Navigation and other static sections are handled directly in HTML.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check for Case Study page
    if (window.location.pathname.includes('case-study.html')) {
        loadCaseStudy();
    }
});

async function loadCaseStudy() {
    const urlParams = new URLSearchParams(window.location.search);
    const studyId = urlParams.get('id');
    if (!studyId) return;

    try {
        const response = await fetch('data/case-studies.json');
        const data = await response.json();
        const study = data[studyId];

        if (study) {
            renderCaseStudy(study);
        }
    } catch (e) {
        console.error("Error loading case study:", e);
    }
}

function renderCaseStudy(study) {
    const lang = document.documentElement.getAttribute('data-lang') || 'fr';
    const content = study[lang] || study['fr'];

    // Update text content
    const mappings = {
        '[data-study-title]': content.title,
        '[data-study-client]': content.client,
        '[data-study-category]': content.category,
        '[data-study-year]': content.year,
        '[data-study-challenge-title]': content.challengeTitle,
        '[data-study-challenge-text]': content.challengeText,
        '[data-study-solution-title]': content.solutionTitle,
        '[data-study-solution-text]': content.solutionText
    };

    for (const [selector, text] of Object.entries(mappings)) {
        const el = document.querySelector(selector);
        if (el) el.textContent = text;
    }

    // Update images
    const imgContainer = document.querySelector('[data-study-images]');
    if (imgContainer && content.images) {
        imgContainer.innerHTML = content.images.map(img => `
            <div class="study-image-wrapper">
                <img src="${img.url}" alt="${img.alt || ''}" loading="lazy">
                ${img.caption ? `<p class="study-image-caption">${img.caption}</p>` : ''}
            </div>
        `).join('');
    }
}
