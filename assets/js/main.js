$(function(){
  var $nav = $("nav"),
      rubberize_nav = true,
      collapsed_height =
      $.makeArray($("nav, nav li")).map(function(el){
        var $el = $(el);
        return parseInt($el.css("border-top-width")) +
               parseInt($el.css("border-bottom-width"));
      }).reduce(function(sum, value){
        return sum + value;
      });

  var nav_is_collapsed = function(){
    return !$nav.hasClass("expanded");
  };
  
  var toggle_nav = function(expand){
    expand = expand === undefined ? nav_is_collapsed() : expand;
    if (expand){
      $nav.css({height: ""})
          .addClass("expanded");
    } else {
      $nav.css({height: collapsed_height})
          .removeClass("expanded");
    }
  };

  // initialize the nav
  toggle_nav(false);

  var hmr = new Hammer($("nav")[0]);
  hmr.get("swipe").set({direction: Hammer.DIRECTION_ALL});
  hmr.on("swipeup swipedown", function(ev){
    toggle_nav(ev.type == "swipeup");
  });

  $('a[href*="#"]')
    // Remove links that don't actually link to anything
    .not('[href="#"]')
    .not('[href="#0"]')
    .not('[href^="http://"]')
    .not('[href^="https://"]')
    .click(function(event) {
      if (nav_is_collapsed()) return event.preventDefault();
      // On-page links
      if (
        location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '')
        &&
        location.hostname == this.hostname
      ) {
        // Figure out element to scroll to
        var target = $(this.hash);
        target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
        // Does a scroll target exist?
        if (target.length) {
          // Only prevent default if animation is actually gonna happen
          event.preventDefault();
          rubberize_nav = false;
          $('html, body').animate({
            scrollTop: target.offset().top
          }, 1000, function() {
            // Callback after animation
            // Must change focus!
            rubberize_nav = true;
            var $target = $(target);
            $target.focus();
            if ($target.is(":focus")) { // Checking if the target was focused
              return false;
            } else {
              return $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
            };
          });
        }
      }
    });

  var get_scroll_speed = (function(settings){
    settings = settings || {};

    var lastPos, newPos, timer, delta, 
        delay = settings.delay || 50; // in "ms" (higher means lower fidelity )

    function clear() {
      lastPos = null;
      delta = 0;
    }

    clear();

    return function(){
      newPos = window.scrollY;
      if ( lastPos != null ){ // && newPos < maxScroll 
        delta = newPos -  lastPos;
      }
      lastPos = newPos;
      clearTimeout(timer);
      timer = setTimeout(clear, delay);
      return delta;
    };
  })();

  window.onscroll = function(){
    if(rubberize_nav && nav_is_collapsed()){
      $nav.css({height: Math.max(get_scroll_speed(), collapsed_height)});
    }
  };

  $nav
    .click(function(){ toggle_nav(); })
    .hover(function(){ toggle_nav(true); },
           function(){ toggle_nav(false); });

  $(".site__content").click(function(){ toggle_nav(false); });
});
