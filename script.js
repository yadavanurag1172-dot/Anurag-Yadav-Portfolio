(function () {
  'use strict';

  /* ============================================================
     MOBILE DETECTION
  ============================================================ */
  function isMobile() { return window.innerWidth <= 768; }

  /* ============================================================
     LOADING SCREEN
  ============================================================ */
  const loader    = document.getElementById('loader');
  const loaderFill = document.getElementById('loaderFill');
  const loaderPct  = document.getElementById('loaderPct');
  let progress = 0;

  function updateLoader(pct) {
    progress = pct;
    if (loaderFill) loaderFill.style.width = pct + '%';
    if (loaderPct)  loaderPct.textContent  = Math.round(pct) + '%';
  }

  function hideLoader() {
    updateLoader(100);
    setTimeout(function () {
      if (loader) loader.classList.add('hidden');
      /* Trigger entry animation on hero after loader hides */
      document.querySelectorAll('.hero-left, .hero-right').forEach(function (el, i) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity 0.9s ease ' + (0.1 + i * 0.15) + 's, transform 0.9s cubic-bezier(0.16,1,0.3,1) ' + (0.1 + i * 0.15) + 's';
        setTimeout(function () {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, 50);
      });
    }, 400);
  }

  /* Simulate progress while page loads */
  let fakeTimer = setInterval(function () {
    if (progress < 85) {
      updateLoader(progress + (Math.random() * 8));
    }
  }, 120);

  window.addEventListener('load', function () {
    clearInterval(fakeTimer);
    updateLoader(95);
    setTimeout(hideLoader, 300);
  });

  /* Fallback — hide after 4s no matter what */
  setTimeout(hideLoader, 4000);

  /* ============================================================
     PANEL TRANSITION OVERLAY
  ============================================================ */
  const overlay = document.createElement('div');
  overlay.className = 'panel-transition-overlay';
  document.body.appendChild(overlay);

  function transitionToPanel(id) {
    overlay.classList.remove('slide-in', 'slide-out');
    void overlay.offsetWidth; /* reflow */
    overlay.classList.add('slide-in');

    setTimeout(function () {
      const panel = document.getElementById(id);
      if (panel) {
        if (isMobile()) {
          /* use a standard value for behavior */
          panel.scrollIntoView({ behavior: 'auto' });
        } else {
          /* scroll vertically to the panel's horizontal offset (horizontal scroll engine maps scrollY -> translateX) */
          window.scrollTo({ top: panel.offsetLeft, behavior: 'auto' });
          currentX = panel.offsetLeft;
        }
      }
      overlay.classList.remove('slide-in');
      overlay.classList.add('slide-out');
    }, 350);
  }

  /* Expose a global helper so inline handlers can call `scrollToPanel()` */
  window.scrollToPanel = function (id) { transitionToPanel(id); };

  /* ============================================================
     HORIZONTAL SCROLL ENGINE (desktop only)
  ============================================================ */
  const track        = document.getElementById('track');
  const progressFill = document.getElementById('progressFill');
  let currentX = 0;

  function setDocumentHeight() {
    if (!track) {
      document.body.style.height = '';
      return;
    }
    if (isMobile()) {
      document.body.style.height = '';
      track.style.transform = 'none';
      return;
    }
    const totalWidth = track.scrollWidth || 0;
    const vw         = window.innerWidth;
    const vh         = window.innerHeight;
    document.body.style.height = `${totalWidth - vw + vh}px`;
  }

  function animateScroll() {
    if (!track) {
      if (progressFill) progressFill.style.width = '0%';
      requestAnimationFrame(animateScroll);
      return;
    }
    if (isMobile()) {
      track.style.transform = 'none';
      if (progressFill) progressFill.style.width = '0%';
      requestAnimationFrame(animateScroll);
      return;
    }

    const targetX    = window.scrollY;
    const maxScrollY = document.body.scrollHeight - window.innerHeight;
    currentX += (targetX - currentX) * 0.1;
    if (Math.abs(currentX - targetX) < 0.05) currentX = targetX;
    track.style.transform = `translateX(${-currentX}px)`;
    const pct = maxScrollY > 0 ? (currentX / maxScrollY) * 100 : 0;
    if (progressFill) progressFill.style.width = `${Math.min(pct, 100)}%`;
    requestAnimationFrame(animateScroll);
  }

  window.addEventListener('resize', () => {
    setDocumentHeight();
    if (!isMobile()) currentX = window.scrollY;
  });

  setDocumentHeight();
  animateScroll();
  /* Handle return from work pages — scroll to saved panel */
const savedPanel = sessionStorage.getItem('scrollToPanel');
if (savedPanel) {
  sessionStorage.removeItem('scrollToPanel');
  setTimeout(function () { scrollToPanel(savedPanel); }, 100);
}

  /* ============================================================
     PANEL NAVIGATION
  ============================================================ */
  

  /* ============================================================
     HERO WORD CYCLER
  ============================================================ */
  const words = document.querySelectorAll('.hero-word');
  let wordIndex = 0;

  if (words.length > 0) {
    function cycleWord() {
      const current = words[wordIndex];
      const next    = words[(wordIndex + 1) % words.length];
      current.classList.remove('active');
      current.classList.add('exiting');
      setTimeout(() => {
        current.classList.remove('exiting');
        wordIndex = (wordIndex + 1) % words.length;
        next.classList.add('active');
      }, 550);
    }
    setInterval(cycleWord, 2600);
  }

  /* ============================================================
     FAQ ACCORDION
  ============================================================ */
  document.querySelectorAll('.faq-question').forEach(function (q) {
    q.addEventListener('click', function () {
      const item   = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ============================================================
     KEYBOARD NAVIGATION (desktop only)
  ============================================================ */
 const panelIds = [
  'panel-hero',
  'panel-work',
  'panel-about',
  'panel-contact'
];

  function getCurrentPanelIndex() {
    const scrollY = window.scrollY;
    let closest = 0, closestDist = Infinity;
    panelIds.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      const dist = Math.abs(el.offsetLeft - scrollY);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    });
    return closest;
  }

  document.addEventListener('keydown', function (e) {
    if (isMobile()) return;
    const idx = getCurrentPanelIndex();
    if (e.key === 'ArrowRight' && idx < panelIds.length - 1) {
      scrollToPanel(panelIds[idx + 1]);
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      scrollToPanel(panelIds[idx - 1]);
    } else if (e.key === 'Home') {
      scrollToPanel(panelIds[0]);
    } else if (e.key === 'End') {
      scrollToPanel(panelIds[panelIds.length - 1]);
    }
  });


 /* ============================================================
   SCROLL ARROW — GO TO NEXT PANEL
============================================================ */
const scrollArrow = document.getElementById('scrollArrow');

const homePanelIds = [
  'panel-hero',
  'panel-work',
  'panel-about',
  'panel-contact'
];

function getCurrentHomePanelIndex() {
  let closestIndex = 0;
  let closestDistance = Infinity;

  homePanelIds.forEach(function (id, index) {
    const panel = document.getElementById(id);
    if (!panel) return;

    let distance;

    if (isMobile()) {
      distance = Math.abs(panel.getBoundingClientRect().top);
    } else {
      distance = Math.abs(panel.offsetLeft - window.scrollY);
    }

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

if (scrollArrow) {
  scrollArrow.addEventListener('click', function () {
    const currentIndex = getCurrentHomePanelIndex();
    const nextIndex = currentIndex + 1;

    if (nextIndex < homePanelIds.length) {
      scrollToPanel(homePanelIds[nextIndex]);
    } else {
      scrollToPanel(homePanelIds[0]);
    }
  });
}

  /* ============================================================
     CUSTOM CURSOR (desktop only)
  ============================================================ */
  if (!isMobile()) {
    const cursorStyles = `
      .cursor-dot {
        position: fixed; top: 0; left: 0;
        width: 8px; height: 8px;
        background: #1a1a1a;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: width 0.3s, height 0.3s, background 0.3s;
        opacity: 0;
      }
      .cursor-dot.visible { opacity: 1; }
      .cursor-dot.hover {
        width: 36px; height: 36px;
        background: transparent;
        border: 1px solid #1a1a1a;
      }
    `;
    const st = document.createElement('style');
    st.textContent = cursorStyles;
    document.head.appendChild(st);

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);

    let mx = 0, my = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.classList.add('visible'); });
    document.addEventListener('mouseleave', () => dot.classList.remove('visible'));

    document.querySelectorAll('a, button, .work-half, .work-item, .static-card, .motion-card').forEach(el => {
      el.addEventListener('mouseenter', () => dot.classList.add('hover'));
      el.addEventListener('mouseleave', () => dot.classList.remove('hover'));
    });

    (function moveCursor() {
      cx += (mx - cx) * 0.16;
      cy += (my - cy) * 0.16;
      dot.style.left = `${cx}px`;
      dot.style.top  = `${cy}px`;
      requestAnimationFrame(moveCursor);
    })();
  }

  /* ============================================================
     IMAGE LIGHTBOX
  ============================================================ */
  window.openLightbox = function (src, title) {
    const lb    = document.getElementById('lightbox');
    const img   = document.getElementById('lb-img');
    const label = document.getElementById('lb-title');
    img.src = src; img.alt = title;
    label.textContent = title;
    lb.classList.add('open');
  };

  window.closeLightbox = function () {
    const lb  = document.getElementById('lightbox');
    const img = document.getElementById('lb-img');
    lb.classList.remove('open');
    setTimeout(() => { img.src = ''; }, 400);
  };

  /* ============================================================
     VIDEO MODAL
  ============================================================ */
  window.openVideoModal = function (src) {
    const vm  = document.getElementById('videoModal');
    const vid = document.getElementById('vm-video');
    vid.src = src;
    vm.classList.add('open');
    vid.play();
  };

  window.closeVideoModal = function () {
    const vm  = document.getElementById('videoModal');
    const vid = document.getElementById('vm-video');
    vm.classList.remove('open');
    vid.pause();
    setTimeout(() => { vid.src = ''; }, 400);
  };

  if (!isMobile()) {
    document.querySelectorAll('.motion-card-video').forEach(function (card) {
      const video = card.querySelector('video');
      if (!video) return;
      card.addEventListener('mouseenter', function () { video.play().catch(function () {}); });
      card.addEventListener('mouseleave', function () { video.pause(); video.currentTime = 0; });
    });
  }

  /* ============================================================
     ESCAPE KEY
  ============================================================ */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeLightbox(); closeVideoModal(); }
  });

  /* ============================================================
     RECALCULATE ON LOAD
  ============================================================ */
  if (document.fonts) document.fonts.ready.then(setDocumentHeight);
  window.addEventListener('load', () => {
    setDocumentHeight();
    if (!isMobile()) currentX = window.scrollY;
  });


})();

