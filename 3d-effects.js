/* SwimFest India — Lightweight 3D Effects (120fps) */
(function() {
  'use strict';

  // Scroll Reveal — simple IntersectionObserver
  const revealElements = document.querySelectorAll('.reveal-3d');
  if (revealElements.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed-3d');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => {
      el.classList.add('reveal-3d-init');
      observer.observe(el);
    });
  }
})();
