(function () {
  'use strict';

  const track = document.getElementById('videoCarouselTrack');
  const prevBtn = document.getElementById('videoCarouselPrev');
  const nextBtn = document.getElementById('videoCarouselNext');
  const progressBar = document.getElementById('videoCarouselProgress');

  if (!track) return;

  const slides = track.querySelectorAll('.video-carousel__slide');
  if (!slides.length) return;

  let currentIndex = 0;
  let slidesPerView = 4;
  let maxIndex = 0;

  /* ── Helpers ──────────────────────────────────────────────── */
  function calcLayout() {
    const isMobile = window.innerWidth <= 749;
    slidesPerView = isMobile ? 1.3 : 4;
    maxIndex = Math.max(0, Math.ceil(slides.length - slidesPerView));
    if (currentIndex > maxIndex) currentIndex = maxIndex;
  }

  function getSlideWidth() {
    if (!slides[0]) return 0;
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap) || 12;
    return slides[0].offsetWidth + gap;
  }

  function updateCarousel() {
    const offset = currentIndex * getSlideWidth();
    track.style.transform = 'translateX(' + (-offset) + 'px)';
    updateProgress();
  }

  function updateProgress() {
    const total = Math.max(1, slides.length - Math.floor(slidesPerView) + 1);
    const pct = Math.min(100, ((currentIndex + 1) / total) * 100);
    if (progressBar) progressBar.style.width = pct + '%';
  }

  /* ── Arrow clicks ─────────────────────────────────────────── */
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (currentIndex < maxIndex) {
        currentIndex++;
        updateCarousel();
      }
    });
  }

  /* ── Touch / pointer drag ─────────────────────────────────── */
  let startX = 0;
  let startTranslate = 0;
  let dragging = false;

  function pointerDown(e) {
    dragging = true;
    startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    startTranslate = currentIndex * getSlideWidth();
    track.classList.add('is-dragging');
  }

  function pointerMove(e) {
    if (!dragging) return;
    const x = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const diff = startX - x;
    track.style.transform = 'translateX(' + (-(startTranslate + diff)) + 'px)';
  }

  function pointerUp(e) {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('is-dragging');
    const x = e.type.includes('touch') ? e.changedTouches[0].clientX : e.clientX;
    const diff = startX - x;
    const sw = getSlideWidth();
    const threshold = sw * 0.25;

    if (diff > threshold && currentIndex < maxIndex) {
      currentIndex++;
    } else if (diff < -threshold && currentIndex > 0) {
      currentIndex--;
    }
    updateCarousel();
  }

  track.addEventListener('mousedown', pointerDown);
  track.addEventListener('mousemove', pointerMove);
  track.addEventListener('mouseup', pointerUp);
  track.addEventListener('mouseleave', function () {
    if (dragging) {
      dragging = false;
      track.classList.remove('is-dragging');
      updateCarousel();
    }
  });
  track.addEventListener('touchstart', pointerDown, { passive: true });
  track.addEventListener('touchmove', pointerMove, { passive: true });
  track.addEventListener('touchend', pointerUp);

  /* ── Video Playback ───────────────────────────────────────── */
  const playButtons = track.querySelectorAll('.video-carousel__play-btn');
  let activeVideoContainer = null;

  function stopActiveVideo() {
    if (!activeVideoContainer) return;
    
    const iframe = activeVideoContainer.querySelector('iframe');
    const video = activeVideoContainer.querySelector('video');
    
    if (iframe) {
      // Reload iframe to stop playing
      const src = iframe.src;
      iframe.src = '';
      iframe.src = src;
    } else if (video) {
      video.pause();
    }
    
    activeVideoContainer.style.display = 'none';
    activeVideoContainer = null;
  }

  playButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent drag interference
      
      const slide = this.closest('.video-carousel__slide');
      const videoContainer = slide.querySelector('.video-carousel__video-container');
      
      if (!videoContainer) return;
      
      // Stop currently playing video
      if (activeVideoContainer && activeVideoContainer !== videoContainer) {
        stopActiveVideo();
      }
      
      videoContainer.style.display = 'block';
      activeVideoContainer = videoContainer;
      
      const iframe = videoContainer.querySelector('iframe');
      const video = videoContainer.querySelector('video');
      
      if (iframe) {
        // Append autoplay parameter if not present
        let src = iframe.src;
        if (!src.includes('autoplay=1')) {
          src += (src.includes('?') ? '&' : '?') + 'autoplay=1';
          iframe.src = src;
        }
      } else if (video) {
        video.play();
      }
    });
  });

  /* ── Init + resize ────────────────────────────────────────── */
  function init() {
    calcLayout();
    updateCarousel();
  }

  init();
  window.addEventListener('resize', init);
})();
