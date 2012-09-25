// the viewers
jQuery(function() {

  

  // create the 2d sliders
  jQuery("#yellow_slider").slider({
    slide: volumeslicingX
  });
  jQuery("#yellow_slider .ui-slider-handle").unbind('keydown');
  
  jQuery("#red_slider").slider({
    slide: volumeslicingY
  });
  jQuery("#red_slider .ui-slider-handle").unbind('keydown');
  
  jQuery("#green_slider").slider({
    slide: volumeslicingZ
  });
  jQuery("#green_slider .ui-slider-handle").unbind('keydown');
  
});


// splits the document into two frames
function split_screen() {

  if (parent.viewer_left !== undefined) {
    // exit if we are already in split screen mode
    return;
  }
  
  frameset = '<FRAMESET cols="50%,50%" BORDER=3>' + '<FRAME src="' +
      document.location.href + '"' + ' NAME="viewer_left">' + '<FRAME src="' +
      document.location.href + '"' + ' NAME="viewer_right">' + '</FRAMESET>';
  location = 'javascript:frameset';
  
};
