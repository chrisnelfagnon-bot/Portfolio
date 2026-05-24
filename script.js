(function () {
  'use strict';

  const CONTACT_EMAIL = 'chrisnelfagnon@gmail.com';
  const TITLES = [
    'Expert Froid & Climatisation',
    'Technicien HVAC',
    'Spécialiste réfrigération',
  ];

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* Footer year */
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Header scroll */
  const header = $('#header');
  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* Mobile nav */
  const navToggle = $('#nav-toggle');
  const navMenu = $('#nav-menu');
  const navLinks = $$('.nav__link');

  navToggle?.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    navToggle.classList.toggle('active', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navMenu?.classList.remove('open');
      navToggle?.classList.remove('active');
      navToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  /* Active nav on scroll */
  const sections = $$('section[id]');
  const observerNav = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );
  sections.forEach((s) => observerNav.observe(s));

  /* Reveal on scroll */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  $$('.reveal').forEach((el) => revealObserver.observe(el));

  /* Typed title */
  const typedEl = $('#typed-title');
  let titleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function typeLoop() {
    if (!typedEl) return;
    const current = TITLES[titleIndex];
    typedEl.textContent = current.substring(0, charIndex);

    if (!deleting && charIndex < current.length) {
      charIndex++;
      setTimeout(typeLoop, 80);
    } else if (!deleting && charIndex === current.length) {
      deleting = true;
      setTimeout(typeLoop, 2000);
    } else if (deleting && charIndex > 0) {
      charIndex--;
      setTimeout(typeLoop, 40);
    } else {
      deleting = false;
      titleIndex = (titleIndex + 1) % TITLES.length;
      setTimeout(typeLoop, 400);
    }
  }
  typeLoop();

  /* Counter animation */
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const duration = 2000;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        }
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  $$('.hero__stat-number').forEach((el) => countObserver.observe(el));

  /* Skill bars */
  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const fill = entry.target;
        fill.style.width = `${fill.dataset.width}%`;
        barObserver.unobserve(fill);
      });
    },
    { threshold: 0.3 }
  );
  $$('.skill-bar__fill').forEach((el) => barObserver.observe(el));

  /* About tabs */
  const tabs = $$('.about__tab');
  const panels = {
    mission: $('#panel-mission'),
    valeurs: $('#panel-valeurs'),
    objectifs: $('#panel-objectifs'),
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const key = tab.dataset.tab;
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });
      Object.entries(panels).forEach(([name, panel]) => {
        if (!panel) return;
        const show = name === key;
        panel.classList.toggle('active', show);
        panel.hidden = !show;
      });
    });
  });

  /* Contact form */
  const form = $('#contact-form');
  const subjectLabels = {
    devis: 'Demande de devis',
    maintenance: 'Maintenance / entretien',
    depannage: 'Dépannage urgent',
    conseil: 'Conseil technique',
    autre: 'Autre',
  };

  function setError(id, msg) {
    const el = $(`#error-${id}`);
    const input = $(`#${id}`);
    if (el) el.textContent = msg;
    input?.classList.toggle('error', Boolean(msg));
  }

  function validateForm() {
    let valid = true;
    const name = $('#name')?.value.trim() ?? '';
    const email = $('#email')?.value.trim() ?? '';
    const subject = $('#subject')?.value ?? '';
    const message = $('#message')?.value.trim() ?? '';

    setError('name', '');
    setError('email', '');
    setError('subject', '');
    setError('message', '');

    if (!name) { setError('name', 'Indiquez votre nom.'); valid = false; }
    if (!email) {
      setError('email', 'Indiquez votre e-mail.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('email', 'E-mail invalide.');
      valid = false;
    }
    if (!subject) { setError('subject', 'Choisissez un sujet.'); valid = false; }
    if (!message) { setError('message', 'Écrivez votre message.'); valid = false; }

    return { valid, name, email, subject, message };
  }

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const result = validateForm();
    if (!result.valid) return;

    const btn = form.querySelector('button[type="submit"]');
    const success = $('#form-success');
    btn?.classList.add('loading');
    btn?.setAttribute('disabled', 'true');

    const subjectLine = `[Portfolio] ${subjectLabels[result.subject] || result.subject}`;
    const body = [
      `Nom: ${result.name}`,
      `E-mail: ${result.email}`,
      `Sujet: ${subjectLabels[result.subject] || result.subject}`,
      '',
      result.message,
    ].join('\n');

    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;

    setTimeout(() => {
      window.location.href = mailto;
      if (success) success.hidden = false;
      btn?.classList.remove('loading');
      btn?.removeAttribute('disabled');
      form.reset();
    }, 600);
  });
})();
