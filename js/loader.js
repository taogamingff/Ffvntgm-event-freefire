/* Loader AZERST: giữ nguyên giao diện loader, chỉ điều khiển thanh tiến trình. */
(() => {
  'use strict';
  const fill = document.getElementById('barFill');
  const percent = document.getElementById('barPct');
  const loader = document.getElementById('loader');
  if (!loader) return;
  let value = 0;
  const timer = setInterval(() => {
    value = Math.min(value + (value < 70 ? 8 : 3), 95);
    if (fill) fill.style.width = value + '%';
    if (percent) percent.textContent = value + '%';
  }, 90);
  const hide = () => {
    clearInterval(timer);
    if (fill) fill.style.width = '100%';
    if (percent) percent.textContent = '100%';
    setTimeout(() => loader.classList.add('hide'), 180);
    document.documentElement.classList.remove('loading');
  };
  if (document.readyState === 'complete') hide();
  else window.addEventListener('load', hide, { once: true });
  setTimeout(hide, 5000);
})();
