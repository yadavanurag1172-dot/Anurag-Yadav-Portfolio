/* ============================================================
   ANURAG YADAV — Work Pages
   work.js  (shared by static.html and motion.html)
   ============================================================ */

(function () {
  'use strict';

  const slides       = document.querySelectorAll('.slide');
  const prevBtn      = document.getElementById('prevBtn');
  const nextBtn      = document.getElementById('nextBtn');
  const currentLabel = document.getElementById('currentSlide');
  const totalLabel   = document.querySelector('.counter-total');
  const progressFill = document.getElementById('progressFill');
  const isMotion     = document.body.classList.contains('motion-page');

  const total = slides.length;

  // If no slides exist, stop safely
  if (total === 0) return;

  let current = 0;
  let transitioning = false;

  // Update total number automatically
  if (totalLabel) {
    totalLabel.textContent = String(total).padStart(2, '0');
  }

  /* ============================================================
     INIT
  ============================================================ */
  function init() {
    slides.forEach(function (slide) {
      slide.classList.remove('active');
    });

    slides[0].classList.add('active');
    updateUI(0);

    if (isMotion) {
      playVideo(0);
    }

    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = total === 1;
  }

  /* ============================================================
     GO TO SLIDE
  ============================================================ */
  function goTo(index) {
    if (transitioning) return;
    if (index < 0 || index >= total) return;
    if (index === current) return;

    transitioning = true;

    if (isMotion) {
      pauseVideo(current);
    }

    slides[current].classList.remove('active');

    current = index;

    slides[current].classList.add('active');

    if (isMotion) {
      playVideo(current);
    }

    updateUI(current);

    setTimeout(function () {
      transitioning = false;
    }, 600);
  }

  /* ============================================================
     UPDATE UI
  ============================================================ */
  function updateUI(index) {
    if (currentLabel) {
      currentLabel.textContent = String(index + 1).padStart(2, '0');
    }

    const pct = total > 1 ? (index / (total - 1)) * 100 : 100;

    if (progressFill) {
      progressFill.style.width = pct + '%';
    }

    if (prevBtn) {
      prevBtn.disabled = index === 0;
    }

    if (nextBtn) {
      nextBtn.disabled = index === total - 1;
    }
  }

  /* ============================================================
     VIDEO CONTROLS
  ============================================================ */
  function playVideo(index) {
    const video = slides[index].querySelector('.slide-video');

    if (!video) return;

    video.muted = true;
    video.play().catch(function () {});

    setSoundIcon(index, true);
  }

  function pauseVideo(index) {
    const video = slides[index].querySelector('.slide-video');

    if (!video) return;

    video.pause();
    video.muted = true;

    setSoundIcon(index, true);
  }

  function setSoundIcon(index, muted) {
    const btn = document.getElementById('soundBtn' + index);

    if (!btn) return;

    const mutedIcon = btn.querySelector('.icon-muted');
    const soundIcon = btn.querySelector('.icon-sound');

    if (mutedIcon) {
      mutedIcon.style.display = muted ? 'block' : 'none';
    }

    if (soundIcon) {
      soundIcon.style.display = muted ? 'none' : 'block';
    }
  }

  if (isMotion) {
    document.querySelectorAll('.video-sound-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();

        const idx = parseInt(btn.id.replace('soundBtn', ''), 10);
        const video = slides[idx] && slides[idx].querySelector('.slide-video');

        if (!video) return;

        video.muted = !video.muted;
        setSoundIcon(idx, video.muted);
      });
    });
  }

  /* ============================================================
     BUTTON EVENTS
  ============================================================ */
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      goTo(current + 1);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      goTo(current - 1);
    });
  }

  /* ============================================================
     KEYBOARD EVENTS
  ============================================================ */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') {
      goTo(current + 1);
    }

    if (e.key === 'ArrowLeft') {
      goTo(current - 1);
    }
  });

  /* ============================================================
     MOUSE WHEEL
  ============================================================ */
  let wheelCooldown = false;

  window.addEventListener('wheel', function (e) {
    if (wheelCooldown) return;

    wheelCooldown = true;

    if (e.deltaY > 20 || e.deltaX > 20) {
      goTo(current + 1);
    }

    if (e.deltaY < -20 || e.deltaX < -20) {
      goTo(current - 1);
    }

    setTimeout(function () {
      wheelCooldown = false;
    }, 750);
  }, { passive: true });

  /* ============================================================
     TOUCH SWIPE
  ============================================================ */
  let touchStartX = 0;

  document.addEventListener('touchstart', function (e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    const diff = touchStartX - e.changedTouches[0].clientX;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goTo(current + 1);
      } else {
        goTo(current - 1);
      }
    }
  }, { passive: true });

  /* ============================================================
     NAV LINKS
  ============================================================ */
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    const href = link.getAttribute('href') || '';

    if (!href.includes('#')) return;

    link.addEventListener('click', function (e) {
      e.preventDefault();

      const parts = href.split('#');
      const page = parts[0];
      const hash = parts[1];

      if (hash) {
        sessionStorage.setItem('scrollToPanel', hash);
      }

      window.location.href = page || 'index.html';
    });
  });

  /* ============================================================
     START
  ============================================================ */
  init();

})();