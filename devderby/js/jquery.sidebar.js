// sidebar javascript
jQuery(function() {

  jQuery('.menu').stop().animate({
    'marginLeft': '-195px'
  }, 1000);
  
  jQuery('.navigationLi').hover(function() {

    if (jQuery('.miniColors-selector').length > 0) {
      
      // color dialog is active, don't slide
      return;
      
    }
    
    jQuery('.menu', jQuery(this)).stop().animate({
      'marginLeft': '-2px'
    }, 200);
    
  }, function() {

    if (jQuery('.pinicon', jQuery(this)).hasClass('ui-icon-pin-s')) {
      // if pinned, don't slide in
      return;
    }
    
    if (jQuery('.miniColors-selector').length > 0) {
      
      // color dialog is active, don't slide
      return;
      
    }
    
    jQuery('.menu', jQuery(this)).stop().animate({
      'marginLeft': '-195px'
    }, 200);
    
  });
  
  jQuery('.pin').click(
      function() {

        jQuery('.pinicon', jQuery(this)).toggleClass('ui-icon-pin-w')
            .toggleClass('ui-icon-pin-s');
        
      });
  

  // activate the tab box
  jQuery(".tabbox").idTabs("!mouseover");
  

  // a show/hide button
  jQuery('.eye').button();
  jQuery('.eye').unbind('mouseenter').unbind('mouseleave');
  jQuery('.eye').click(function() {

    jQuery('.eye').toggleClass('show-icon').toggleClass('hide-icon');
    
  });
  

  jQuery("#meshtabs").idTabs(
      function(id, list, set) {

        jQuery("a", set).removeClass("selected").filter("[href='" + id + "']",
            set).addClass("selected");
        // for (i in list)
        // $(list[i]).hide();
        // $(id).fadeIn();
        return false;
      });
  
});
