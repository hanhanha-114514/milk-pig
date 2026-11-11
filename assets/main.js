(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cfg = window.NZSK_CONFIG || {};

  /* ---------- 深浅色切换 ---------- */
  var THEME_KEY = 'nzsk-theme';
  var sw = document.querySelector('.theme-switch');

  var paintSwitch = function (theme) {
    if (!sw) { return; }
    var dark = theme === 'dark';
    sw.setAttribute('aria-checked', dark ? 'true' : 'false');
    sw.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式');
    sw.title = dark ? '当前为深色 · 点击切换浅色' : '当前为浅色 · 点击切换深色';
  };

  paintSwitch(root.getAttribute('data-theme') || 'light');

  if (sw) {
    sw.addEventListener('click', function () {
      var next = (root.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
      root.classList.add('theme-anim');
      root.setAttribute('data-theme', next);
      paintSwitch(next);
      try { localStorage.setItem(THEME_KEY, next); } catch (err) {}
      setTimeout(function () { root.classList.remove('theme-anim'); }, 620);
    });
  }

  /* 未手动选择时跟随系统 */
  if (window.matchMedia) {
    var mqDark = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function (e) {
      var stored = null;
      try { stored = localStorage.getItem(THEME_KEY); } catch (err) {}
      if (stored) { return; }
      root.classList.add('theme-anim');
      var next = e.matches ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      paintSwitch(next);
      setTimeout(function () { root.classList.remove('theme-anim'); }, 620);
    };
    if (typeof mqDark.addEventListener === 'function') { mqDark.addEventListener('change', onChange); }
    else if (typeof mqDark.addListener === 'function') { mqDark.addListener(onChange); }
  }

  /* ---------- 入场加载动画 ---------- */
  var veil = document.getElementById('intro-veil');
  if (veil) {
    /* introEveryPage=false 时，会话内只在首个页面播放 */
    var seen = false;
    try { seen = !cfg.introEveryPage && sessionStorage.getItem('nzsk-intro-done') === '1'; } catch (err) { seen = false; }
    if (seen) {
      veil.parentNode.removeChild(veil);
      root.classList.remove('intro');
      veil = null;
    }
  }
  if (veil) {
    try { sessionStorage.setItem('nzsk-intro-done', '1'); } catch (err) {}
    var wordEl = veil.querySelector('.intro-word');
    if (wordEl && !reduceMotion) {
      var text = wordEl.textContent.trim();
      wordEl.textContent = '';
      for (var i = 0; i < text.length; i++) {
        var s = document.createElement('span');
        s.textContent = text.charAt(i);
        s.style.setProperty('--ld', (0.12 + i * 0.045).toFixed(3) + 's');
        wordEl.appendChild(s);
      }
    }

    var bar = veil.querySelector('.intro-track i');
    var pctEl = veil.querySelector('[data-intro-pct]');
    var finish = function () {
      if (veil.classList.contains('out')) { return; }
      veil.classList.add('out');
      root.classList.remove('intro');
      setTimeout(function () { if (veil.parentNode) { veil.parentNode.removeChild(veil); } }, 760);
    };

    if (reduceMotion) {
      finish();
    } else {
      var dur = cfg.introMs || 950;
      var t0 = performance.now();
      var step = function (now) {
        var p = Math.min((now - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 2.2);
        if (bar) { bar.style.width = (eased * 100).toFixed(1) + '%'; }
        if (pctEl) { pctEl.textContent = '正在进入 · ' + Math.round(eased * 100) + '%'; }
        if (p < 1) { requestAnimationFrame(step); } else { setTimeout(finish, 140); }
      };
      requestAnimationFrame(step);
      /* 兜底：脚本后段出错也不会把页面锁在遮罩里 */
      setTimeout(function () { root.classList.remove('intro'); }, 2600);
    }
  } else {
    root.classList.remove('intro');
  }

  /* ---------- 移动端导航 ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open') ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { links.classList.remove('open'); }
    });
  }

  /* ---------- 配置化下载地址 ---------- */
  var isExternal = !!(cfg.githubReleaseUrl && cfg.githubReleaseUrl.trim());
  var target = isExternal ? cfg.githubReleaseUrl.trim() : (cfg.packagePath || '');

  var nameEls = document.querySelectorAll('[data-package-name]');
  Array.prototype.forEach.call(nameEls, function (el) {
    el.textContent = cfg.packageName || '奶猪水课助手.zip';
  });

  var dlBtns = document.querySelectorAll('[data-download]');
  var modal = document.getElementById('dl-modal');

  Array.prototype.forEach.call(dlBtns, function (el) {
    if (!target) { return; }
    if (el.tagName === 'A') {
      el.setAttribute('href', target);
      if (isExternal) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener');
      } else {
        el.setAttribute('download', cfg.packageName || '');
      }
    }
  });

  if (modal && !target) {
    var lastFocus = null;
    var openModal = function () {
      lastFocus = document.activeElement;
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      var btn = modal.querySelector('[data-close]');
      if (btn) { btn.focus(); }
    };
    var closeModal = function () {
      modal.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus) { lastFocus.focus(); }
    };
    Array.prototype.forEach.call(dlBtns, function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); openModal(); });
    });
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.hasAttribute('data-close')) { closeModal(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) { closeModal(); }
    });
  }

  /* ---------- 滚动进场 ---------- */
  var SELECT = '[data-reveal], .hero-copy, .section-head, .card, .flow, .flow-track > .flow-node, .stats, .versus, .step, .note, .dl-card, .spec > div, .tree, .tbl, .release, .faq details, .doc > h2, .doc > .actions, .doc-layout > .toc';
  var revealables = document.querySelectorAll(SELECT);
  Array.prototype.forEach.call(document.querySelectorAll('.step'), function (s) {
    if (!s.querySelector('.step-bar')) {
      var bar = document.createElement('div');
      bar.className = 'step-bar';
      bar.appendChild(document.createElement('i'));
      s.insertBefore(bar, s.querySelector('p'));
    }
  });
  var perParent = {};
  Array.prototype.forEach.call(revealables, function (el) {
    var key = el.parentNode;
    perParent[key] = (perParent[key] || 0) + 1;
    if (!el.hasAttribute('data-reveal')) { el.setAttribute('data-reveal', ''); }
    if (!el.style.getPropertyValue('--d')) {
      el.style.setProperty('--d', Math.min((perParent[key] - 1) * 0.07, 0.35) + 's');
    }
  });

  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          el.classList.add('in');
          io.unobserve(el);
          /* 进场结束后清掉错峰延迟，让 hover 保持即时 */
          setTimeout(function () { el.style.removeProperty('--d'); }, 1400);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), function (el) { io.observe(el); });
  } else {
    Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), function (el) { el.classList.add('in'); });
  }

  /* ---------- 头部状态 ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- 目录滚动高亮 ---------- */
  var tocLinks = document.querySelectorAll('.toc a[href^="#"]');
  if (tocLinks.length) {
    var map = {};
    Array.prototype.forEach.call(tocLinks, function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var sections = Object.keys(map).map(function (id) { return document.getElementById(id); }).filter(Boolean);
    var spy = function () {
      var best = null, bestTop = -Infinity;
      var line = window.innerHeight * 0.28;
      sections.forEach(function (s) {
        var top = s.getBoundingClientRect().top;
        if (top <= line && top > bestTop) { bestTop = top; best = s; }
      });
      Array.prototype.forEach.call(tocLinks, function (a) { a.classList.remove('active'); });
      if (best && map[best.id]) { map[best.id].classList.add('active'); }
    };
    spy();
    window.addEventListener('scroll', spy, { passive: true });
  }

  /* ---------- 数字滚动 ---------- */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    var run = function (el) {
      var to = parseFloat(el.getAttribute('data-count'));
      var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduceMotion) { el.textContent = to.toFixed(dec) + suffix; return; }
      var start = performance.now(), dur = 1100;
      var tick = function (now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (to * eased).toFixed(dec) + suffix;
        if (p < 1) { requestAnimationFrame(tick); }
      };
      requestAnimationFrame(tick);
    };
    if ('IntersectionObserver' in window) {
      var cio = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (en.isIntersecting) { run(en.target); cio.unobserve(en.target); }
        });
      }, { threshold: 0.5 });
      Array.prototype.forEach.call(counters, function (el) { cio.observe(el); });
    } else {
      Array.prototype.forEach.call(counters, run);
    }
  }

  /* ---------- 面板演示：进度、状态、日志循环 ---------- */
  var panel = document.querySelector('.panel-mock[data-demo]');
  if (panel && !reduceMotion) {
    var bar = panel.querySelector('.pm-bar i');
    var hourEl = panel.querySelector('[data-pm-hour]');
    var chapterEl = panel.querySelector('[data-pm-chapter]');
    var statusEl = panel.querySelector('[data-pm-status]');
    var logEls = panel.querySelectorAll('.pm-log div');
    var targetHour = parseFloat(panel.getAttribute('data-target-hour') || '2');
    var chapters = parseInt(panel.getAttribute('data-chapters') || '12', 10);

    var state = { hour: 0.32, chapter: 3, log: 0 };
    var statusText = ['播放中', '守护中', '静音挂机'];
    var setStatus = function (t) { if (statusEl) { statusEl.textContent = t; } };
    var paint = function () {
      var pct = Math.min(state.hour / targetHour, 1) * 100;
      if (bar) { bar.style.width = pct.toFixed(1) + '%'; }
      if (hourEl) { hourEl.textContent = state.hour.toFixed(2) + 'h'; }
      if (chapterEl) { chapterEl.textContent = '第 ' + state.chapter + ' 章'; }
    };
    var showLog = function (i) {
      Array.prototype.forEach.call(logEls, function (el, k) {
        el.classList.toggle('on', k === i % logEls.length);
      });
    };
    var step = function () {
      state.hour += 0.07 + Math.random() * 0.05;
      showLog(state.log++);
      if (state.hour >= targetHour) {
        state.hour = 0.06;
        state.chapter = state.chapter >= chapters ? 1 : state.chapter + 1;
        setStatus('切换章节');
        setTimeout(function () { setStatus(statusText[Math.floor(Math.random() * statusText.length)]); }, 1600);
      } else {
        setStatus(statusText[state.log % statusText.length]);
      }
      paint();
    };
    paint();
    showLog(0);
    setInterval(step, 1700);
  }

  /* ---------- 流程节点轮播高亮 ---------- */
  var flowNodes = document.querySelectorAll('.flow-node');
  if (flowNodes.length && !reduceMotion) {
    var fi = 0, flowPaused = false;
    var flowWrap = document.querySelector('.flow-track');
    if (flowWrap) {
      flowWrap.addEventListener('mouseenter', function () { flowPaused = true; });
      flowWrap.addEventListener('mouseleave', function () { flowPaused = false; });
    }
    setInterval(function () {
      if (flowPaused) { return; }
      Array.prototype.forEach.call(flowNodes, function (n, k) { n.classList.toggle('on', k === fi % flowNodes.length); });
      fi++;
    }, 1500);
  }

  /* ---------- 页脚年份 ---------- */
  var y = document.querySelector('[data-year]');
  if (y) { y.textContent = new Date().getFullYear(); }
})();