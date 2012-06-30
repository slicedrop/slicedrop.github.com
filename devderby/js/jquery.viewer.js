// the viewers
jQuery(function() {

  

  // create the 2d sliders
  jQuery("#yellow_slider").slider();
  jQuery("#yellow_slider .ui-slider-handle").unbind('keydown');
  
  jQuery("#red_slider").slider();
  jQuery("#red_slider .ui-slider-handle").unbind('keydown');
  
  jQuery("#green_slider").slider();
  jQuery("#green_slider .ui-slider-handle").unbind('keydown');
  
});
