(() => {
  const HEADER_OFFSET = 80;

  // Icons
  if (window.lucide?.createIcons) window.lucide.createIcons();

  // Smooth scroll (with header offset)
  function smoothScrollTo(hash) {
    const el = document.querySelector(hash);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  document.addEventListener('click', (e) => {
    const a = e.target?.closest?.('a[data-scroll]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    e.preventDefault();
    smoothScrollTo(href);
    closeMobileMenu();
  });

  // Header scrolled + active section
  const header = document.getElementById('header');
  const navLinks = Array.from(document.querySelectorAll('a[data-scroll]'));
  const sections = ['#sobre', '#tecnologia', '#mobilidade', '#integracao', '#clientes', '#contato']
    .map((h) => ({ hash: h, el: document.querySelector(h) }))
    .filter((x) => x.el);

  function setActiveSection() {
    let active = '';
    for (let i = sections.length - 1; i >= 0; i--) {
      const rect = sections[i].el.getBoundingClientRect();
      if (rect.top <= 120) { active = sections[i].hash; break; }
    }
    navLinks.forEach((a) => {
      a.classList.toggle('active', a.getAttribute('href') === active);
    });
  }

  function onScroll() {
    header?.classList.toggle('scrolled', window.scrollY > 50);
    setActiveSection();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose = document.getElementById('mobileMenuClose');

  function openMobileMenu() {
    if (!mobileMenu || !mobileBtn) return;
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    mobileBtn.setAttribute('aria-expanded', 'true');
  }
  function closeMobileMenu() {
    if (!mobileMenu || !mobileBtn) return;
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    mobileBtn.setAttribute('aria-expanded', 'false');
  }
  mobileBtn?.addEventListener('click', openMobileMenu);
  mobileClose?.addEventListener('click', closeMobileMenu);
  mobileMenu?.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMobileMenu();
  });

  // Scroll reveal
  const revealEls = Array.from(document.querySelectorAll('.scroll-reveal'));
  const revealObs = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObs.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => revealObs.observe(el));

  // Counters
  const counterEls = Array.from(document.querySelectorAll('[data-counter]'));
  const counterObs = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        const target = Number(el.getAttribute('data-counter') || '0');
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 2000;
        const start = performance.now();

        function tick(t) {
          const p = Math.min((t - start) / duration, 1);
          el.textContent = String(Math.floor(p * target)) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObs.unobserve(el);
      }
    },
    { threshold: 0.55 }
  );
  counterEls.forEach((el) => counterObs.observe(el));

  // Typewriter
  const typewriter = document.getElementById('typewriter');
  const words = ['Low Code', 'Vibe Code', 'Web Apps', 'Inovação'];
  let w = 0;
  let txt = '';
  let dir = 1; // 1 typing, -1 deleting
  let hold = 0;

  function typeLoop() {
    if (!typewriter) return;
    const word = words[w % words.length];

    if (hold > 0) {
      hold -= 1;
      requestAnimationFrame(typeLoop);
      return;
    }

    if (dir === 1) {
      txt = word.slice(0, txt.length + 1);
      typewriter.textContent = txt;
      if (txt === word) {
        dir = -1;
        hold = 55; // pause
      }
    } else {
      txt = word.slice(0, Math.max(0, txt.length - 1));
      typewriter.textContent = txt;
      if (!txt) {
        dir = 1;
        w += 1;
        hold = 10;
      }
    }

    const speed = dir === 1 ? Math.max(14, 26 - word.length) : 10;
    setTimeout(() => requestAnimationFrame(typeLoop), speed * 10);
  }
  if (typewriter) {
    typewriter.textContent = '';
    typeLoop();
  }

  // Hero carousel
  const hero = document.getElementById('hero');

  function initHero(slides) {
    if (!hero) return;

    // Clean up if re-initializing
    hero.innerHTML = '';

    const INTERVAL = 6000;
    let current = 0;
    let startAt = performance.now();

    hero.innerHTML = `
      <button class="hero-arrow left" aria-label="Slide anterior" id="heroPrev"><i data-lucide="chevron-left"></i></button>
      <button class="hero-arrow right" aria-label="Próximo slide" id="heroNext"><i data-lucide="chevron-right"></i></button>
      <div class="hero-dots" id="heroDots"></div>
    `;

    const dots = hero.querySelector('#heroDots');

    const slideEls = slides.map((s, i) => {
      const el = document.createElement('div');
      el.className = 'hero-slide' + (i === 0 ? ' active' : '');
      el.innerHTML = `
        <div class="container">
          <div class="hero-inner">
            <div class="hero-copy">
              <h1>${escapeHtml(s.title).replace(/\n/g, '<br/>')}</h1>
              <p>${escapeHtml(s.lead)}</p>
              <div class="hero-actions">
                ${s.buttons
          .map((b) => {
            const cls = b.variant === 'primary' ? 'btn btn-primary' : 'btn btn-outline';
            return `<a class="${cls}" href="${b.href}" data-scroll>${escapeHtml(b.label)}</a>`;
          })
          .join('')}
              </div>
            </div>
            <div class="hero-media">
              <img src="${s.image}" alt="${escapeAttr(s.alt)}" />
            </div>
          </div>
        </div>
      `;
      hero.appendChild(el);
      return el;
    });

    dots.innerHTML = slides
      .map((_, i) => `<button class="dot" aria-label="Slide ${i + 1}" data-dot="${i}"><span></span></button>`)
      .join('');

    if (window.lucide?.createIcons) window.lucide.createIcons();

    const dotEls = Array.from(dots.querySelectorAll('.dot'));

    function goTo(i) {
      current = (i + slides.length) % slides.length;
      startAt = performance.now();
      slideEls.forEach((el, idx) => el.classList.toggle('active', idx === current));
      updateDots(0);
    }

    function updateDots(progressPct) {
      dotEls.forEach((d, idx) => {
        const bar = d.querySelector('span');
        if (!bar) return;
        if (idx === current) bar.style.width = progressPct + '%';
        else if (idx < current) bar.style.width = '100%';
        else bar.style.width = '0%';
      });
    }

    hero.querySelector('#heroPrev')?.addEventListener('click', () => goTo(current - 1));
    hero.querySelector('#heroNext')?.addEventListener('click', () => goTo(current + 1));

    dotEls.forEach((d) => {
      d.addEventListener('click', () => goTo(Number(d.getAttribute('data-dot') || '0')));
    });

    function loop(t) {
      const elapsed = t - startAt;
      const pct = Math.min((elapsed / INTERVAL) * 100, 100);
      updateDots(pct);
      if (elapsed >= INTERVAL) {
        goTo(current + 1);
      }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  // Handle i18n
  if (window.I18N && window.I18N.hero && window.I18N.hero.slides) {
    initHero(window.I18N.hero.slides);
  } else {
    window.addEventListener('i18n-ready', (e) => {
      if (e.detail && e.detail.hero && e.detail.hero.slides) {
        initHero(e.detail.hero.slides);
      }
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  function escapeAttr(str) {
    return escapeHtml(str).replace(/\n/g, ' ');
  }
})();
