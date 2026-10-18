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
    var stuck = !over && window.scrollY > 4;
    header.classList.toggle('is-stuck', stuck);
    document.documentElement.classList.toggle('head-stuck', stuck);   // style.css puts a page-colour band behind it
  }
  function measure() {        // pages below the header leave room for it, even when it wraps to two lines
    if (!header.classList.contains('is-stuck')) {
      var root = document.documentElement.style, top = parseFloat(getComputedStyle(header).paddingTop);
      root.setProperty('--head-h', header.offsetHeight + 'px');
      root.setProperty('--head-stuck-h', header.offsetHeight - top + Math.min(top, 16) + 'px');   // the same 16 px cap as .is-stuck
    }
    update();
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', measure);
  measure();
  if (document.fonts) document.fonts.ready.then(measure);   // the nav can wrap in the fallback font, then fit in Inter
  // the header's height also follows an app's text size, which sends no resize. Watch the wordmark: the header itself
  // changes height all through its padding transition on scroll
  var wm = header.querySelector('.wordmark');
  if (window.ResizeObserver && wm) new ResizeObserver(function () { requestAnimationFrame(measure); }).observe(wm);
})();

// header links: the four corners that open round them on hover and keyboard focus (style.css, .hb)
(function () {
  [].forEach.call(document.querySelectorAll('.site-header :is(.wordmark, .site-nav a, .theme-toggle)'), function (el) {
    el.insertAdjacentHTML('beforeend', '<i class="hb hb-tl" aria-hidden="true"></i><i class="hb hb-tr" aria-hidden="true"></i><i class="hb hb-bl" aria-hidden="true"></i><i class="hb hb-br" aria-hidden="true"></i>');
  });
})();
