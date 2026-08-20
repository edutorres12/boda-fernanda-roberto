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
    // Arranque de la ceremonia religiosa, que es el primer evento del dia.
    var deadline = '2026/10/18 17:00';

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
      // La referencia es scroll-padding-left, no el offsetLeft de la primera
      // tarjeta: el navegador ancla el snap al scroll-padding y en estos
      // scrollers no coincide con el padding normal (24px contra 20px en móvil).
      // Con esos 4px de desfase el ancla calculada caía delante del punto donde
      // el snap deja la tarjeta, así que la flecha volvía a apuntar a la tarjeta
      // en la que ya estaba: avanzaba los 4px, el snap la devolvía y el carrusel
      // se quedaba clavado sin poder llegar a la siguiente. Se lee del estilo
      // calculado para que siga bien si cambian los valores por breakpoint.
      function anchors() {
        var items = scroller.querySelectorAll('.recm__item');
        if (!items.length) return [0];
        var base = parseFloat(getComputedStyle(scroller).scrollPaddingLeft) || 0;
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
      var destino = null;
      var quieto = window.matchMedia('(prefers-reduced-motion: reduce)');

      function recuperarSnap() {
        scroller.style.scrollSnapType = '';
      }

      function terminar() {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
        clearTimeout(fallback);
        fallback = null;
        destino = null;
        recuperarSnap();
      }

      function animarHasta(target) {
        if (raf) cancelAnimationFrame(raf);
        raf = null;
        clearTimeout(fallback);
        fallback = null;

        var desde = scroller.scrollLeft;
        var delta = target - desde;
        if (Math.abs(delta) < 1 || quieto.matches) {
          scroller.scrollLeft = target;
          terminar();
          sync();
          return;
        }

        var inicio = null;
        destino = target;
        // El snap pelearía contra cada fotograma; se restaura al terminar.
        scroller.style.scrollSnapType = 'none';
        // Red de seguridad: si los fotogramas no llegan (pestaña en segundo
        // plano), se cierra el salto igual y no se queda el snap desactivado.
        fallback = setTimeout(function () {
          if (!raf) return;
          scroller.scrollLeft = target;
          terminar();
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
            scroller.scrollLeft = target;
            terminar();
            sync();
          }
        });
      }

      // Corta el salto pero deja el snap fuera hasta que el dedo se levanta:
      // devolverlo con el gesto en curso hace que el navegador tire del carrusel
      // al anclaje más cercano, que suele ser la tarjeta de la que venía.
      function cortarAnimacion() {
        if (!raf) return;
        cancelAnimationFrame(raf);
        raf = null;
        clearTimeout(fallback);
        fallback = null;
        destino = null;
      }

      scroller.addEventListener('wheel', function () {
        cortarAnimacion();
        recuperarSnap();
      }, { passive: true });
      scroller.addEventListener('touchstart', cortarAnimacion, { passive: true });
      scroller.addEventListener('touchend', recuperarSnap, { passive: true });
      scroller.addEventListener('touchcancel', recuperarSnap, { passive: true });

      // El punto de partida es el destino pendiente, no el scroll de este
      // instante: si no, un segundo toque durante los 420ms de la animación
      // vuelve a apuntar a la tarjeta hacia la que ya se iba y parece ignorado.
      function go(dir) {
        var pts = anchors();
        var at = destino !== null ? destino : scroller.scrollLeft;
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

        if (prev) prev.disabled = !overflows || at <= 2;
        if (next) next.disabled = !overflows || at >= max - 2;

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

  // ===== COPIAR NUMEROS (tarjeta de transferencia y evento de la mesa) =====
  (function () {
    var botones = document.querySelectorAll('[data-copiar]');
    if (!botones.length) return;

    var estado = document.getElementById('copiar-estado');
    var DURACION_AVISO = 1800;

    // execCommand es el plan B para contextos donde la Clipboard API no existe
    // (http plano, WebViews viejas de apps de mensajeria). Es justo por donde
    // llegan muchos invitados, asi que conviene no dejarlos sin copiar.
    function copiarTexto(texto) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(texto);
      }

      return new Promise(function (resolve, reject) {
        var campo = document.createElement('textarea');
        campo.value = texto;
        campo.setAttribute('readonly', '');
        campo.style.cssText = 'position:fixed;top:-1000px;opacity:0';
        document.body.appendChild(campo);
        campo.select();

        var copiado = false;
        try {
          copiado = document.execCommand('copy');
        } catch (e) {
          copiado = false;
        }

        document.body.removeChild(campo);
        if (copiado) resolve(); else reject();
      });
    }

    // Si no se pudo copiar, al menos dejamos el numero seleccionado para que el
    // invitado solo tenga que hacer "copiar" desde el menu del navegador.
    function seleccionar(boton) {
      var valor = boton.querySelector('.copiar__valor');
      if (!valor || !window.getSelection || !document.createRange) return;
      var rango = document.createRange();
      rango.selectNodeContents(valor);
      var seleccion = window.getSelection();
      seleccion.removeAllRanges();
      seleccion.addRange(rango);
    }

    Array.prototype.forEach.call(botones, function (boton) {
      var temporizador = null;

      boton.addEventListener('click', function () {
        copiarTexto(boton.getAttribute('data-copiar')).then(function () {
          boton.classList.add('is-copiado');
          if (estado) estado.textContent = 'Copiado: ' + boton.getAttribute('data-copiar');

          clearTimeout(temporizador);
          temporizador = setTimeout(function () {
            boton.classList.remove('is-copiado');
            if (estado) estado.textContent = '';
          }, DURACION_AVISO);
        }).catch(function () {
          seleccionar(boton);
        });
      });
    });
  })();
});
