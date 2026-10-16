// Name mark (css/name-motion.css): measures the three words once Poppins is in, in em so the mark
// scales with its font-size, then starts it. data-nm="loop" (default) loops, data-nm="once" plays it once
// and fires "nm:done" on the mark, data-nm="manual" waits for nameMotion.play(). With reduced motion
// nothing moves: the full name stays in its frame.
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  function measure(nm) {
    var em = parseFloat(getComputedStyle(nm).fontSize);
    [].forEach.call(nm.querySelectorAll('.nm-l > span'), function (s, k) {
      nm.style.setProperty('--w' + (k + 1), s.getBoundingClientRect().width / em + 'em');
    });
  }

  function play(nm, mode) {
    nm.classList.remove('is-live', 'is-once', 'is-intro', 'is-rest');
    if (reduce.matches) { nm.dispatchEvent(new Event('nm:done')); return; }
    void nm.offsetWidth;   // restart from the first frame
    if (mode === 'once' || mode === 'intro') {   // intro: the home cover's quicker once (2.3 s)
      nm.classList.add('is-' + mode);
      setTimeout(function () { nm.dispatchEvent(new Event('nm:done')); }, mode === 'intro' ? 2300 : 4800);
    } else {
      nm.classList.add('is-live');
    }
  }

  function rest(nm) { nm.classList.remove('is-live', 'is-once', 'is-intro'); nm.classList.add('is-rest'); }

  var marks = [].slice.call(document.querySelectorAll('.nm'));
  var fonts = document.fonts ? document.fonts.load('800 1em Poppins', 'AshtonZhengsu') : Promise.resolve();
  var ready = Promise.race([fonts, new Promise(function (r) { setTimeout(r, 1500); })]).then(function () {
    marks.forEach(function (nm) {
      measure(nm);
      var mode = nm.getAttribute('data-nm') || 'loop';
      if (mode !== 'manual') play(nm, mode);
    });
  });
  reduce.addEventListener('change', function () {
    marks.forEach(function (nm) { if ((nm.getAttribute('data-nm') || 'loop') === 'loop') play(nm, 'loop'); });
  });

  window.nameMotion = {
    ready: ready,
    play: function (nm, mode) { ready.then(function () { play(nm, mode); }); },
    rest: rest,
    measure: measure
  };
})();
