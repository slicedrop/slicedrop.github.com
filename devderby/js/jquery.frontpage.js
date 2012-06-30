/**
 * The main handler for drag'n'drop and also for file selection. The XTK scene
 * gets created here and the viewer gets activated. Inspired by
 * http://imgscalr.com - THANKS!!
 */

jQuery(document).ready(function() {

  initBrowserWarning();
  initDnD();
  
});

function initBrowserWarning() {

  var isChrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  
  if (!isChrome && !isFirefox) {
    jQuery("#browser-warning").fadeIn(125);
  }
};

function initDnD() {

  // Add drag handling to target elements
  document.getElementById("body").addEventListener("dragenter", onDragEnter,
      false);
  document.getElementById("drop-box-overlay").addEventListener("dragleave",
      onDragLeave, false);
  document.getElementById("drop-box-overlay").addEventListener("dragover",
      noopHandler, false);
  
  // Add drop handling
  document.getElementById("drop-box-overlay").addEventListener("drop", onDrop,
      false);
  
};

function noopHandler(evt) {

  evt.stopPropagation();
  evt.preventDefault();
};

function onDragEnter(evt) {

  jQuery("#drop-box-overlay").fadeIn(125);
  jQuery("#drop-box-prompt").fadeIn(125);
};

function onDragLeave(evt) {

  /*
   * We have to double-check the 'leave' event state because this event stupidly
   * gets fired by JavaScript when you mouse over the child of a parent element;
   * instead of firing a subsequent enter event for the child, JavaScript first
   * fires a LEAVE event for the parent then an ENTER event for the child even
   * though the mouse is still technically inside the parent bounds. If we trust
   * the dragenter/dragleave events as-delivered, it leads to "flickering" when
   * a child element (drop prompt) is hovered over as it becomes invisible, then
   * visible then invisible again as that continually triggers the enter/leave
   * events back to back. Instead, we use a 10px buffer around the window frame
   * to capture the mouse leaving the window manually instead. (using 1px didn't
   * work as the mouse can skip out of the window before hitting 1px with high
   * enough acceleration).
   */
  if (evt.pageX < 10 || evt.pageY < 10 ||
      jQuery(window).width() - evt.pageX < 10 ||
      jQuery(window).height - evt.pageY < 10) {
    jQuery("#drop-box-overlay").fadeOut(125);
    jQuery("#drop-box-prompt").fadeOut(125);
  }
};

function onDrop(evt) {

  // Consume the event.
  noopHandler(evt);
  
  // Hide overlay
  jQuery("#drop-box-overlay").fadeOut(0);
  jQuery("#drop-box-prompt").fadeOut(0);
  
  // Get the dropped files.
  var files = evt.dataTransfer.files;
  
  // If anything is wrong with the dropped files, exit.
  if (typeof files == "undefined" || files.length == 0) {
    return;
  }
  
  // now switch to the viewer
  switchToViewer();
  
  // .. and start the file reading
  read(files);
  
};

function switchToViewer() {

  jQuery('#body').addClass('viewerBody');
  jQuery('#frontpage').hide();
  jQuery('#viewer').show();
  
};
