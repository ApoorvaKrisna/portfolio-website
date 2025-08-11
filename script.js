(function() {
  const root = document.documentElement;
  const storedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = storedTheme || (prefersDark ? 'dark' : 'light');
  root.setAttribute('data-theme', initialTheme);

  const setActiveNav = () => {
    const path = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.site-nav a').forEach(a => {
      const href = a.getAttribute('href');
      if (href && href.endsWith(path)) a.classList.add('active');
    });
  };

  const smoothAnchors = () => {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  };

  const setupNav = () => {
    const navToggle = document.getElementById('navToggle');
    const siteNav = document.getElementById('siteNav');
    if (navToggle && siteNav) {
      navToggle.addEventListener('click', () => {
        const isOpen = siteNav.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', String(isOpen));
      });
      siteNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
        if (siteNav.classList.contains('open')) siteNav.classList.remove('open');
      }));
    }
  };

  const setupTheme = () => {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
      });
    }
  };

  const setupYear = () => {
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = String(new Date().getFullYear());
  };

  // Reveal on scroll
  const setupReveal = () => {
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  };

  // Counters
  const setupCounters = () => {
    const counters = document.querySelectorAll('[data-counter]');
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        const target = Number(el.getAttribute('data-counter')) || 0;
        const duration = 1200;
        const start = performance.now();
        const step = (ts) => {
          const p = Math.min(1, (ts - start) / duration);
          const val = Math.floor(target * p);
          el.textContent = String(val);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        io.unobserve(el);
      }
    }, { threshold: 0.3 });
    counters.forEach(c => io.observe(c));
  };

  // Skill bars
  const setupBars = () => {
    const bars = document.querySelectorAll('.bar');
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const bar = entry.target;
        const pct = bar.getAttribute('data-pct') || '0';
        bar.style.setProperty('--pct', pct + '%');
        bar.classList.add('filled');
        io.unobserve(bar);
      }
    }, { threshold: 0.4 });
    bars.forEach(b => io.observe(b));
  };

  // Contact form via serverless endpoint (local Flask if on 127.0.0.1)
  const setupContact = () => {
    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    if (!contactForm || !formStatus) return;

    // Endpoint selection
    const isLocal = ['127.0.0.1', 'localhost'].includes(window.location.hostname);
    const defaultEndpoint = isLocal ? 'http://127.0.0.1:5000/api/contact' : '/api/contact';

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      formStatus.textContent = '';

      const name = document.getElementById('name');
      const email = document.getElementById('email');
      const message = document.getElementById('message');

      const fields = [name, email, message];
      let isValid = true;
      for (const input of fields) {
        const hint = document.querySelector(`.field-hint[data-for="${input.id}"]`);
        if (!input.value.trim()) { isValid = false; hint.textContent = 'This field is required.'; }
        else { hint.textContent = ''; }
      }
      const emailHint = document.querySelector('.field-hint[data-for="email"]');
      if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) { isValid = false; emailHint.textContent = 'Enter a valid email.'; }
      if (!isValid) { formStatus.textContent = 'Please correct the errors above.'; return; }

      try {
        formStatus.textContent = 'Sending…';
        const resp = await fetch(defaultEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ name: name.value, email: email.value, message: message.value })
        });

        if (!resp.ok) {
          if ([404, 405, 501].includes(resp.status)) {
            formStatus.textContent = 'Local preview: contact works after starting server.py or deploying to Vercel.';
            return;
          }
          const data = await resp.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to send');
        }

        formStatus.textContent = 'Thanks! Your message has been sent successfully.';
        contactForm.reset();
      } catch (err) {
        formStatus.textContent = 'Something went wrong. Please try again later.';
      }
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    setActiveNav();
    setupNav();
    setupTheme();
    setupYear();
    setupReveal();
    setupCounters();
    setupBars();
    smoothAnchors();
    setupContact();
  });
})();
