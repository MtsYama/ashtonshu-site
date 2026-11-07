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

// header links: four corners frame each icon and label together on hover and keyboard focus (style.css, .hb)
(function () {
  [].forEach.call(document.querySelectorAll('.site-header :is(.wordmark, .site-nav a, .theme-toggle, .lang-toggle)'), function (el) {
    el.insertAdjacentHTML('beforeend', '<i class="hb hb-tl" aria-hidden="true"></i><i class="hb hb-tr" aria-hidden="true"></i><i class="hb hb-bl" aria-hidden="true"></i><i class="hb hb-br" aria-hidden="true"></i>');
  });
})();

// Header settings: one nonmodal dialog, with native buttons and links.
(function () {
  var active = null;
  var header = document.querySelector('.site-header');
  var triggers = document.querySelectorAll('[data-panel-toggle]');
  function close() {
    if (!active) return;
    var previous = active;
    active = null;
    previous.panel.hidden = true;
    previous.button.setAttribute('aria-expanded', 'false');
    previous.button.focus({ preventScroll: true });
  }
  function position() {
    if (!active || !header) return;
    var rect = header.getBoundingClientRect();
    var gutter = parseFloat(getComputedStyle(header).paddingRight);
    var top = rect.bottom + 12;
    active.panel.style.right = Math.max(12, gutter) + 'px';
    active.panel.style.top = top + 'px';
    active.panel.style.maxHeight = Math.max(44, window.innerHeight - top - 12) + 'px';
  }
  [].forEach.call(triggers, function (button) {
    var panel = document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;
    button.addEventListener('click', function () {
      var same = active && active.button === button;
      close();
      if (same) return;
      active = { button: button, panel: panel };
      panel.hidden = false;
      button.setAttribute('aria-expanded', 'true');
      position();
      panel.querySelector('[data-panel-close]').focus({ preventScroll: true });
    });
    panel.querySelector('[data-panel-close]').addEventListener('click', close);
  });
  document.addEventListener('click', function (event) {
    if (!active || active.panel.contains(event.target) || active.button.contains(event.target)) return;
    close();
  });
  document.addEventListener('keydown', function (event) {
    if (!active) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    // Keep the dialog's Tab sequence together although its DOM is after the header.
    if (event.key === 'Tab') {
      var items = active.panel.querySelectorAll('a[href], button');
      var first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  window.addEventListener('resize', position);
  window.addEventListener('scroll', position, { passive: true });
  if (window.ResizeObserver && header) new ResizeObserver(position).observe(header);
  window.addEventListener('pageshow', function (event) { if (event.persisted) close(); });

  var root = document.documentElement;
  var choices = document.querySelectorAll('[data-theme-choice]');
  function select(mode) {
    if (mode !== 'light' && mode !== 'dark') mode = 'auto';
    if (mode === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);
    [].forEach.call(choices, function (button) {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-theme-choice') === mode));
    });
  }
  var saved;
  try { saved = localStorage.getItem('theme'); } catch (error) {}
  select(saved);
  [].forEach.call(choices, function (button) {
    button.addEventListener('click', function () {
      var mode = button.getAttribute('data-theme-choice');
      select(mode);
      try { localStorage.setItem('theme', mode); } catch (error) {}
    });
  });
  window.addEventListener('storage', function (event) { if (event.key === 'theme' || event.key === null) select(event.newValue); });
})();

// The requested Logo Motion covers are the only moving card and home artwork.
(function () {
  var covers = [].slice.call(document.querySelectorAll('video[data-cover-motion]'));
  if (!covers.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var visible = new Set(), showPlaying = true;
  function sync(v) {
    var slide = v.closest('.slide');
    var active = slide ? slide.classList.contains('is-active') : visible.has(v);
    if (active && (!slide || showPlaying) && !reduce.matches && !document.hidden) {
      var playing = v.play();
      if (playing && playing.catch) playing.catch(function () {});
    } else {
      v.pause();
      if (reduce.matches || (slide && !active)) {
        try { v.currentTime = 0; } catch (e) {}
      }
    }
  }
  function syncAll() { covers.forEach(sync); }
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio > 0) visible.add(entry.target);
        else visible.delete(entry.target);
        sync(entry.target);
      });
    }, { threshold: 0.01 });
    covers.forEach(function (v) { if (!v.closest('.slide')) observer.observe(v); });
  }
  var show = document.querySelector('.show');
  if (show) {
    show.addEventListener('show:change', syncAll);
    show.addEventListener('show:playing', function (e) { showPlaying = e.detail.playing; syncAll(); });
  }
  if (reduce.addEventListener) reduce.addEventListener('change', syncAll);
  else if (reduce.addListener) reduce.addListener(syncAll);
  document.addEventListener('visibilitychange', syncAll);
  syncAll();
})();

// Project loops share live reduced-motion handling and native pause controls.
(function () {
  var videos = [].slice.call(document.querySelectorAll('.p-motion video[loop], .p-stickers video[loop]'));
  if (!videos.length) return;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var visible = new Set(), userPaused = new Set();
  function eligible(v) { return visible.has(v) && !reduce.matches && !document.hidden; }
  function firstFrame(v) {
    v.pause();
    try { v.currentTime = 0; } catch (e) {}
  }
  function sync(v) {
    if (reduce.matches) { firstFrame(v); return; }
    if (eligible(v) && !userPaused.has(v)) {
      var result = v.play();
      if (result && result.catch) result.catch(function () {});
    } else v.pause();
  }
  function syncAll() { videos.forEach(sync); }
  videos.forEach(function (v) {
    v.controls = true;
    v.preload = 'metadata';
    v.addEventListener('loadedmetadata', function () { if (reduce.matches) firstFrame(v); });
    v.addEventListener('pause', function () { if (eligible(v) && v.paused) userPaused.add(v); });
    v.addEventListener('play', function () {
      if (reduce.matches) { firstFrame(v); return; }
      userPaused.delete(v);
    });
  });
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target); else visible.delete(entry.target);
        sync(entry.target);
      });
    }, { threshold: 0.25 });
    videos.forEach(function (v) { observer.observe(v); });
  }
  if (reduce.addEventListener) reduce.addEventListener('change', syncAll);
  else if (reduce.addListener) reduce.addListener(syncAll);
  document.addEventListener('visibilitychange', syncAll);
  syncAll();
})();

// a cover with two images: they fade into each other every two seconds, so the card says there is more than one thing inside
(function () {
  var covers = document.querySelectorAll('[data-swap]');
  if (!covers.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  setInterval(function () {
    if (document.hidden) return;
    covers.forEach(function (c) { c.classList.toggle('is-swapped'); });
  }, 2000);
})();
