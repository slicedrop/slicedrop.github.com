// mesh panel javascript
jQuery(function() {

  
  jQuery('#meshvisibility').click(function() {

    toggleMeshVisibility();
  });
  
  jQuery('#meshColor').miniColors({
    letterCase: 'uppercase',
    change: meshColor
  });
  
  jQuery('#scalarsMinColor').miniColors({
    letterCase: 'uppercase',
    change: scalarsMinColor
  });
  
  jQuery('#scalarsMaxColor').miniColors({
    letterCase: 'uppercase',
    change: scalarsMaxColor
  });
  
  jQuery("#opacity-mesh").slider({
    slide: opacityMesh
  });
  jQuery("#opacity-mesh").width(140);
  
  jQuery("#threshold-scalars").dragslider({
    range: true,
    rangeDrag: true,
    values: [0, 100],
    // connect to x.controller.js
    slide: thresholdScalars
  });
  jQuery("#threshold-scalars").width(140);
  
});
