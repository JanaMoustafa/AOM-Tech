/*
 * AOM Tech hero particles.
 *
 * A standalone script (not part of the React bundle) so the animation starts as
 * soon as the page arrives, without waiting for the site's JavaScript to
 * download and hydrate. The simulation and drawing run in a Web Worker on an
 * OffscreenCanvas, so page start-up work can never make it stutter. Browsers
 * without OffscreenCanvas run the same engine on the main thread.
 *
 * Sequence: particles swarm into the AOM Tech mark, then re-form as "AOM".
 * The pointer pushes them aside, a click sends a shockwave, and scrolling away
 * scatters them upward. Reduced-motion users get the settled wordmark.
 */
(function () {
  "use strict";

  // ---------------------------------------------------------------------------
  // Engine: runs inside the worker (serialised with toString) or on the main
  // thread as a fallback. It must not reference anything outside itself.
  // ---------------------------------------------------------------------------
  function engine(send) {
    var MORPH_AT_FAST = 1500;
    var MORPH_AT_LATE = 850;
    var BLEND_MS = 900;
    var BUCKETS = 32;
    var STOPS = [
      [0, [91, 108, 255]],
      [0.45, [140, 82, 255]],
      [1, [255, 102, 196]],
    ];

    var canvas = null;
    var ctx = null;
    var width = 0;
    var height = 0;
    var dpr = 1;
    var reduce = false;
    var lateStart = false;
    var morphAt = MORPH_AT_FAST;

    // Particle state in flat typed arrays.
    var n = 0;
    var x, y, vx, vy, lx, ly, tx, ty, size, phase, sx, sy, lb, tb;
    var logoColors = [];
    var textColors = [];
    var groups = []; // particle indices grouped by (logo colour, text colour)
    var hasText = false;

    var startedAt = -1;
    var morphStart = 0;
    var introDone = false;
    var running = false;
    var visible = true;
    var scatter = 0;
    var pointer = { x: -9999, y: -9999, active: false };
    var pendingShock = null;
    var announced = false;
    var debug = false;
    var raf =
      typeof requestAnimationFrame === "function"
        ? requestAnimationFrame
        : function (cb) {
            return setTimeout(function () {
              cb(performance.now());
            }, 16);
          };

    function gradientAt(t) {
      for (var i = 1; i < STOPS.length; i++) {
        var t1 = STOPS[i][0];
        var t0 = STOPS[i - 1][0];
        if (t <= t1) {
          var k = (t - t0) / (t1 - t0);
          var c0 = STOPS[i - 1][1];
          var c1 = STOPS[i][1];
          return [0, 1, 2].map(function (j) {
            return Math.round(c0[j] + (c1[j] - c0[j]) * k);
          });
        }
      }
      return STOPS[STOPS.length - 1][1];
    }

    function alloc(count) {
      n = count;
      x = new Float32Array(n);
      y = new Float32Array(n);
      vx = new Float32Array(n);
      vy = new Float32Array(n);
      lx = new Float32Array(n);
      ly = new Float32Array(n);
      tx = new Float32Array(n);
      ty = new Float32Array(n);
      size = new Float32Array(n);
      phase = new Float32Array(n);
      sx = new Float32Array(n);
      sy = new Float32Array(n);
      lb = new Uint8Array(n);
      tb = new Uint8Array(n);
    }

    // logo: [x, y, r, g, b, ...]   text: [x, y, ...]
    function setTargets(logo, text, gap) {
      var logoCount = logo.length / 5;
      var textCount = text ? text.length / 2 : 0;
      if (!logoCount) return;
      var count = textCount > 0 ? textCount : logoCount;

      // Keep current positions so a rebuild (font load, resize) is seamless.
      var old = n ? { x: x, y: y, vx: vx, vy: vy, n: n } : null;
      alloc(count);

      // Logo colours: the mark has only four fills.
      logoColors = [];
      var colorIndex = {};
      var order = [];
      for (var i = 0; i < logoCount; i++) order.push(i);
      for (var s = order.length - 1; s > 0; s--) {
        var j = Math.floor(Math.random() * (s + 1));
        var tmp = order[s];
        order[s] = order[j];
        order[j] = tmp;
      }

      var minX = Infinity;
      var maxX = -Infinity;
      for (var t = 0; t < textCount; t++) {
        minX = Math.min(minX, text[t * 2]);
        maxX = Math.max(maxX, text[t * 2]);
      }
      var span = Math.max(1, maxX - minX);
      textColors = [];
      for (var b = 0; b < BUCKETS; b++) {
        var c = gradientAt(b / (BUCKETS - 1));
        textColors.push(c);
      }

      for (var p = 0; p < n; p++) {
        var li = order[p % logoCount];
        var jitter = p >= logoCount ? gap * 0.8 : 0;
        lx[p] = logo[li * 5] + (Math.random() - 0.5) * jitter;
        ly[p] = logo[li * 5 + 1] + (Math.random() - 0.5) * jitter;
        var key = logo[li * 5 + 2] + "," + logo[li * 5 + 3] + "," + logo[li * 5 + 4];
        if (colorIndex[key] === undefined) {
          colorIndex[key] = logoColors.length;
          logoColors.push([logo[li * 5 + 2], logo[li * 5 + 3], logo[li * 5 + 4]]);
        }
        lb[p] = colorIndex[key];

        if (textCount) {
          tx[p] = text[p * 2];
          ty[p] = text[p * 2 + 1];
          tb[p] = Math.round(((tx[p] - minX) / span) * (BUCKETS - 1));
        } else {
          tx[p] = lx[p];
          ty[p] = ly[p];
          tb[p] = 0;
        }

        size[p] = gap * (0.42 + Math.random() * 0.3);
        phase[p] = Math.random() * Math.PI * 2;
        sx[p] = (Math.random() - 0.5) * width * 0.5;
        sy[p] = 120 + Math.random() * height * 1.6;

        if (reduce) {
          x[p] = tx[p];
          y[p] = ty[p];
        } else if (old) {
          var o = p % old.n;
          x[p] = old.x[o];
          y[p] = old.y[o];
          vx[p] = old.vx[o];
          vy[p] = old.vy[o];
        } else if (introDone) {
          x[p] = tx[p];
          y[p] = ty[p];
        } else if (lateStart) {
          // The static mark has been on screen: start exactly on it.
          x[p] = lx[p];
          y[p] = ly[p];
        } else {
          x[p] = width / 2 + (Math.random() - 0.5) * width * 1.4;
          y[p] = height / 2 + (Math.random() - 0.5) * height * 2.2;
        }
      }

      // Group by colour pair so each frame changes fillStyle ~100 times, not n.
      var map = {};
      groups = [];
      for (var q = 0; q < n; q++) {
        var gk = lb[q] * BUCKETS + tb[q];
        if (map[gk] === undefined) {
          map[gk] = groups.length;
          groups.push({ l: lb[q], t: tb[q], idx: [] });
        }
        groups[map[gk]].idx.push(q);
      }
      for (var g = 0; g < groups.length; g++) groups[g].idx = Uint32Array.from(groups[g].idx);

      hasText = textCount > 0;
    }

    function shockwave(cx, cy, strength) {
      var radius = Math.max(220, width * 0.22);
      for (var i = 0; i < n; i++) {
        var dx = x[i] - cx;
        var dy = y[i] - cy;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d < radius) {
          var f = (1 - d / radius) * 34 * strength;
          vx[i] += (dx / d) * f;
          vy[i] += (dy / d) * f;
        }
      }
    }

    function resizeCanvas() {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function frame(now) {
      if (!running) return;
      step(now);
      raf(frame);
    }

    function step(now) {
      if (!n) return;
      if (startedAt < 0) startedAt = now;
      var t = now - startedAt;

      if (!introDone && hasText && t >= morphAt) {
        introDone = true;
        morphStart = t;
        shockwave(width / 2, height / 2, 1);
      }
      if (pendingShock && introDone) {
        shockwave(pendingShock.x, pendingShock.y, 1);
        pendingShock = null;
      }

      var blend = reduce ? 1 : introDone ? Math.min(1, (t - morphStart) / BLEND_MS) : 0;
      var sc = scatter * scatter;
      var radius = Math.max(70, width * 0.08);
      var r2 = radius * radius;
      var spring = introDone ? 0.018 : 0.012 + Math.min(1, t / 1200) * 0.012;

      if (!reduce) {
        var ta = t * 0.0011;
        var tbt = t * 0.0013;
        for (var i = 0; i < n; i++) {
          var hx = (introDone ? tx[i] : lx[i]) + Math.sin(ta + phase[i]) * 0.9 + sx[i] * sc;
          var hy = (introDone ? ty[i] : ly[i]) + Math.cos(tbt + phase[i]) * 0.9 - sy[i] * sc;
          var ax = vx[i] + (hx - x[i]) * spring;
          var ay = vy[i] + (hy - y[i]) * spring;
          if (pointer.active) {
            var dx = x[i] - pointer.x;
            var dy = y[i] - pointer.y;
            var d2 = dx * dx + dy * dy;
            if (d2 < r2) {
              var d = Math.sqrt(d2) || 1;
              var f = (1 - d / radius) * 7;
              ax += (dx / d) * f;
              ay += (dy / d) * f;
            }
          }
          ax *= 0.86;
          ay *= 0.86;
          vx[i] = ax;
          vy[i] = ay;
          x[i] += ax;
          y[i] += ay;
        }
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalAlpha = 1 - scatter * 0.6;
      for (var g = 0; g < groups.length; g++) {
        var grp = groups[g];
        var c0 = logoColors[grp.l];
        var c1 = hasText ? textColors[grp.t] : c0;
        ctx.fillStyle =
          "rgb(" +
          Math.round(c0[0] + (c1[0] - c0[0]) * blend) +
          "," +
          Math.round(c0[1] + (c1[1] - c0[1]) * blend) +
          "," +
          Math.round(c0[2] + (c1[2] - c0[2]) * blend) +
          ")";
        ctx.beginPath();
        var idx = grp.idx;
        for (var k = 0; k < idx.length; k++) {
          var p = idx[k];
          ctx.rect(x[p], y[p], size[p], size[p]);
        }
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!announced) {
        announced = true;
        send({ type: "started" });
      }
      if (debug) send({ type: "frame", t: now, morphed: introDone });
    }

    function start() {
      if (running || reduce || !visible || !n) return;
      running = true;
      raf(frame);
    }

    return function handle(msg) {
      switch (msg.type) {
        case "init":
          canvas = msg.canvas;
          ctx = canvas.getContext("2d");
          width = msg.width;
          height = msg.height;
          dpr = msg.dpr;
          reduce = msg.reduce;
          debug = !!msg.debug;
          lateStart = msg.lateStart;
          morphAt = lateStart ? MORPH_AT_LATE : MORPH_AT_FAST;
          introDone = reduce;
          resizeCanvas();
          setTargets(msg.logo, msg.text, msg.gap);
          if (lateStart && !reduce) shockwave(width / 2, height / 2, 0.35);
          if (reduce) {
            if (msg.text) step(0);
          } else start();
          break;
        case "text":
          setTargets(msg.logo, msg.text, msg.gap);
          if (reduce) step(0);
          break;
        case "resize":
          width = msg.width;
          height = msg.height;
          dpr = msg.dpr;
          resizeCanvas();
          setTargets(msg.logo, msg.text, msg.gap);
          if (reduce) step(0);
          break;
        case "pointer":
          pointer.x = msg.x;
          pointer.y = msg.y;
          pointer.active = msg.active;
          break;
        case "down":
          if (!reduce) pendingShock = { x: msg.x, y: msg.y };
          break;
        case "scroll":
          scatter = reduce ? 0 : msg.scatter;
          break;
        case "visible":
          visible = msg.visible;
          if (visible) start();
          else running = false;
          break;
      }
    };
  }

  // ---------------------------------------------------------------------------
  // Main-thread bootstrap: measure, sample shapes, forward input.
  // ---------------------------------------------------------------------------
  var MARK = [
    ["M0 21 L35 1 L35 41 Z", "#8c52ff"],
    ["M0 50 L35 30 L35 70 Z", "#e2a9f1"],
    ["M0 79 L35 59 L35 99 Z", "#ff66c4"],
    ["M41.5 1 H44.5 V99 H41.5 Z", "#ffffff"],
  ];
  var LATE_START_MS = 900;

  function boot() {
    var canvas = document.getElementById("hero-particles");
    if (!canvas || window.__aomHeroBooted) return;
    // This script can run before the stylesheet is applied; measuring then
    // would give the default 300×150 canvas. Wait (briefly) for real layout.
    if (getComputedStyle(canvas).position !== "absolute" && (boot.tries = (boot.tries || 0) + 1) < 150) {
      setTimeout(boot, 20);
      return;
    }
    window.__aomHeroBooted = true;
    if (Array.isArray(window.__aomHeroDebug)) window.__aomHeroBootAt = Math.round(performance.now());
    var mark = document.getElementById("hero-mark");

    var text = canvas.getAttribute("data-text") || "AOM";
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var lateStart = performance.now() > LATE_START_MS;
    var family = getComputedStyle(canvas).fontFamily;
    var fontReady = false;

    function measure() {
      var r = canvas.getBoundingClientRect();
      var w = r.width;
      return {
        width: w,
        height: r.height,
        dpr: Math.min(window.devicePixelRatio || 1, 2),
        gap: w < 640 ? 4 : 6,
      };
    }

    function raster(w, h, draw) {
      var off = document.createElement("canvas");
      off.width = Math.max(1, Math.ceil(w));
      off.height = Math.max(1, Math.ceil(h));
      var c = off.getContext("2d", { willReadFrequently: true });
      draw(c);
      return { data: c.getImageData(0, 0, off.width, off.height).data, w: off.width, h: off.height };
    }

    function sampleLogo(m) {
      var gap = Math.max(3, m.gap - 2);
      var img = raster(m.width, m.height, function (c) {
        var scale = (m.height * 0.86) / 100;
        c.translate(m.width / 2 - 23 * scale, m.height * 0.07);
        c.scale(scale, scale);
        for (var i = 0; i < MARK.length; i++) {
          c.fillStyle = MARK[i][1];
          c.fill(new Path2D(MARK[i][0]));
        }
      });
      var out = [];
      for (var yy = 0; yy < img.h; yy += gap) {
        for (var xx = 0; xx < img.w; xx += gap) {
          var i = (yy * img.w + xx) * 4;
          if (img.data[i + 3] > 128) out.push(xx, yy, img.data[i], img.data[i + 1], img.data[i + 2]);
        }
      }
      return new Float32Array(out);
    }

    function sampleText(m) {
      var img = raster(m.width, m.height, function (c) {
        var size = m.height * 0.95;
        c.font = "600 " + size + "px " + family;
        var measured = c.measureText(text).width;
        if (measured > m.width * 0.94) size *= (m.width * 0.94) / measured;
        c.font = "600 " + size + "px " + family;
        c.textAlign = "center";
        c.textBaseline = "middle";
        c.fillStyle = "#fff";
        c.fillText(text, m.width / 2, m.height / 2 + size * 0.04);
      });
      var out = [];
      for (var yy = 0; yy < img.h; yy += m.gap) {
        for (var xx = 0; xx < img.w; xx += m.gap) {
          if (img.data[(yy * img.w + xx) * 4 + 3] > 128) out.push(xx, yy);
        }
      }
      return new Float32Array(out);
    }

    // Transport: worker if possible, otherwise the same engine in-page.
    var post;
    var onStarted = function () {
      if (mark) mark.classList.add("hero-mark-out");
    };
    // Test hook: set window.__aomHeroDebug = [] before load to record frames.
    var debugLog = Array.isArray(window.__aomHeroDebug) ? window.__aomHeroDebug : null;
    var onMessage = function (m) {
      if (m.type === "started") onStarted();
      else if (m.type === "frame" && debugLog) debugLog.push([Math.round(performance.now()), m.morphed, m.t]);
    };
    var useWorker =
      typeof Worker === "function" &&
      typeof OffscreenCanvas === "function" &&
      typeof canvas.transferControlToOffscreen === "function";
    var target = canvas;

    if (useWorker) {
      try {
        var src =
          "var handle=(" +
          engine.toString() +
          ")(function(m){postMessage(m)});onmessage=function(e){handle(e.data)};";
        var worker = new Worker(URL.createObjectURL(new Blob([src], { type: "text/javascript" })));
        worker.onmessage = function (e) {
          if (e.data) onMessage(e.data);
        };
        target = canvas.transferControlToOffscreen();
        post = function (msg, transfer) {
          worker.postMessage(msg, transfer || []);
        };
      } catch {
        useWorker = false;
      }
    }
    if (!useWorker) {
      var local = engine(onMessage);
      post = function (msg) {
        local(msg);
      };
    }

    var m = measure();
    if (!m.width || !m.height) return;
    var last = { w: m.width, h: m.height };

    // Start straight away with the logo; the wordmark follows once the font is in.
    var initLogo = sampleLogo(m);
    post(
      {
        type: "init",
        canvas: target,
        width: m.width,
        height: m.height,
        dpr: m.dpr,
        gap: m.gap,
        reduce: reduce,
        debug: !!debugLog,
        lateStart: lateStart,
        logo: initLogo,
        text: null,
      },
      useWorker ? [target] : []
    );
    post({ type: "scroll", scatter: Math.min(1, window.scrollY / Math.max(1, window.innerHeight)) });

    function withText() {
      var mm = measure();
      post({ type: "text", logo: sampleLogo(mm), text: sampleText(mm), gap: mm.gap });
      if (reduce) onStarted();
    }

    var fontTimeout = new Promise(function (resolve) {
      setTimeout(resolve, 2500);
    });
    var fontLoad = document.fonts && document.fonts.load ? document.fonts.load("600 100px " + family) : Promise.resolve();
    Promise.race([fontLoad, fontTimeout]).then(function () {
      fontReady = true;
      withText();
    });

    // Rebuild when the hero changes size (font swap, rotation, window resize).
    if (typeof ResizeObserver === "function") {
      new ResizeObserver(function () {
        var mm = measure();
        if (!mm.width || !mm.height) return;
        if (Math.abs(mm.width - last.w) < 2 && Math.abs(mm.height - last.h) < 2) return;
        last = { w: mm.width, h: mm.height };
        post({
          type: "resize",
          width: mm.width,
          height: mm.height,
          dpr: mm.dpr,
          gap: mm.gap,
          logo: sampleLogo(mm),
          text: fontReady ? sampleText(mm) : null,
        });
      }).observe(canvas);
    }

    // Input forwarding.
    function local(e) {
      var r = canvas.getBoundingClientRect();
      var px = e.clientX - r.left;
      var py = e.clientY - r.top;
      return { x: px, y: py, active: py > -40 && py < r.height + 40 };
    }
    window.addEventListener(
      "pointermove",
      function (e) {
        var p = local(e);
        post({ type: "pointer", x: p.x, y: p.y, active: p.active });
      },
      { passive: true }
    );
    window.addEventListener(
      "pointerdown",
      function (e) {
        var p = local(e);
        post({ type: "pointer", x: p.x, y: p.y, active: p.active });
        if (p.active) post({ type: "down", x: p.x, y: p.y });
      },
      { passive: true }
    );
    window.addEventListener("pointerup", function (e) {
      if (e.pointerType === "touch") post({ type: "pointer", x: -9999, y: -9999, active: false });
    });
    document.addEventListener("pointerleave", function () {
      post({ type: "pointer", x: -9999, y: -9999, active: false });
    });

    var scrollQueued = false;
    window.addEventListener(
      "scroll",
      function () {
        if (scrollQueued) return;
        scrollQueued = true;
        requestAnimationFrame(function () {
          scrollQueued = false;
          post({ type: "scroll", scatter: Math.min(1, window.scrollY / Math.max(1, window.innerHeight)) });
        });
      },
      { passive: true }
    );

    // Pause when off screen or in a background tab.
    var onScreen = true;
    function updateVisible() {
      post({ type: "visible", visible: onScreen && !document.hidden });
    }
    if (typeof IntersectionObserver === "function") {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        updateVisible();
      }).observe(canvas);
    }
    document.addEventListener("visibilitychange", updateVisible);
  }

  if (document.getElementById("hero-particles")) boot();
  else document.addEventListener("DOMContentLoaded", boot);
})();
