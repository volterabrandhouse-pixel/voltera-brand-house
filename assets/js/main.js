/* ================================================================
   VOLTERA BRAND HOUSE â€” Main JavaScript v2
   ================================================================ */

'use strict';

/* ----- PAGE LOADER --------------------------------------------- */
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('is-hidden');
    // Trigger hero line reveals
    document.querySelectorAll('.oh-inner').forEach(el => el.classList.add('is-visible'));
  }, 1400);
});

/* ----- CURSOR AMBIENT (desktop) -------------------------------- */
const cursorGlow = document.getElementById('cursor-glow');
if (cursorGlow && window.matchMedia('(hover: hover)').matches) {
  let rafId = null;
  let curX = 0, curY = 0;
  document.addEventListener('mousemove', e => {
    curX = e.clientX;
    curY = e.clientY;
    if (!rafId) {
      rafId = requestAnimationFrame(() => {
        cursorGlow.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
        rafId = null;
      });
    }
    cursorGlow.classList.add('is-active');
  });
  document.addEventListener('mouseleave', () => cursorGlow.classList.remove('is-active'));
}

/* ----- NAVIGATION SCROLL --------------------------------------- */
const siteHeader = document.getElementById('site-header');
function handleNavScroll() {
  if (!siteHeader) return;
  if (window.scrollY > 40) {
    siteHeader.classList.add('is-scrolled');
  } else {
    siteHeader.classList.remove('is-scrolled');
  }
}
window.addEventListener('scroll', handleNavScroll, { passive: true });
handleNavScroll();

/* ----- MOBILE MENU --------------------------------------------- */
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');

function openMobileMenu() {
  if (!mobileMenu || !navToggle) return;
  mobileMenu.classList.add('is-open');
  navToggle.classList.add('is-open');
  navToggle.setAttribute('aria-expanded', 'true');
  mobileMenu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  if (!mobileMenu || !navToggle) return;
  mobileMenu.classList.remove('is-open');
  navToggle.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    mobileMenu.classList.contains('is-open') ? closeMobileMenu() : openMobileMenu();
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
      closeMobileMenu();
      navToggle.focus();
    }
  });
}

/* ----- SMOOTH SCROLL FOR ANCHORS ------------------------------ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href');
    if (id === '#') return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    closeMobileMenu();
    const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ----- SCROLL REVEAL ------------------------------------------ */
const revealEls = document.querySelectorAll('[data-reveal], [data-reveal-scale]');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

/* ----- ACTIVE NAV LINK --------------------------------------- */
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
const sections = document.querySelectorAll('section[id]');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: '-30% 0px -60% 0px' });
sections.forEach(s => sectionObserver.observe(s));

/* ----- TESTIMONIALS CAROUSEL ---------------------------------- */
(function initCarousel() {
  const viewport = document.querySelector('.carousel-viewport');
  const track    = document.querySelector('.carousel-track');
  const prevBtn  = document.getElementById('carousel-prev');
  const nextBtn  = document.getElementById('carousel-next');
  const dotsEl   = document.getElementById('carousel-dots');
  if (!track || !viewport) return;

  const cards = Array.from(track.children);
  let current = 0;
  let isDown = false, startX = 0, walked = 0;
  let autoTimer = null;

  // Build dots
  if (dotsEl) {
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(dot);
    });
  }

  function getDots() { return dotsEl ? Array.from(dotsEl.children) : []; }

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, cards.length - 1));
    const offset = cards.slice(0, current).reduce((acc, c) => {
      const style = getComputedStyle(track);
      const gap = parseFloat(style.gap) || 24;
      return acc + c.offsetWidth + gap;
    }, 0);
    track.style.transform = `translateX(-${offset}px)`;

    cards.forEach((c, i) => c.classList.toggle('is-active', i === current));
    getDots().forEach((d, i) => d.classList.toggle('is-active', i === current));

    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === cards.length - 1;
  }

  function next() { if (current < cards.length - 1) goTo(current + 1); else goTo(0); }
  function prev() { if (current > 0) goTo(current - 1); }

  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });

  // Touch / drag
  track.addEventListener('mousedown', e => { isDown = true; startX = e.clientX; track.style.transition = 'none'; });
  track.addEventListener('touchstart', e => { isDown = true; startX = e.touches[0].clientX; track.style.transition = 'none'; }, { passive: true });
  document.addEventListener('mousemove', e => { if (!isDown) return; walked = e.clientX - startX; });
  document.addEventListener('touchmove', e => { if (!isDown) return; walked = e.touches[0].clientX - startX; }, { passive: true });
  const endDrag = () => {
    if (!isDown) return;
    isDown = false;
    track.style.transition = '';
    if (Math.abs(walked) > 50) { walked < 0 ? next() : prev(); resetAuto(); }
    else { goTo(current); }
    walked = 0;
  };
  document.addEventListener('mouseup', endDrag);
  document.addEventListener('touchend', endDrag);

  // Auto-advance
  function startAuto() {
    autoTimer = setInterval(() => { if (!document.hidden) next(); }, 5500);
  }
  function resetAuto() { clearInterval(autoTimer); startAuto(); }
  viewport.addEventListener('mouseenter', () => clearInterval(autoTimer));
  viewport.addEventListener('mouseleave', startAuto);

  goTo(0);
  startAuto();

  window.addEventListener('resize', () => goTo(current));
})();

/* ----- CONTACT FORM ------------------------------------------- */
const contactForm = document.getElementById('contact-form');
const formStatus  = document.getElementById('form-status');

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const submit = contactForm.querySelector('[type="submit"]');
    const data   = new FormData(contactForm);
    const name   = data.get('name') || '';
    const biz    = data.get('business') || '';
    const city   = data.get('city') || '';
    const phone  = data.get('phone') || '';
    const msg    = data.get('message') || '';

    const text = encodeURIComponent(
      `Hi Tushar! I found Voltera Brand House and I'm interested in growing my business online.\n\nName: ${name}\nBusiness: ${biz}\nCity: ${city}\nPhone: ${phone}\n\nMessage: ${msg}`
    );
    const waURL = `https://wa.me/918603834423?text=${text}`;

    submit.disabled = true;
    submit.textContent = 'Opening WhatsAppâ€¦';

    setTimeout(() => {
      window.open(waURL, '_blank', 'noopener,noreferrer');
      submit.disabled = false;
      submit.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Book via WhatsApp`;
      if (formStatus) {
        formStatus.textContent = 'Opening WhatsApp â€” Tushar will respond shortly.';
        formStatus.classList.add('is-success');
        setTimeout(() => { formStatus.textContent = ''; formStatus.classList.remove('is-success'); }, 5000);
      }
      contactForm.reset();
    }, 600);
  });
}