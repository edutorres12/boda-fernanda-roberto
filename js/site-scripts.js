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
});
