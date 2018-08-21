var decky = (function () {
  var body = document.body;
  var slides = arr(document.querySelectorAll('section'));
  var numSlides = slides.length;
  var current = 0;
  var currentSlide = slides[current-1];
  var subSlide = 0;

  var api = {
    onSlideChange: function () {},
    num: numSlides
  };

  function arr(o, offset) {
    return Array.prototype.slice.call(o, offset || 0);
  }

  slides.forEach(function (slide, i) {
    slide.setAttribute('id', i + 1);
  });

  // body.addEventListener('click', function (e) {
  //   if (e.target.href) {
  //     return;
  //   } else {
  //     nextSlide();
  //   }
  // });

  document.addEventListener('keydown', function (e) {
    if (!(e.metaKey || e.shiftKey || e.ctrlKey || e.altKey)) {
      switch (e.which) {
        case 37:
        case 38:
          prevSlide();
          e.preventDefault();
          break;
        case 32:
        case 39:
        case 40:
          nextSlide();
          e.preventDefault();
          break;
      }
    }
  });

  function prevSlide() {
    gotoSlide(current - 1);
  }
  api.prev = prevSlide;

  function nextSlide() {
    subSlide++;
    var subSlideEl = arr(currentSlide.querySelectorAll('[sub]'))[subSlide-1];
    if (subSlideEl) {
      subSlideEl.style.visibility = 'visible';
    } else {
      gotoSlide(current + 1);
    }
  }
  api.next = nextSlide;

  function gotoSlide(n, notified) {
    // clamp value to slide range
    n = Math.max(1, Math.min(slides.length, n));
    // are we actually changing slides?
    if (n === current) {
      return;
    }
    current = n;
    currentSlide = slides[current - 1];

    subSlide = 0;
    window.location.hash = "#" + n;

    arr(currentSlide.querySelectorAll('[sub]')).forEach(function (s) {
      s.style.visibility = 'hidden';
    });

    slides.forEach(function (slide) {
      if (slide === currentSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    api.onSlideChange(current);
    if (!notified && speaker) {
      speaker.postMessage({type: 'goto', num: current});
      if (window.top !== window) {
        window.top.postMessage({
          type: 'goto', num: current
        }, '*');
      }
    }
  }

  function toggleFullScreen() {
    if (window.fullScreen) {
      body.mozCancelFullScreen();
    } else {
      body.mozRequestFullScreen();
    }
  }
  api.fullScreen = toggleFullScreen;

  if ('BroadcastChannel' in window) {
    var speaker = new BroadcastChannel("speaker");

    if (window.top === window) {
      speaker.onmessage = handleMessage;
    }
    window.onmessage = handleMessage;
  }


  function handleMessage(event) {
    var msg = event.data;
    if (msg.type === 'goto') {
      gotoSlide(msg.num, true);
    }
    if (msg.type === 'next') {
      nextSlide();
    }
    if (msg.type === 'prev') {
      prevSlide();
    }
  }

  window.addEventListener('hashchange', function(e) {
    e.preventDefault();
    var newSlide = parseInt(window.location.hash.substr(1), 10);
    gotoSlide(newSlide);
  });

  window.addEventListener("DOMContentLoaded", function() {
      var menu = document.createElement('menu');
      menu.setAttribute('id', 'fsmenu');
      menu.setAttribute('type', 'context');

      var item = document.createElement('menuitem');
      item.setAttribute('label', 'Fullscreen');
      item.addEventListener('click', toggleFullScreen);
      menu.appendChild(item);

      body.appendChild(menu);
      body.setAttribute('contextmenu', 'fsmenu');
  });

  gotoSlide(parseInt(window.location.hash.substr(1), 10) || 1);
  window.addEventListener('load', function () {
    api.onSlideChange(current);
  });

  return api;

})();
