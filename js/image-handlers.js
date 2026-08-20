// Image progressive loading — replaces inline onload/onerror handlers (CSP-safe)
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    // Brand logo in header
    document.querySelectorAll('img.brand-logo').forEach(function (img) {
      var fallback = img.nextElementSibling;
      if (img.complete) {
        img.hidden = false;
        img.style.display = 'block';
        if (fallback) fallback.hidden = true;
      } else {
        img.addEventListener('load', function () {
          img.hidden = false;
          img.style.display = 'block';
          if (fallback) fallback.hidden = true;
        });
        img.addEventListener('error', function () {
          img.hidden = true;
          img.style.display = 'none';
          if (fallback) fallback.hidden = false;
        });
      }
    });

    // Footer logo
    document.querySelectorAll('.footer-logo img').forEach(function (img) {
      var fallback = img.previousElementSibling;
      if (img.complete) {
        img.hidden = false;
        if (fallback) fallback.hidden = true;
      } else {
        img.addEventListener('load', function () {
          img.hidden = false;
          if (fallback) fallback.hidden = true;
        });
        img.addEventListener('error', function () {
          img.hidden = true;
          if (fallback) fallback.hidden = false;
        });
      }
    });

    // Announcement images
    document.querySelectorAll('.announcement-bar img, .announce-img').forEach(function (img) {
      var prev = img.previousElementSibling;
      if (img.complete) {
        img.hidden = false;
        if (prev) prev.hidden = true;
      } else {
        img.addEventListener('load', function () {
          img.hidden = false;
          if (prev) prev.hidden = true;
        });
        img.addEventListener('error', function () {
          img.hidden = true;
          if (prev) prev.hidden = false;
        });
      }
    });
  });
})();
