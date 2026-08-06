// Loader, Music Player, and Countdown functionality
document.addEventListener("DOMContentLoaded", function () {
  // ===== LOADER FUNCTIONALITY =====
  const loader = document.getElementById("section-loader");
  const html = document.documentElement;
  const body = document.body;
  const audio = document.getElementById("my-audio");
  const musicButton = document.getElementById("music-play");
  let loaderClosed = false;

  // Check if loader is disabled (has hidden class or display:none)
  const loaderDisabled = loader && (
    loader.classList.contains("hidden") ||
    window.getComputedStyle(loader).display === "none"
  );

  // Only activate loader if it exists and is not disabled
  if (loader && !loaderDisabled) {
    // Add initial classes
    html.classList.add("weddeb-loader-active");
    body.classList.add("weddeb-loader-active");
    loader.classList.add("weddeb-loader--overlay");
  } else {
    // Loader is disabled, mark as closed to skip functionality
    loaderClosed = true;
  }

  // Keep loader visible until manually closed
  const keepLoaderVisible = setInterval(function () {
    if (loaderClosed) {
      clearInterval(keepLoaderVisible);
      return;
    }

    // Maintain classes only if not closed
    if (loader && !loader.classList.contains("weddeb-loader--overlay")) {
      loader.classList.add("weddeb-loader--overlay");
    }
    if (!html.classList.contains("weddeb-loader-active")) {
      html.classList.add("weddeb-loader-active");
    }
    if (!body.classList.contains("weddeb-loader-active")) {
      body.classList.add("weddeb-loader-active");
    }
  }, 100);

  // Function to close the loader
  function closeLoader(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    loaderClosed = true;
    clearInterval(keepLoaderVisible);

    loader.style.transition = "opacity 0.3s ease";
    loader.style.opacity = "0";

    // Play music when loader closes (only if audio exists and has a valid source)
    if (audio) {
      var audioSource = audio.querySelector('source');
      var hasSrc = audioSource && audioSource.src && audioSource.src.trim() !== '';

      if (hasSrc) {
        audio.play().then(function () {
          if (musicButton) {
            musicButton.classList.add("is-playing");
          }
        }).catch(function (err) {
          console.log("Audio autoplay prevented:", err);
        });
      }
    }

    setTimeout(function () {
      html.classList.remove("weddeb-loader-active");
      body.classList.remove("weddeb-loader-active");
      loader.classList.remove("weddeb-loader--overlay");
      loader.style.display = "none";
      loader.style.pointerEvents = "none";
      body.style.overflow = "";
      body.style.height = "";
    }, 300);
  }

  // Add listeners to the loader button
  const playButton = document.querySelector("#play-button");
  if (playButton) {
    playButton.addEventListener("click", closeLoader);
  }

  // ===== MUSIC PLAYER FUNCTIONALITY =====
  if (musicButton && audio) {
    musicButton.addEventListener("click", function (e) {
      e.preventDefault();

      if (audio.paused) {
        audio.play();
        musicButton.classList.add("is-playing");
      } else {
        audio.pause();
        musicButton.classList.remove("is-playing");
      }
    });
  }

  // ===== COUNTDOWN TIMER FUNCTIONALITY =====
  (function () {
    var deadline = '2026/10/10 19:00';

    function pad(num, size) {
      var s = "0" + num;
      return s.substr(s.length - size);
    }

    function parseDate(date) {
      const parsed = Date.parse(date);
      if (!isNaN(parsed)) return parsed;
      return Date.parse(date.replace(/-/g, '/').replace(/[a-z]+/gi, ' '));
    }

    function getTimeRemaining(endtime) {
      let total = parseDate(endtime) - Date.parse(new Date());
      let seconds = Math.floor((total / 1000) % 60);
      let minutes = Math.floor((total / 1000 / 60) % 60);
      let hours = Math.floor((total / (1000 * 60 * 60)) % 24);
      let days = Math.floor(total / (1000 * 60 * 60 * 24));
      return { total, days, hours, minutes, seconds };
    }

    function initCountdown(id, endtime) {
      let days = document.getElementById(id + '-days');
      let hours = document.getElementById(id + '-hours');
      let minutes = document.getElementById(id + '-minutes');
      let seconds = document.getElementById(id + '-seconds');

      if (!days || !hours || !minutes || !seconds) return;

      // Set initial values immediately
      var time = getTimeRemaining(endtime);
      days.innerHTML = time.days;
      hours.innerHTML = pad(time.hours, 2);
      minutes.innerHTML = pad(time.minutes, 2);
      seconds.innerHTML = pad(time.seconds, 2);

      // Update every second
      var timeinterval = setInterval(function () {
        var time = getTimeRemaining(endtime);
        if (time.total <= 0) {
          clearInterval(timeinterval);
        } else {
          days.innerHTML = time.days;
          hours.innerHTML = pad(time.hours, 2);
          minutes.innerHTML = pad(time.minutes, 2);
          seconds.innerHTML = pad(time.seconds, 2);
        }
      }, 1000);
    }

    initCountdown('js-clock', deadline);
  })();

  // ===== REC SECTIONS REVEAL ON SCROLL =====
  (function () {
    var grids = document.querySelectorAll('.recm__scroller-wrap, .reveal-up');
    if (!grids.length) return;

    if (!('IntersectionObserver' in window)) {
      grids.forEach(function (g) { g.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    grids.forEach(function (g) { observer.observe(g); });
  })();

  // ===== REC SCROLLERS — slider horizontal =====
  // El CSS ya convierte .recm__scroller en carrusel por debajo de 992px. Este
  // script solo aporta lo que el CSS no puede saber: si el contenido desborda
  // (para mostrar flechas y barra de progreso) y en qué punto del recorrido va.
  (function () {
    var wraps = document.querySelectorAll('.recm__scroller-wrap');
    if (!wraps.length) return;

    wraps.forEach(function (wrap) {
      var scroller = wrap.querySelector('.recm__scroller');
      if (!scroller) return;

      var prev = wrap.querySelector('.recm__nav--prev');
      var next = wrap.querySelector('.recm__nav--next');
      var progress = wrap.querySelector('.recm__progress');
      var bar = wrap.querySelector('.recm__progress-bar');
      var ticking = false;

      // Posición de scroll que deja cada tarjeta alineada al inicio. Se navega
      // saltando a estas posiciones y no con un desplazamiento relativo: como el
      // track tiene scroll-snap, un scrollBy que caiga entre dos anclajes puede
      // rebotar a la tarjeta anterior.
      function anchors() {
        var items = scroller.querySelectorAll('.recm__item');
        if (!items.length) return [0];
        var base = items[0].offsetLeft;
        var max = scroller.scrollWidth - scroller.clientWidth;
        return [].map.call(items, function (el) {
          return Math.max(0, Math.min(el.offsetLeft - base, max));
        });
      }

      // Animación propia en vez de scrollTo({behavior:'smooth'}): el scroll suave
      // nativo no llega a Safari antiguo y en un contenedor con scroll-snap el
      // navegador puede cancelarlo a mitad de camino.
      var raf = null;
      var fallback = null;
      var quieto = window.matchMedia('(prefers-reduced-motion: reduce)');

      function animarHasta(target) {
        if (raf) cancelAnimationFrame(raf);
        var desde = scroller.scrollLeft;
        var delta = target - desde;
        if (Math.abs(delta) < 1) return;
        if (quieto.matches) { scroller.scrollLeft = target; return; }

        var inicio = null;
        // El snap pelearía contra cada fotograma; se restaura al terminar.
        scroller.style.scrollSnapType = 'none';
        // Red de seguridad: si los fotogramas no llegan (pestaña en segundo
        // plano), se cierra el salto igual y no se queda el snap desactivado.
        clearTimeout(fallback);
        fallback = setTimeout(function () {
          if (!raf) return;
          cancelAnimationFrame(raf);
          raf = null;
          scroller.scrollLeft = target;
          scroller.style.scrollSnapType = '';
          sync();
        }, 1200);
        raf = requestAnimationFrame(function paso(ts) {
          if (inicio === null) inicio = ts;
          var p = Math.min(1, (ts - inicio) / 420);
          var e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          scroller.scrollLeft = desde + delta * e;
          if (p < 1) {
            raf = requestAnimationFrame(paso);
          } else {
            raf = null;
            clearTimeout(fallback);
            scroller.style.scrollSnapType = '';
            sync();
          }
        });
      }

      function cortarAnimacion() {
        if (!raf) return;
        cancelAnimationFrame(raf);
        raf = null;
        clearTimeout(fallback);
        scroller.style.scrollSnapType = '';
      }

      scroller.addEventListener('wheel', cortarAnimacion, { passive: true });
      scroller.addEventListener('touchstart', cortarAnimacion, { passive: true });

      function go(dir) {
        var pts = anchors();
        var at = scroller.scrollLeft;
        var target = dir > 0
          ? pts.filter(function (p) { return p > at + 1; })[0]
          : pts.filter(function (p) { return p < at - 1; }).pop();
        if (target === undefined) target = dir > 0 ? pts[pts.length - 1] : 0;
        animarHasta(target);
      }

      function sync() {
        var max = scroller.scrollWidth - scroller.clientWidth;
        var overflows = max > 1;
        var at = scroller.scrollLeft;

        wrap.classList.toggle('is-slider', overflows);
        wrap.classList.toggle('has-overflow', overflows);
        if (progress) progress.classList.toggle('has-overflow', overflows);

        if (prev) prev.disabled = !overflows || at <= 1;
        if (next) next.disabled = !overflows || at >= max - 1;

        if (bar && overflows) {
          bar.style.width = (scroller.clientWidth / scroller.scrollWidth * 100) + '%';
          bar.style.left = (at / scroller.scrollWidth * 100) + '%';
        }
      }

      function syncThrottled() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          sync();
        });
      }

      scroller.addEventListener('scroll', syncThrottled, { passive: true });
      window.addEventListener('resize', syncThrottled);
      window.addEventListener('load', sync);

      // Las imágenes son lazy: al cargarse cambian la altura, no el ancho, pero
      // el ResizeObserver también cubre el giro de pantalla y el zoom del navegador.
      if ('ResizeObserver' in window) {
        new ResizeObserver(syncThrottled).observe(scroller);
      }

      if (prev) prev.addEventListener('click', function () { go(-1); });
      if (next) next.addEventListener('click', function () { go(1); });

      // Arrastrar con el ratón (en táctil el scroll nativo ya lo resuelve)
      if (window.matchMedia('(pointer: fine)').matches) {
        var dragging = false;
        var startX = 0;
        var startScroll = 0;
        var moved = 0;

        scroller.addEventListener('pointerdown', function (e) {
          if (e.button !== 0 || !wrap.classList.contains('is-slider')) return;
          cortarAnimacion();
          dragging = true;
          moved = 0;
          startX = e.clientX;
          startScroll = scroller.scrollLeft;
          scroller.classList.add('is-grabbing');
        });

        scroller.addEventListener('pointermove', function (e) {
          if (!dragging) return;
          var dx = e.clientX - startX;
          if (Math.abs(dx) > moved) moved = Math.abs(dx);
          // Captura el puntero solo cuando ya es un arrastre real, para no
          // robarle el click a los botones "Reservar" de las tarjetas.
          if (moved > 4 && !scroller.hasPointerCapture(e.pointerId)) {
            scroller.setPointerCapture(e.pointerId);
          }
          scroller.scrollLeft = startScroll - dx;
        });

        function endDrag(e) {
          if (!dragging) return;
          dragging = false;
          scroller.classList.remove('is-grabbing');
          if (scroller.hasPointerCapture(e.pointerId)) {
            scroller.releasePointerCapture(e.pointerId);
          }
        }

        scroller.addEventListener('pointerup', endDrag);
        scroller.addEventListener('pointercancel', endDrag);

        // Tras arrastrar, anula el click que el navegador dispara al soltar
        scroller.addEventListener('click', function (e) {
          if (moved > 4) {
            e.preventDefault();
            e.stopPropagation();
            moved = 0;
          }
        }, true);
      }

      sync();
    });
  })();

  // ===== GALERÍA PRINCIPAL — columnas ligadas al scroll =====
  // Sustituye la interacción de Webflow (el data-w-id del contenedor se retiró
  // del HTML). Aquella aplicaba el desplazamiento con un suavizado tan largo
  // (90 en desktop) que las columnas iban a remolque del scroll y se sentían
  // trabadas. Aquí el objetivo se calcula directo del progreso de la sección y
  // un lerp corto lo alcanza en pocos fotogramas: mismo recorrido, movimiento
  // pegado a la rueda o al dedo.
  (function () {
    var container = document.querySelector('.section-gallery .container-slider');
    if (!container) return;

    var quieto = window.matchMedia('(prefers-reduced-motion: reduce)');
    var movil = window.matchMedia('(max-width: 767px)');

    // Mismos recorridos que definía la interacción original: desktop en % de la
    // altura de la propia columna, móvil en vh.
    var RECORRIDOS = {
      desktop: { top: [10, -45, '%'], bottom: [-60.2, -23.6, '%'] },
      movil: { top: [16, -80, 'vh'], bottom: [-122.6, -22, 'vh'] }
    };

    var grid = null;      // el .gallery-images visible en este ancho
    var cols = [];        // {el, desde, hasta, unidad, actual}
    var rafId = null;
    var visible = false;

    function medir() {
      grid = null;
      cols = [];
      var grids = container.querySelectorAll('.gallery-images');
      for (var i = 0; i < grids.length; i++) {
        if (grids[i].offsetParent !== null) { grid = grids[i]; break; }
      }
      if (!grid) return;
      var cfg = movil.matches ? RECORRIDOS.movil : RECORRIDOS.desktop;
      [].forEach.call(grid.querySelectorAll('.gallery-column'), function (col) {
        var r = col.classList.contains('botom-top') ? cfg.bottom : cfg.top;
        cols.push({ el: col, desde: r[0], hasta: r[1], unidad: r[2], actual: null });
      });
    }

    // 0 cuando la retícula se fija al borde superior; 1 cuando el contenedor se
    // ha recorrido entero y la retícula se suelta. El clamp deja las columnas en
    // sus posiciones extremas antes y después, así la sección entra y sale sin
    // saltos.
    function progreso() {
      var rect = container.getBoundingClientRect();
      var total = rect.height - grid.offsetHeight;
      if (total <= 0) return 0;
      return Math.min(1, Math.max(0, -rect.top / total));
    }

    function fotograma() {
      rafId = null;
      if (!grid || !cols.length) return;
      var p = progreso();
      var enReposo = true;
      cols.forEach(function (col) {
        var objetivo = col.desde + (col.hasta - col.desde) * p;
        if (col.actual === null) col.actual = objetivo; // primer frame sin salto
        var delta = objetivo - col.actual;
        if (Math.abs(delta) > 0.02) enReposo = false;
        col.actual += delta * 0.16;
        col.el.style.transform = 'translate3d(0,' + col.actual.toFixed(3) + col.unidad + ',0)';
      });
      // Mientras la sección esté a la vista el bucle sigue (el scroll cambia el
      // objetivo en cualquier momento); fuera de vista se apaga en cuanto las
      // columnas alcanzan su posición.
      if (visible || !enReposo) rafId = requestAnimationFrame(fotograma);
    }

    function arrancar() {
      if (quieto.matches || rafId !== null) return;
      rafId = requestAnimationFrame(fotograma);
    }

    function reiniciar() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      cols.forEach(function (col) { col.el.style.transform = ''; });
      medir();
      if (quieto.matches) return; // sin movimiento: columnas en su sitio natural
      arrancar();
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) arrancar();
      }, { rootMargin: '100px 0px' }).observe(container);
    } else {
      visible = true;
    }

    window.addEventListener('scroll', arrancar, { passive: true });
    window.addEventListener('resize', reiniciar);
    window.addEventListener('orientationchange', reiniciar);
    if (movil.addEventListener) movil.addEventListener('change', reiniciar);
    if (quieto.addEventListener) quieto.addEventListener('change', reiniciar);

    medir();
    arrancar();
  })();
});
