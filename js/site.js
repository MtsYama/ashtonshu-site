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
  [].forEach.call(document.querySelectorAll('.site-header :is(.wordmark, .site-nav a, .theme-toggle)'), function (el) {
    el.insertAdjacentHTML('beforeend', '<i class="hb hb-tl" aria-hidden="true"></i><i class="hb hb-tr" aria-hidden="true"></i><i class="hb hb-bl" aria-hidden="true"></i><i class="hb hb-br" aria-hidden="true"></i>');
  });
})();

// header lists: a header control with data-drop (Work or Language in every language) opens the list its
// aria-controls names, outside the header with --drop-gap below its row (style.css, "header lists"). An empty
// sibling drop-veil shares the panel's bounds and clip, blurring the page separately from the blended text. The control's
// own four corners frame the two: the top two stay on the control, the bottom two travel down to the list's bottom
// corners and back on closing, while the list unrolls between them; the list's items get the corners of the
// header's links. Work is a link to Projects without scripts and a button here. Opened from the keyboard, the focus
// moves to the first item; Tab runs from the control through the list and on to the next header item. Escape, the
// focus moving on, or a click elsewhere closes it; a tap elsewhere only closes it, so it never also follows a link
// or turns a slide.
(function () {
  var root = document.documentElement, reduce = window.matchMedia('(prefers-reduced-motion: reduce)'), touch = false;
  var FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
  var CORNERS = '<i class="hb hb-tl" aria-hidden="true"></i><i class="hb hb-tr" aria-hidden="true"></i><i class="hb hb-bl" aria-hidden="true"></i><i class="hb hb-br" aria-hidden="true"></i>';
  document.addEventListener('pointerdown', function (e) { touch = e.pointerType !== 'mouse'; }, true);
  [].forEach.call(document.querySelectorAll('.site-header [data-drop][aria-controls]'), function (b) {
    var menu = document.getElementById(b.getAttribute('aria-controls'));
    if (menu) drop(b, menu);
  });

  function drop(b, menu) {
    var header = b.closest('.site-header'), shut = 0, raf = 0;
    var veil = document.createElement('div');
    veil.className = 'drop-veil';
    veil.setAttribute('aria-hidden', 'true');
    veil.hidden = menu.hidden;
    menu.parentNode.insertBefore(veil, menu);
    if (!b.querySelector('.hb')) b.insertAdjacentHTML('beforeend', CORNERS);
    [].forEach.call(menu.querySelectorAll('a, li > span'), function (el) { el.insertAdjacentHTML('beforeend', CORNERS); });
    if (b.tagName === 'A') {
      b.setAttribute('role', 'button');
      b.addEventListener('keydown', function (e) { if (e.key === ' ') { e.preventDefault(); b.click(); } });
    }
    b.setAttribute('aria-expanded', 'false');
    function isOpen() { return b.getAttribute('aria-expanded') === 'true'; }
    function items() { return [].slice.call(menu.querySelectorAll(FOCUSABLE)); }

    // the control's frame is where its hover corners sit (.32em and .16em out, as in .hb); the list hangs from the
    // frame's bottom edge plus --drop-gap, below anything taller in the same header line (including phone buttons).
    // It stays at least as wide as the frame and lines up with the frame's left edge, its right edge
    // (--drop-align: end) or the header's gutters (full), always inside the window
    function measure() {
      var r = b.getBoundingClientRect(), em = parseFloat(getComputedStyle(b).fontSize), vw = root.clientWidth;
      var row = { l: r.left - .32 * em, r: r.right + .32 * em, b: r.bottom + .16 * em };
      var css = getComputedStyle(menu), align = css.getPropertyValue('--drop-align').trim();
      var gap = css.getPropertyValue('--drop-gap').trim();
      var gapPx = (parseFloat(gap) || 0) * (/em$/.test(gap) ? parseFloat(css.fontSize) : 1);
      var left, w, top = row.b;
      menu.style.width = '';
      menu.style.left = '0px';
      if (align === 'full') {
        left = parseFloat(getComputedStyle(header).paddingLeft);
        w = vw - 2 * left;
      } else {
        w = Math.min(Math.max(Math.ceil(menu.getBoundingClientRect().width), row.r - row.l), vw - 16);
        left = align === 'end' ? row.r - w : row.l;
        if (left + w > vw - 8) left = Math.min(left, row.r - w);   // no room on the right: line up the right edges
        left = Math.max(8, Math.min(left, vw - 8 - w));
      }
      [].forEach.call(header.querySelectorAll('a, button'), function (el) {
        var e = el.getBoundingClientRect();
        if (e.top < r.bottom && e.bottom > r.top) top = Math.max(top, e.bottom);
      });
      top += gapPx;
      menu.style.left = left + 'px';
      menu.style.top = top + 'px';
      menu.style.width = w + 'px';
      veil.style.left = menu.style.left;
      veil.style.top = menu.style.top;
      veil.style.width = menu.style.width;
      veil.style.height = menu.getBoundingClientRect().height + 'px';
      return { row: row, l: left, r: left + w, t: top, b: top + menu.getBoundingClientRect().height };
    }
    // open: the bottom corners sit on the list's bottom corners and the whole list shows; shut: the corners are
    // back round the control and the list is clipped to nothing under it
    function set(f, on) {
      var row = f.row;
      b.style.setProperty('--drop-l', on ? (row.l - f.l) + 'px' : '0px');
      b.style.setProperty('--drop-r', on ? (f.r - row.r) + 'px' : '0px');
      b.style.setProperty('--drop-b', on ? (f.b - row.b) + 'px' : '0px');
      menu.style.clipPath = on ? 'inset(0px 0px 0px 0px)'
        : 'inset(0px ' + Math.max(0, f.r - row.r) + 'px ' + (f.b - f.t) + 'px ' + Math.max(0, row.l - f.l) + 'px)';
      veil.style.clipPath = menu.style.clipPath;
    }
    function open(on, keyboard) {
      clearTimeout(shut);
      if (on) {
        var fresh = menu.hidden;                // not still rolling up from a moment ago
        menu.hidden = veil.hidden = false;
        menu.inert = false;
        var f = measure();
        if (fresh) {                            // the list starts as a line under the control, then unrolls
          menu.style.transition = veil.style.transition = 'none';
          set(f, false);
          void menu.offsetWidth;
          void veil.offsetWidth;
          menu.style.transition = veil.style.transition = '';
        }
        b.setAttribute('aria-expanded', 'true');
        set(f, true);
        if (keyboard && items().length) items()[0].focus();
      } else {
        var g = measure();
        b.setAttribute('aria-expanded', 'false');
        menu.inert = true;
        set(g, false);
        shut = setTimeout(function () { menu.hidden = veil.hidden = true; }, reduce.matches ? 0 : 460);
      }
    }
    // the header tightens as the page scrolls under it: the list follows the control for the length of that move
    function follow(ms) {
      var end = performance.now() + ms;
      cancelAnimationFrame(raf);
      (function step() {
        if (!isOpen()) return;
        set(measure(), true);
        if (performance.now() < end) raf = requestAnimationFrame(step);
      })();
    }
    // the header item after the control, where Tab goes from the list's last item
    function after() {
      var all = [].filter.call(document.querySelectorAll(FOCUSABLE), function (n) {
        return n === b || (!menu.contains(n) && n.getClientRects().length);
      });
      return all[all.indexOf(b) + 1] || null;
    }

    b.addEventListener('click', function (e) {
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;   // a link opened in a new tab stays a link
      e.preventDefault();
      open(!isOpen(), e.detail === 0);
    });
    document.addEventListener('click', function (e) {
      if (!isOpen() || menu.contains(e.target) || b.contains(e.target)) return;
      if (touch) { e.preventDefault(); e.stopPropagation(); }
      open(false);
    }, true);
    document.addEventListener('focusin', function (e) {
      if (isOpen() && !menu.contains(e.target) && !b.contains(e.target)) open(false);
    });
    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      var a = document.activeElement, list = items();
      if (e.key === 'Escape') {
        var back = a === b || menu.contains(a);
        open(false);
        if (back) b.focus();
      } else if (e.key === 'Tab' && list.length) {
        var to = a === b && !e.shiftKey ? list[0]
          : a === list[0] && e.shiftKey ? b
          : a === list[list.length - 1] && !e.shiftKey ? after() : null;
        if (to) { e.preventDefault(); to.focus(); }
      }
    });
    window.addEventListener('resize', function () { follow(0); });
    window.addEventListener('scroll', function () { follow(400); }, { passive: true });
    window.addEventListener('pageshow', function (e) {   // back from the next page: closed, without the motion
      if (!e.persisted || !isOpen()) return;
      b.style.transition = 'none';
      b.setAttribute('aria-expanded', 'false');
      ['--drop-l', '--drop-r', '--drop-b'].forEach(function (p) { b.style.setProperty(p, '0px'); });
      menu.hidden = veil.hidden = true;
      void b.offsetWidth;
      b.style.transition = '';
    });
  }
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
