// script snippet for the menu animation
jQuery(function() {

  jQuery('.menu').stop().animate({
    'marginLeft': '-195px'
  }, 1000);
  
  jQuery('.navigationLi').hover(function() {

    jQuery('.menu', jQuery(this)).stop().animate({
      'marginLeft': '-2px'
    }, 200);
    
  }, function() {

    jQuery('.menu', jQuery(this)).stop().animate({
      'marginLeft': '-195px'
    }, 200);
    
  });
  
  // activate the tab box
  jQuery(".tabbox").idTabs("!mouseover");
  
  // other layout elements
  jQuery("#volumerendering").button();
  jQuery("#volumerendering").css('font-size', '10px');
  
  jQuery("#threshold-volume").slider();
  
  // customize slider look and feeld
  jQuery('.ui-slider').height(5);
  jQuery('.ui-slider-handle').height(10);
  jQuery('.ui-slider-handle').width(3);
  jQuery('.ui-slider-handle').css('margin-top', '0.5px');
  // jQuery('.ui-widget').css('font-size', '10px');
  // jQuery('.ui-widget').css('letter-spacing', '1px');
  jQuery('.ui-corner-all').css('-moz-border-radius', '2px');
  jQuery('.ui-corner-all').css('-webkit-border-radius', '2px');
  

});
