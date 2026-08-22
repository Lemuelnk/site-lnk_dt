
(() => {
  const year = document.querySelector('#footer-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();

// Newsletter logic
(() => {
  const form = document.querySelector('#newsletter-form');
  const msg = document.querySelector('#newsletter-msg');
  if (!form || !msg) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = form.querySelector('.newsletter-input');
    const btn = form.querySelector('.newsletter-submit');
    const email = input.value.trim();

    if (!email) return;

    btn.disabled = true;
    msg.textContent = '...';
    msg.className = 'newsletter-msg';

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (data.ok) {
        msg.textContent = data.message;
        msg.className = 'newsletter-msg success';
        input.value = '';
      } else {
        msg.textContent = data.message || 'Erreur';
        msg.className = 'newsletter-msg error';
      }
    } catch (err) {
      msg.textContent = 'Erreur de connexion.';
      msg.className = 'newsletter-msg error';
    } finally {
      btn.disabled = false;
    }
  });
})();
