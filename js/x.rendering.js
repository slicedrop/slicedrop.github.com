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

function initializeRenderers(){

  if (ren3d) {
    // do this only once
    return;
  }

  _webgl_supported = true;


  try {

    // create the XTK renderers
    ren3d = new X.renderer3D();
    ren3d.container = '3d';
    ren3d.init();
    ren3d.interactor.onTouchStart = ren3d.interactor.onMouseDown = onTouchStart3D;
    ren3d.interactor.onTouchEnd = ren3d.interactor.onMouseUp = onTouchEnd3D;
    ren3d.interactor.onMouseWheel = function(e) {

      if (RT.linked) {

        clearTimeout(RT._updater);
        RT._updater = setTimeout(RT.pushCamera.bind(this, 'ren3d'), 150);

      }

    };

    // webgl is enabled
    window.console.log('WebGL supported.');

    jQuery(document.body).addClass('webgl_enabled');

  } catch (Error) {

    window.console.log('WebGL *not* supported.');

    _webgl_supported = false;

    // delete the created 3d canvas
    jQuery('#3d').empty();

    jQuery(document.body).addClass('webgl_disabled');
    jQuery(document.body).removeClass('webgl_enabled');

  }


   sliceAx = new X.renderer2D();
   sliceAx.container = 'sliceAx';
   sliceAx.orientation = 'AXIAL';
   sliceAx.init();
   // observe the on touch thingie to enlarge
   sliceAx.interactor.onTouchStart = sliceAx.interactor.onMouseDown = onTouchStartAx;
   sliceAx.interactor.onTouchEnd = sliceAx.interactor.onMouseUp = onTouchEndAx;
   sliceAx.onSliceNavigation = onSliceNavigation;

   sliceSag = new X.renderer2D();
   sliceSag.container = 'sliceSag';
   sliceSag.orientation = 'SAGITTAL';
   sliceSag.init();
   // observe the on touch thingie to enlarge
   sliceSag.interactor.onTouchStart = sliceSag.interactor.onMouseDown = onTouchStartSag;
   sliceSag.interactor.onTouchEnd = sliceSag.interactor.onMouseUp = onTouchEndSag;
   sliceSag.onSliceNavigation = onSliceNavigation;

   sliceCor = new X.renderer2D();
   sliceCor.container = 'sliceCor';

   if (!_webgl_supported) {

     sliceCor.container = '3d';

     // move the green slider to the 3d view
     var el1 = jQuery('#3d');
     el1.prepend('<span/>'); // drop a marker in place
     var tag1 = jQuery(el1.children()[0]);
     tag1.replaceWith(jQuery('#green_slider'));

   } else {

     sliceCor.container = 'sliceCor';

   }
   sliceCor.orientation = 'CORONAL';
   sliceCor.init();

   // observe the on touch thingie to enlarge
   sliceCor.interactor.onTouchStart = sliceCor.interactor.onMouseDown = onTouchStartCor;
   sliceCor.interactor.onTouchEnd = sliceCor.interactor.onMouseUp = onTouchEndCor;
   sliceCor.onSliceNavigation = onSliceNavigation;

   if (!_webgl_supported) {

     // now our ren3d is sliceZ
     ren3d = sliceCor;

   }

  ren3d.onShowtime = function() {

    window.console.log('Loading completed.');

    if (_data.volume.file.length > 0) {

      // show any volume also in 2d
       sliceAx.add(volume);
       sliceSag.add(volume);
       // don't add it again if webgl is not supported
       if (_webgl_supported){sliceCor.add(volume);}
       sliceAx.render();
       sliceSag.render();
       sliceCor.render();

    }

    //ren3d.resetBoundingBox();

    window.console.timeEnd('Loadtime');

    setupUi();
    configurator();

  };


  //
  // LINK THE RENDERERS
  //
  // link the 2d renderers to the 3d one by setting the onScroll
  // method. this means, once you scroll in 2d, it upates 3d as well
  var _updateThreeDSag = function() {

    if (_data.volume.file.length > 0) {

      jQuery('#red_slider').slider("option", "value",volume.indexX);
      // jQuery('#red_slider').slider("option", "value",volume.indexY);
      // jQuery('#green_slider').slider("option", "value",volume.indexZ);

      if (RT.linked) {

        clearTimeout(RT._updater);
        RT._updater = setTimeout(RT.pushVolume.bind(RT, 'indexX', volume.indexX), 150);

      }

    }

  };
  var _updateThreeDAx = function() {

    if (_data.volume.file.length > 0) {

      jQuery('#blue_slider').slider("option", "value",volume.indexZ);

      if (RT.linked) {

        clearTimeout(RT._updater);
        RT._updater = setTimeout(RT.pushVolume.bind(RT, 'indexZ', volume.indexZ), 150);

      }

    }

  };
  var _updateThreeDCor = function() {

    if (_data.volume.file.length > 0) {

      jQuery('#green_slider').slider("option", "value",volume.indexY);

      if (RT.linked) {

        clearTimeout(RT._updater);
        RT._updater = setTimeout(RT.pushVolume.bind(RT, 'indexY', volume.indexY), 150);

      }

    }

  };

  sliceAx.onScroll = _updateThreeDAx;
  sliceSag.onScroll = _updateThreeDSag;
  sliceCor.onScroll = _updateThreeDCor;

  var _updateWLSlider = function() {

    jQuery('#windowlevel-volume').dragslider("option", "values", [volume.windowLow, volume.windowHigh]);

    if (RT.linked) {

      clearTimeout(RT._updater);
      RT._updater = setTimeout(RT.pushVolume.bind(RT, 'windowLow', volume.windowLow), 150);
      clearTimeout(RT._updater2);
      RT._updater2 = setTimeout(RT.pushVolume.bind(RT, 'windowHigh', volume.windowHigh), 150);

    }

  };

  sliceAx.onWindowLevel = _updateWLSlider;
  sliceSag.onWindowLevel = _updateWLSlider;
  sliceCor.onWindowLevel = _updateWLSlider;

};

function createData() {


  // we support here max. 1 of the following
  //
  // volume (.nrrd,.mgz,.mgh)
  // labelmap (.nrrd,.mgz,.mgh)
  // colortable (.txt,.lut)
  // mesh (.stl,.vtk,.fsm,.smoothwm,.inflated,.sphere,.pial,.orig)
  // scalars (.crv)
  // fibers (.trk)

  //
  // the data holder for the scene
  // includes the file object, file data and valid extensions for each object
  _data = {
   'volume': {
     'file': [],
     'filedata': [],
     'extensions': ['NRRD', 'MGZ', 'MGH', 'NII', 'GZ', 'DCM', 'DICOM']
   },
   'labelmap': {
     'file': [],
     'filedata': [],
     'extensions': ['NRRD', 'MGZ', 'MGH']
   },
   'colortable': {
     'file': [],
     'filedata': [],
     'extensions': ['TXT', 'LUT']
   },
   'mesh': {
     'file': [],
     'filedata': [],
     'extensions': ['STL', 'VTK', 'FSM', 'SMOOTHWM', 'INFLATED', 'SPHERE',
                    'PIAL', 'ORIG', 'OBJ']
   },
   'scalars': {
     'file': [],
     'filedata': [],
     'extensions': ['CRV', 'LABEL']
   },
   'fibers': {
     'file': [],
     'filedata': [],
     'extensions': ['TRK']
   },
  };

}

//
// Reading files using the HTML5 FileReader.
//
function read(files) {

  createData();

  // show share button
  $('#share').show();

  for ( var i = 0; i < files.length; i++) {

   var f = files[i];
   var _fileName = f.name;
   var _fileExtension = _fileName.split('.').pop().toUpperCase();

   // check for files with no extension
   if (_fileExtension == _fileName.toUpperCase()) {

     // this must be dicom
     _fileExtension = 'DCM';

   }

   var _fileSize = f.size;

   // check which type of file it is
   if (_data['volume']['extensions'].indexOf(_fileExtension) >= 0) {

     _data['volume']['file'].push(f);


   } else if (_data['colortable']['extensions'].indexOf(_fileExtension) >= 0) {

     // this is a color table
     _data['colortable']['file'].push(f);

   } else if (_data['mesh']['extensions'].indexOf(_fileExtension) >= 0) {

     // this is a mesh
     _data['mesh']['file'].push(f);

   } else if (_data['scalars']['extensions'].indexOf(_fileExtension) >= 0) {

     // this is a scalars file
     _data['scalars']['file'].push(f);

   } else if (_data['fibers']['extensions'].indexOf(_fileExtension) >= 0) {

     // this is a fibers file
     _data['fibers']['file'].push(f);

   }

  }

  // we now have the following data structure for the scene
  window.console.log('New data', _data);

  var _types = Object.keys(_data);

  // number of total files
  var _numberOfFiles = files.length;
  var _numberRead = 0;
  window.console.log('Total new files:', _numberOfFiles);

  //
  // the HTML5 File Reader callbacks
  //

  // setup callback for errors during reading
  var errorHandler = function(e) {

   console.log('Error:' + e.target.error.code);

  };

  // setup callback after reading
  var loadHandler = function(type, file) {

   return function(e) {

     // reading complete
     var data = e.target.result;

     // might have multiple files associated
     // attach the filedata to the right one
     _data[type]['filedata'][_data[type]['file'].indexOf(file)] = data;

     _numberRead++;
     if (_numberRead == _numberOfFiles) {

       // all done, start the parsing
       parse(_data);

     }

   };
  };


  //
  // start reading
  //
  _types.forEach(function(v) {

   if (_data[v]['file'].length > 0) {

     _data[v]['file'].forEach(function(u) {

       var reader = new FileReader();

       reader.onerror = errorHandler;
       reader.onload = (loadHandler)(v,u); // bind the current type

       // start reading this file
       reader.readAsArrayBuffer(u);


     });

   }

  });

};

//
// Parse file data and setup X.objects
//
function parse(data) {

  // initialize renderers
  initializeRenderers();

  window.console.time('Loadtime');

  // check for special case if a volume, a labelmap and a colortable was dropped
  if (data['volume']['file'].length == 2 && data['colortable']['file'].length == 1) {

    // we assume the smaller volume is a labelmap
    var _smaller_volume = data['volume']['file'][0];
    var _smaller_data = data['volume']['filedata'][0];
    if (_smaller_volume.size < data['volume']['file'][1]) {

      // this is the smaller volume so configure it as a labelmap
      data['labelmap']['file'].push(_smaller_volume);
      data['labelmap']['filedata'].push(_smaller_data);
      data['volume']['file'].shift();
      data['volume']['filedata'].shift();

    } else {

      // we swap them and configure the second one as a labelmap
      _smaller_volume = data['volume']['file'][1];
      _smaller_data = data['volume']['filedata'][1];
      data['labelmap']['file'].push(_smaller_volume);
      data['labelmap']['filedata'].push(_smaller_data);
      data['volume']['file'].pop();
      data['volume']['filedata'].pop();

    }

  }

  if (data['volume']['file'].length > 0) {

   // we have a volume
   volume = new X.volume();
   volume.file = data['volume']['file'].map(function(v) {

     return v.name;

   });
   volume.filedata = data['volume']['filedata'];
   var colortableParent = volume;

   if (data['labelmap']['file'].length > 0) {

     // we have a label map
     volume.labelmap.file = data['labelmap']['file'].map(function(v) {

       return v.name;

     });
     volume.labelmap.filedata = data['labelmap']['filedata'];
     colortableParent = volume.labelmap;

   }

   // add callbacks for computing
   volume.onComputing = function(direction) {
     //console.log('computing', direction);
   }

   volume.onComputingProgress = function(value) {
     //console.log(value);
   }

   volume.onComputingEnd = function(direction) {
     //console.log('computing end', direction);
   }

   if (data['colortable']['file'].length > 0) {

     // we have a color table
     colortableParent.colortable.file = data['colortable']['file'].map(function(v) {

       return v.name;

     });
     colortableParent.colortable.filedata = data['colortable']['filedata'];

   }

   // add the volume
   ren3d.add(volume);

  }

  if (data['mesh']['file'].length > 0) {

   // we have a mesh
   mesh = new X.mesh();
   mesh.file = data['mesh']['file'].map(function(v) {

     return v.name;

   });
   mesh.filedata = data['mesh']['filedata'];

   if (data['scalars']['file'].length > 0) {

     // we have scalars
     mesh.scalars.file = data['scalars']['file'].map(function(v) {

       return v.name;

     });
     mesh.scalars.filedata = data['scalars']['filedata'];

   }

   // add the mesh
   ren3d.add(mesh);

  }

  if (data['fibers']['file'].length > 0) {

   // we have fibers
   fibers = new X.fibers();
   fibers.file = data['fibers']['file'].map(function(v) {

     return v.name;

   });
   fibers.filedata = data['fibers']['filedata'];

   // add the fibers
   ren3d.add(fibers);

  }

  ren3d.camera.position = [0,500,0];
  ren3d.render();

};

function onSliceNavigation() {


  jQuery('#red_slider').slider("option", "value",volume.indexX);

  jQuery('#green_slider').slider("option", "value",volume.indexY);

  jQuery('#blue_slider').slider("option", "value",volume.indexZ);


};

//
// Interaction callbacks
//
function onTouchStartAx() {

  onTouchStart('sliceAx');

};

function onTouchStartSag() {

  onTouchStart('sliceSag');

};

function onTouchStartCor() {

  onTouchStart('sliceCor');

};

function onTouchStart3D() {

  onTouchStart('ren3d');

}

function onTouchEndAx() {

  onTouchEnd('sliceAx','Ax');

};

function onTouchEndSag() {

  onTouchEnd('sliceSag','Sag');

};

function onTouchEndCor() {

  onTouchEnd('sliceCor','Cor');

};

function onTouchEnd3D() {

  onTouchEnd('ren3d','3d');

}

function onTouchStart(renderer) {

  log('Touch start');

  _touch_started = Date.now();

  if (RT.linked) {
    clearInterval(RT._updater);
    RT._updater = setInterval(RT.pushCamera.bind(this, renderer), 150);
  }

}

function onTouchEnd(rend,container) {

  if (RT.linked){
    clearInterval(RT._updater);
  }

  _touch_ended = Date.now();

  if (typeof _touch_started == 'undefined') {
    _touch_started = _touch_ended;
  }

  if (_touch_ended - _touch_started < 200) {

    var _old_2d_content = eval('_current_' + container + '_content');
    eval('var cont = '+rend+'.container');

    showLarge(jQuery(cont), _old_2d_content);

    if (RT.linked) {

      RT._updater = setInterval(RT.pushUI.bind(RT, rend, container), 150);

    }

  }

};

