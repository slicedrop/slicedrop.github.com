/*

    .----.                    _..._                                                     .-'''-.                           
   / .--./    .---.        .-'_..._''.                          _______                '   _    \                         
  ' '         |   |.--.  .' .'      '.\     __.....__           \  ___ `'.           /   /` '.   \_________   _...._      
  \ \         |   ||__| / .'            .-''         '.    ,.--. ' |--.\  \         .   |     \  '\        |.'      '-.   
   `.`'--.    |   |.--.. '             /     .-''"'-.  `. //    \| |    \  ' .-,.--.|   '      |  '\        .'```'.    '. 
     `'-. `.  |   ||  || |            /     /________\   \\\    /| |     |  '|  .-. \    \     / /  \      |       \     \
         `. \ |   ||  || |            |                  | `'--' | |     |  || |  | |`.   ` ..' /    |     |        |    |
           \ '|   ||  |. '            \    .-------------' ,.--. | |     ' .'| |  | |   '-...-'`     |      \      /    . 
            | |   ||  | \ '.          .\    '-.____...---.//    \| |___.' /' | |  '-                 |     |\`'-.-'   .'  
            | |   ||__|  '. `._____.-'/ `.             .' \\    /_______.'/  | |                     |     | '-....-'`    
           / /'---'        `-.______ /    `''-...... -'    `'--'\_______|/   | |                    .'     '.             
     /...-'.'                       `                                        |_|                  '-----------'           
    /--...-'                                                                                                              
    
    Slice:Drop - Instantly view scientific and medical imaging data in 3D.
    
     http://slicedrop.com
     
    Copyright (c) 2012 The Slice:Drop and X Toolkit Developers <dev@goXTK.com>
    
    Slice:Drop is licensed under the MIT License:
      http://www.opensource.org/licenses/mit-license.php    
      
    CREDITS: http://slicedrop.com/LICENSE
     
*/

// sidebar javascript
jQuery(function() {

  jQuery('.menu').stop().animate({
    'marginLeft': '-195px'
  }, 1000);
  
  jQuery('.navigationLi').hover(function() {

    if (jQuery('.menu', jQuery(this)).hasClass('menuDisabled')) {
      // if this menu is disabled, don't slide
      return;
    }
    
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
  

  // activate the tab boxes
  // .. for volumes
  jQuery("#volumetabs").idTabs("!mouseover");
  // .. for meshes
  jQuery(".meshtabs").bind('mouseenter', function() {

    jQuery('.meshtabs').removeClass('selected');
    jQuery(this).addClass("selected");
    
  });
  // .. for fibers
  jQuery(".fiberstabs").bind('mouseenter', function() {

    jQuery('.fiberstabs').removeClass('selected');
    jQuery(this).addClass("selected");
    
  });
  
  // a show/hide button
  jQuery('.eye').button();
  jQuery('.eye').unbind('mouseenter').unbind('mouseleave');
  jQuery('.eye').click(function() {

    jQuery('.eye').toggleClass('show-icon').toggleClass('hide-icon');
    
  });
  
});
