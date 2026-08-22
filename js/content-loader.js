/**
 * LNK Design Touch — No-Code Content Loader
 * Dynamically injects content from site-content.json into the page
 */
(async function() {
  try {
    const res = await fetch('data/site-content.json');
    if (!res.ok) return;
    const content = await res.json();
    window.LNK_SITE_CONTENT = content;

    function updateContent() {
      const lang = document.documentElement.lang || 'fr';
      
      // Helper to get localized string
      const t = (obj) => {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        return obj[lang] || obj['fr'] || '';
      };

      // 1. Update Navigation
      if (content.navigation) {
        const nav = document.querySelector('#site-nav');
        if (nav) {
          const links = nav.querySelectorAll('a:not(.button)');
          if (links.length >= 4) {
            links[0].textContent = t(content.navigation.home);
            links[1].textContent = t(content.navigation.brand);
            links[2].textContent = t(content.navigation.quote);
            links[3].textContent = t(content.navigation.contact);
          }
          const cta = nav.querySelector('.button');
          if (cta) cta.textContent = t(content.navigation.cta_header);
        }
      }

      // 2. Update Hero
      if (content.hero) {
        const hero = document.querySelector('#top');
        if (hero) {
          const titles = hero.querySelectorAll('#hero-title span');
          if (titles.length >= 3) {
            titles[0].textContent = t(content.hero.title_1);
            titles[1].textContent = t(content.hero.title_2);
            titles[2].textContent = t(content.hero.title_3);
          }
          const subtitle = hero.querySelector('.hero-subtitle');
          if (subtitle) subtitle.innerHTML = t(content.hero.subtitle).replace(', ', ',<br><strong>') + '</strong>';
          
          const ctas = hero.querySelectorAll('.hero-actions a');
          if (ctas.length >= 2) {
            ctas[0].textContent = t(content.hero.cta_main);
            ctas[1].innerHTML = t(content.hero.cta_secondary) + ' <span aria-hidden="true">↓</span>';
          }
        }
      }

      // 3. Update About
      if (content.about) {
        const about = document.querySelector('#about');
        if (about) {
          const title = about.querySelector('h2');
          if (title) title.innerHTML = t(content.about.title).replace(', ', ',<br><span>') + '</span>';
          const lead = about.querySelector('.lead');
          if (lead) lead.textContent = t(content.about.lead);
          const desc = about.querySelector('.positioning-copy p:not(.lead)');
          if (desc) desc.textContent = t(content.about.description);
        }
      }

      // 4. Update Portfolio
      if (content.portfolio) {
        const port = document.querySelector('#work');
        if (port) {
          const title = port.querySelector('h2');
          if (title) title.textContent = t(content.portfolio.title);
          const desc = port.querySelector('.section-intro');
          if (desc) desc.textContent = t(content.portfolio.desc);
        }
      }

      // 5. Update Founder
      if (content.founder) {
        const founder = document.querySelector('#founder');
        if (founder) {
          const title = founder.querySelector('h2');
          if (title) title.textContent = t(content.founder.title);
          const name = founder.querySelector('.founder-name');
          if (name) name.textContent = content.founder.name;
          const role = founder.querySelector('.founder-role');
          if (role) role.textContent = t(content.founder.role);
          const bio = founder.querySelector('.founder-bio p:first-child');
          if (bio) bio.textContent = t(content.founder.bio);
          const motto = founder.querySelector('.founder-motto');
          if (motto) motto.textContent = t(content.founder.motto);
        }
      }
    }

    // Run on load
    updateContent();

    // Re-run on language change
    document.addEventListener('lnk-lang-changed', updateContent);

  } catch (e) {
    console.warn('[content-loader] Failed to load site content:', e);
  }
})();
