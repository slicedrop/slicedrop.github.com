// fibers panel javascript
jQuery(function() {

  jQuery('#fibersvisibility').click(function() {

    toggleFibersVisibility();
  });
  
  jQuery("#threshold-fibers").dragslider({
    range: true,
    rangeDrag: true,
    values: [0, 100],
    slide: thresholdFibers
  });
  jQuery("#threshold-fibers").width(140);
  
});
