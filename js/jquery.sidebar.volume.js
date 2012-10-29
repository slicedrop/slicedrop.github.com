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

// volume panel javascript
jQuery(function() {

  //
  // VOLUME
  //
  jQuery('#volumerendering').button();
  jQuery('#volumerendering').unbind('mouseenter').unbind('mouseleave');
  jQuery('#volumerendering').click(function() {

    jQuery('#slicing').removeClass('ui-state-active');
    jQuery('#volumerendering').addClass('ui-state-active');
    jQuery('#windowlevel-label').hide();
    jQuery('#windowlevel-volume').hide();
    jQuery('#opacity-label').show();
    jQuery('#opacity-volume').show();
    
    volumerenderingOnOff(true);
    
  });
  jQuery('#slicing').button();
  jQuery('#slicing').addClass('ui-state-active');
  jQuery('#slicing').unbind('mouseenter').unbind('mouseleave');
  jQuery('#slicing').click(function() {

    jQuery('#volumerendering').removeClass('ui-state-active');
    jQuery('#slicing').addClass('ui-state-active');
    jQuery('#opacity-label').hide();
    jQuery('#opacity-volume').hide();
    jQuery('#windowlevel-label').show();
    jQuery('#windowlevel-volume').show();
    
    volumerenderingOnOff(false);
    
  });
  jQuery('#modes').buttonset();
  
  jQuery('#fgColorVolume').miniColors({
    letterCase: 'uppercase',
    change: fgColorVolume
  });
  
  jQuery('#bgColorVolume').miniColors({
    letterCase: 'uppercase',
    change: bgColorVolume
  });
  
  jQuery('#inverted').button();
  
  jQuery('#color2').button();
  
  jQuery('#colormodes').buttonset();
  jQuery('#inverted').removeClass('ui-corner-left').addClass('ui-corner-top');
  jQuery('#color2').removeClass('ui-corner-right').addClass('ui-corner-bottom');
  
  jQuery('#windowlevel-volume').dragslider({
    range: true,
    rangeDrag: true,
    values: [0, 100],
    // connect to x.controller.js
    slide: windowLevelVolume
  });
  jQuery('#windowlevel-volume').width(140);
  
  jQuery('#opacity-volume').slider({
    slide: opacity3dVolume
  });
  jQuery('#opacity-volume').width(140);
  jQuery('#opacity-volume').hide();
  jQuery('#opacity-label').hide();
  
  jQuery('#threshold-volume').dragslider({
    range: true,
    rangeDrag: true,
    values: [0, 100],
    // connect to x.controller.js
    slide: thresholdVolume
  });
  jQuery('#threshold-volume').width(140);
  
  //
  // LABELMAP
  //
  
  jQuery('#labelmapvisibility').click(function() {

    toggleLabelmapVisibility();
  });
  

  jQuery('#opacity-labelmap').slider({
    slide: opacityLabelmap
  });
  jQuery('#opacity-labelmap').width(140);
  


});
