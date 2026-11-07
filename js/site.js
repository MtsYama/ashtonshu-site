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

// Full-screen view of project images with share and download, and a share button for the page.
// The site shows clean images; only the files in /dl carry a credit, on pages marked main[data-dl].
(function () {
  var root = document.documentElement;
  var code = (root.lang || 'en').toLowerCase();
  var key = code.indexOf('zh-hant') === 0 ? 'zht' : code.slice(0, 2);
  var words = {
    en: ['Back', 'Share', 'Download', 'Link copied', 'View larger', 'Free to share with credit.', 'Share this project', 'Share this site', 'Share this page'],
    fr: ['Retour', 'Partager', 'Télécharger', 'Lien copié', 'Agrandir', 'Partage libre avec mention de l’auteur.', 'Partager ce projet', 'Partager ce site', 'Partager cette page'],
    zh: ['返回', '分享', '下载', '链接已复制', '查看大图', '可以自由转发，请署名。', '分享这个项目', '分享这个网站', '分享这一页'],
    zht: ['返回', '分享', '下載', '連結已複製', '檢視大圖', '可以自由轉發，請署名。', '分享這個專案', '分享這個網站', '分享這一頁'],
    ja: ['戻る', '共有', 'ダウンロード', 'リンクをコピーしました', '拡大して見る', '共有は自由です。クレジットを記載してください。', 'このプロジェクトを共有', 'このサイトを共有', 'このページを共有'],
    ko: ['뒤로', '공유', '다운로드', '링크를 복사했습니다', '크게 보기', '자유롭게 공유하되 출처를 밝혀 주세요.', '이 프로젝트 공유', '이 사이트 공유', '이 페이지 공유']
  };
  var t = words[key] || words.en;
  var icon = function (d) { return '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>'; };
  var shareIcon = icon('<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/>');
  var saveIcon = icon('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>');
  var backIcon = icon('<path d="m15 18-6-6 6-6"/>');
  var host = /^world\./.test(location.hostname) ? 'https://ashton.is' : '';
  var page = document.querySelector('main[data-dl]');

  function toast(parent) {
    var n = document.createElement('p');
    n.className = 'share-toast';
    n.setAttribute('role', 'status');
    n.textContent = t[3];
    parent.appendChild(n);
    setTimeout(function () { n.remove(); }, 2000);
  }
  function share(parent) {
    var url = location.href.split('#')[0];
    if (navigator.share) { navigator.share({ title: document.title, url: url }).catch(function () {}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(function () { toast(parent); });
  }
  function shareButton(cls) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.setAttribute('aria-label', t[1]);
    b.title = t[1];
    b.innerHTML = shareIcon;
    return b;
  }

  var social = document.querySelector('.foot-links a.icon-link');
  if (social) {
    var row = document.createElement('li');
    var pageShare = document.createElement('button');
    pageShare.type = 'button';
    pageShare.className = 'icon-link foot-share';
    pageShare.innerHTML = icon('<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="m16 6-4-4-4 4"/><path d="M12 2v13"/>').replace(/width="22" height="22"/, 'width="18" height="18"') + '<span></span>';
    // says what it shares: the project on a project page, the site on the home page
    pageShare.lastChild.textContent = document.querySelector('.p-head') ? t[6] : /^\/([a-z-]+\/)?(index(\.html)?)?$/.test(location.pathname) ? t[7] : t[8];
    pageShare.addEventListener('click', function () { share(document.body); });
    row.appendChild(pageShare);
    social.closest('ul').appendChild(row);
  }

  // a video cannot open full screen like the images, so the same two round buttons sit under it
  if (page) {
    page.querySelectorAll('video source').forEach(function (s) {
      var name = (s.getAttribute('src') || '').split('/').pop().replace(/\.mp4.*$/, '');
      var box = s.closest('.p-art') || s.parentNode.parentNode;
      var row = document.createElement('div');
      row.className = 'media-actions';
      var send = document.createElement('button');
      send.type = 'button';
      send.className = 'media-btn';
      send.setAttribute('aria-label', t[1]);
      send.title = t[1];
      send.innerHTML = shareIcon;
      send.addEventListener('click', function () { share(document.body); });
      var get = document.createElement('a');
      get.className = 'media-btn';
      get.href = host + '/dl/ashton-shu-' + name + '.mp4';
      get.setAttribute('aria-label', t[2]);
      get.title = t[2];
      get.innerHTML = saveIcon;
      row.appendChild(send);
      row.appendChild(get);
      box.parentNode.insertBefore(row, box.nextSibling);
    });
  }

  var images = document.querySelectorAll('.p-art img, .p-hero img');
  if (!images.length || typeof HTMLDialogElement === 'undefined') return;
  var box = document.createElement('dialog');
  box.className = 'viewer';
  box.innerHTML = '<img class="viewer-img" alt=""><button class="viewer-btn viewer-back" type="button"></button><div class="viewer-actions"></div><p class="viewer-credit" hidden></p>';
  var big = box.querySelector('.viewer-img');
  var back = box.querySelector('.viewer-back');
  var actions = box.querySelector('.viewer-actions');
  var credit = box.querySelector('.viewer-credit');
  back.innerHTML = backIcon;
  back.setAttribute('aria-label', t[0]);
  var send = shareButton('viewer-btn');
  send.addEventListener('click', function () { share(box); });
  actions.appendChild(send);
  var save = null;
  if (page) {
    save = document.createElement('a');
    save.className = 'viewer-btn';
    save.setAttribute('aria-label', t[2]);
    save.title = t[2];
    save.innerHTML = saveIcon;
    actions.appendChild(save);
    credit.hidden = false;
    credit.innerHTML = '© Ashton Z. Shu. ' + t[5] + ' <a href="https://creativecommons.org/licenses/by-nc/4.0/" rel="license noopener" target="_blank">CC BY-NC 4.0</a>';
  }
  document.body.appendChild(box);

  function open(img) {
    big.src = img.currentSrc || img.src;
    big.alt = img.alt || '';
    box.setAttribute('aria-label', img.alt || t[4]);
    if (save) save.href = host + '/dl/ashton-shu-' + (img.currentSrc || img.src).split('/').pop().split('?')[0].replace(/\.[a-z0-9]+$/i, '') + '.jpg';
    box.showModal();
    root.classList.add('viewer-open');
    history.pushState({ viewer: 1 }, '');
    back.focus();
  }
  back.addEventListener('click', function () { box.close(); });
  big.addEventListener('click', function () { box.close(); });
  box.addEventListener('close', function () {
    root.classList.remove('viewer-open');
    if (history.state && history.state.viewer) history.back();
  });
  window.addEventListener('popstate', function () { if (box.open) box.close(); });
  images.forEach(function (img) {
    img.classList.add('can-open');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', t[4] + ': ' + (img.alt || ''));
    img.addEventListener('click', function () { open(img); });
    img.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(img); } });
  });
})();
