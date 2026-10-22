(() => {
  /* ── Sparklines: render baked SVG polylines (no layout dependency) ── */
  const W = 160, H = 40;
  document.querySelectorAll('.spark').forEach((el) => {
    const pts = (el.dataset.spark || '').split(',').map(Number).filter((n) => !Number.isNaN(n));
    if (pts.length < 2) return;
    const max = Math.max(...pts), min = Math.min(...pts), span = max - min || 1;
    const step = W / (pts.length - 1);
    const coords = pts.map((v, i) => [i * step, H - 4 - ((v - min) / span) * (H - 10)]);
    const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const area = `${line} ${W},${H} 0,${H}`;
    el.setAttribute('viewBox', `0 0 ${W} ${H}`);
    el.setAttribute('preserveAspectRatio', 'none');
    const uid = 'sg' + Math.random().toString(36).slice(2, 7);
    el.innerHTML =
      `<defs><linearGradient id="${uid}" x1="0" y1="0" x2="0" y2="1">` +
      `<stop offset="0%" stop-color="currentColor" stop-opacity=".26"/>` +
      `<stop offset="100%" stop-color="currentColor" stop-opacity="0"/>` +
      `</linearGradient></defs>` +
      `<polygon points="${area}" fill="url(#${uid})" stroke="none"/>` +
      `<polyline class="polyline" points="${line}" vector-effect="non-scaling-stroke"/>`;
    el.style.color = getComputedStyle(el.closest('.kpi').querySelector('.kpi-icon')).color;
  });

  /* ── Theme toggle ── */
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeBtn');
  const icon = themeBtn && themeBtn.querySelector('use');
  /* Pastel light is the signature look; dark only when picked explicitly. */
  const initial = localStorage.getItem('lumina-theme') || 'light';
  applyTheme(initial);

  function applyTheme(mode) {
    root.dataset.theme = mode;
    const sw = document.getElementById('themeSwitch');
    if (sw) sw.setAttribute('aria-checked', String(mode === 'dark'));
    if (!themeBtn) return;
    const dark = mode === 'dark';
    themeBtn.setAttribute('aria-pressed', String(dark));
    themeBtn.setAttribute('aria-label', dark ? 'Ganti ke tema terang' : 'Ganti ke tema gelap');
    if (icon) icon.setAttribute('href', dark ? '#i-sun' : '#i-moon');
  }

  window.setTheme = (mode) => {
    applyTheme(mode);
    localStorage.setItem('lumina-theme', mode);
  };

  themeBtn && themeBtn.addEventListener('click', () => {
    window.setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  /* ── Search shortcut (drawer + routing live in router.js) ── */
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      document.querySelector('.topbar .search input')?.focus();
    }
  });

  /* ── Segmented + filter chips ── */
  const bindGroup = (sel) => {
    document.querySelectorAll(sel).forEach((group) => {
      group.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        group.querySelectorAll('button').forEach((b) => {
          b.classList.toggle('is-on', b === btn);
          b.setAttribute('aria-pressed', String(b === btn));
        });
      });
    });
  };
  bindGroup('.seg');
  bindGroup('.filters');

  /* Entrance motion comes from the `.page.is-in` CSS animation (router.js). */
})();
