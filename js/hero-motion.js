/* HERO pointer micro-parallax — desktop only.
   No layout changes; moves only the decorative visual group by a few pixels. */
(() => {
  const visual = document.querySelector('.hero-visual');
  if (!visual) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  let frame = null;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  const render = () => {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    visual.style.setProperty('--parallax-x', `${currentX.toFixed(2)}px`);
    visual.style.setProperty('--parallax-y', `${currentY.toFixed(2)}px`);

    if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
      frame = requestAnimationFrame(render);
    } else {
      frame = null;
    }
  };

  const onPointerMove = (event) => {
    const rect = visual.getBoundingClientRect();
    const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
    const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
    targetX = Math.max(-1, Math.min(1, x)) * 5;
    targetY = Math.max(-1, Math.min(1, y)) * 4;
    if (!frame) frame = requestAnimationFrame(render);
  };

  const reset = () => {
    targetX = 0;
    targetY = 0;
    if (!frame) frame = requestAnimationFrame(render);
  };

  visual.addEventListener('pointermove', onPointerMove, { passive: true });
  visual.addEventListener('pointerleave', reset, { passive: true });
})();
