// header: stays on screen. Over a hero image it is see-through and takes the image's tone
// (data-tone, see style.css); once the page scrolls under it, it becomes a compact bar with a hairline.
(function () {
  var header = document.querySelector('.site-header');
  if (!header) return;
  var hero = document.querySelector('[data-hero]');
  function update() {
    // only a hero that starts at the very top runs under the header (on phones project heroes start below it)
    var over = !!hero && hero.offsetTop < 1 && hero.getBoundingClientRect().bottom > header.offsetHeight / 2;
    header.classList.toggle('is-over', over);
    header.classList.toggle('is-stuck', !over && window.scrollY > 4);
  }
  function measure() {        // pages below the header leave room for it, even when it wraps to two lines
    if (!header.classList.contains('is-stuck')) document.documentElement.style.setProperty('--head-h', header.offsetHeight + 'px');
    update();
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', measure);
  measure();
})();
