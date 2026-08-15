/* SERVICES — interactive list / mobile accordion
   Desktop: one service can be selected without changing the overall page composition.
   Mobile: services behave as an accordion to keep the section compact and readable.
*/
(() => {
  const list = document.querySelector('[data-services]');
  if (!list) return;

  const items = [...list.querySelectorAll('[data-service-item]')];
  const mobileQuery = window.matchMedia('(max-width: 620px)');

  const setActive = (item, open = true) => {
    items.forEach((other) => {
      const button = other.querySelector('.service-toggle');
      const isActive = other === item && open;
      other.classList.toggle('is-active', isActive);
      button.setAttribute('aria-expanded', String(isActive));
    });
  };

  items.forEach((item) => {
    const button = item.querySelector('.service-toggle');
    button.addEventListener('click', () => {
      if (mobileQuery.matches) {
        const currentlyOpen = item.classList.contains('is-active');
        if (currentlyOpen) {
          item.classList.remove('is-active');
          button.setAttribute('aria-expanded', 'false');
        } else {
          setActive(item, true);
        }
        return;
      }

      setActive(item, true);
    });
  });

  // Keep a stable initial state when the viewport crosses the mobile breakpoint.
  const syncBreakpoint = () => {
    const active = list.querySelector('[data-service-item].is-active');
    if (!active && !mobileQuery.matches) setActive(items[0], true);
    if (!active && mobileQuery.matches) setActive(items[0], true);
  };

  if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', syncBreakpoint);
  else mobileQuery.addListener(syncBreakpoint);
})();
