// header: stays on screen and see-through; style.css blends it in difference mode so it reads on any ground.
// Here it only tightens its padding once the page scrolls under it.
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

// header links: the four corners that open round them on hover and keyboard focus (style.css, .hb)
(function () {
  [].forEach.call(document.querySelectorAll('.site-header :is(.wordmark, .site-nav a, .theme-toggle)'), function (el) {
    el.insertAdjacentHTML('beforeend', '<i class="hb hb-tl" aria-hidden="true"></i><i class="hb hb-tr" aria-hidden="true"></i><i class="hb hb-bl" aria-hidden="true"></i><i class="hb hb-br" aria-hidden="true"></i>');
  });
})();
