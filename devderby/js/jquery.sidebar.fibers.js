// mesh panel javascript
jQuery(function() {

  jQuery("#threshold-fibers").dragslider({
    range: true,
    rangeDrag: true,
    values: [0, 100]
  });
  jQuery("#threshold-fibers").width(140);
  
});
