jQuery(document).ready(function() {

  
  initBrowserWarning();
  initDnD();
  

});

function error(message) {

  alert(message);
  
};

function debug(message) {

  window.console.log(message);
  
};

/**
 * Inspired by http://imgscalr.com - THANKS!!
 */
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
  
  // init the widgets
  // jQuery("#upload-status-progressbar").progressbar();
  
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
  
  // Empty status text
  jQuery("#upload-details").html("");
  
  // Reset progress bar in case we are dropping MORE files on an existing result
  // page
  // jQuery("#upload-status-progressbar").progressbar({
  // value: 0
  // });
  currentProgress = 0;
  
  // Show progressbar
  // jQuery("#upload-status-progressbar").fadeIn(0);
  jQuery("#status").show();
  
  // Get the dropped files.
  var files = evt.dataTransfer.files;
  
  // If anything is wrong with the dropped files, exit.
  if (typeof files == "undefined" || files.length == 0) {
    return;
  }
  
  // Update and show the upload box
  var label = (files.length == 1 ? " file" : " files");
  jQuery("#upload-count").html(files.length + label);
  jQuery("#upload-thumbnail-list").fadeIn(125);
  
  // Process each of the dropped files individually
  for ( var i = 0, length = files.length; i < length; i++) {
    uploadFile(files[i], length);
  }
  
};

function uploadFile(file, totalFiles) {

  var reader = new FileReader();
  
  // Handle errors that might occur while reading the file (before upload).
  reader.onerror = function(evt) {

    var message = 'Error';
    
    // REF: http://www.w3.org/TR/FileAPI/#ErrorDescriptions
    switch (evt.target.error.code) {
    case 1:
      message = file.name + " not found.";
      break;
    
    case 2:
      message = file.name + " has changed on disk, please re-try.";
      break;
    
    case 3:
      messsage = "Upload cancelled.";
      break;
    
    case 4:
      message = "Cannot read " + file.name + ".";
      break;
    
    case 5:
      message = "File too large for browser to upload.";
      break;
    }
    
    error(message);
  };
  
  reader.onload = (function(file) {

    return function(e) {

      var data = e.target.result;
      
      var base64StartIndex = data.indexOf(',') + 1;
      
      parse(file.name, window.atob(data.substring(base64StartIndex)));
      
      // updateAndCheckProgress(totalFiles);
      
    };
  })(file);
  
  // Start reading the image off disk into a Data URI format.
  reader.readAsDataURL(file);
};

function parse(filename, data) {

  var fileExtension = filename.split('.')[1];
  
  var worker = new Worker('js/X.bootstrap.js');
  worker.postMessage([fileExtension, data]);
  
  worker.onmessage = function(event) {

    if (!event.data) {
      
      throw new Error('Loading failed.');
      
    }
    
    obj = event.data;
    // console.log(obj);
    if (typeof obj['_volumeRendering'] == 'undefined') {
      // regular X.object
      
      obj = new X.object(obj); // we need to down cast the data using
      // the copy constructor
      
    } else {
      // this is a X.volume
      // console.log(obj);
      obj = new X.volume(obj);
      // console.log(obj);
      
    }
    // console.log('duck:', obj);
    
    // make sure we have a renderer
    setupRenderer();
    
    xtkRenderer.add(obj);
    xtkRenderer.render();
    // xtkRenderer.resetBoundingBox();
    
    worker.terminate();
    
  };
  
};

function setupRenderer() {

  // Hide centered showcase
  jQuery("#centered").fadeOut(300);
  jQuery("#status").hide();
  
  if (typeof xtkRenderer == 'undefined') {
    
    xtkRenderer = new X.renderer('r');
    xtkRenderer.init();
    
  }
  
};


/**
 * Used to update the progress bar and check if all uploads are complete.
 * Checking progress entails getting the current value from the progress bar and
 * adding an incremental "unit" of completion to it since all uploads run async
 * and complete at different times we can't just update in-order. This is only
 * ever meant to be called from an upload 'success' handler.
 */
function updateAndCheckProgress(totalFiles, altStatusText) {

  // var currentProgress = jQuery("#upload-status-progressbar").progressbar(
  // "option", "value");
  currentProgress = currentProgress + (100 / totalFiles);
  
  // Update the progress bar
  // jQuery("#upload-status-progressbar").progressbar({
  // value: currentProgress
  // });
  
  // Check if that was the last file and hide the animation if it was
  if (currentProgress >= 99) {
    // jQuery("#upload-status-text").html(
    // (altStatusText ? altStatusText : "Please wait.."));
    
    // setTimeout(function() {
    
    jQuery("#status").hide();
    // jQuery("#upload-box").hide();
    // jQuery("#upload-animation").hide();
    
    // end of upload
    
    // }, 100);
  }
};


