window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}

function setupSynchronizedDemoVideos() {
  var cards = Array.from(document.querySelectorAll('.demo-video-card[data-demo-pair]'));
  var pairs = {};

  cards.forEach(function(card) {
    var pairName = card.getAttribute('data-demo-pair');
    var video = card.querySelector('video');
    if (!video) {
      return;
    }

    pairs[pairName] = pairs[pairName] || {};
    if (video.classList.contains('baseline-video')) {
      pairs[pairName].baseline = { card: card, video: video, ended: false };
    }
    if (video.classList.contains('block-video')) {
      pairs[pairName].block = { card: card, video: video, ended: false };
    }
  });

  Object.keys(pairs).forEach(function(pairName) {
    var pair = pairs[pairName];
    if (!pair.baseline || !pair.block) {
      return;
    }

    var resetTimer = null;
    var items = [pair.baseline, pair.block];

    function playItem(item) {
      item.video.playbackRate = 3;
      var playPromise = item.video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function() {});
      }
    }

    function resetPair() {
      clearTimeout(resetTimer);
      resetTimer = null;
      items.forEach(function(item) {
        item.ended = false;
        item.card.classList.remove('is-finished');
        item.video.currentTime = 0;
        playItem(item);
      });
    }

    function markFinished(item) {
      if (item.ended) {
        return;
      }

      item.ended = true;
      item.card.classList.add('is-finished');
      item.video.pause();

      if (pair.baseline.ended && pair.block.ended && !resetTimer) {
        resetTimer = setTimeout(resetPair, 1000);
      }
    }

    items.forEach(function(item) {
      item.video.loop = false;
      item.video.muted = true;
      item.video.playbackRate = 3;
      item.video.addEventListener('loadedmetadata', function() {
        item.video.playbackRate = 3;
      });
      item.video.addEventListener('ended', function() {
        markFinished(item);
      });
      item.video.addEventListener('timeupdate', function() {
        if (
          !item.ended &&
          Number.isFinite(item.video.duration) &&
          item.video.duration > 1 &&
          item.video.currentTime >= item.video.duration - 0.8
        ) {
          markFinished(item);
        }
      });
    });

    resetPair();

    setInterval(function() {
      items.forEach(function(item) {
        if (!item.ended) {
          item.video.playbackRate = 3;
          if (item.video.paused) {
            playItem(item);
          }
        }
      });
    }, 1000);
  });
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");

    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

		// Initialize all div with carousel class
    var carousels = bulmaCarousel.attach('.carousel', options);

    // Loop on each carousel initialized
    for(var i = 0; i < carousels.length; i++) {
    	// Add listener to  event
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    // Access to bulmaCarousel instance of an element
    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	// bulmaCarousel instance is available as element.bulmaCarousel
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    /*var player = document.getElementById('interpolation-video');
    player.addEventListener('loadedmetadata', function() {
      $('#interpolation-slider').on('input', function(event) {
        console.log(this.value, player.duration);
        player.currentTime = player.duration / 100 * this.value;
      })
    }, false);*/
    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();
    setupSynchronizedDemoVideos();

})
