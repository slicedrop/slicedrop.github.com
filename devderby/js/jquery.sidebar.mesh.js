// mesh panel javascript
jQuery(function() {

  jQuery("#opacity-mesh").slider();
  jQuery("#opacity-mesh").width(140);
  
  jQuery("#threshold-scalars").dragslider({
    range: true,
    rangeDrag: true,
    values: [0, 100]
  });
  jQuery("#threshold-scalars").width(140);
  
});
