
function initializeRenderers(){
  
  // create the XTK renderers
  ren3d = new X.renderer3D();
  ren3d.container = '3d';
  ren3d.init();    
  
  sliceX = new X.renderer2D();
  sliceX.container = 'sliceX';
  sliceX.orientation = 'X';
  sliceX.init();

  sliceY = new X.renderer2D();
  sliceY.container = 'sliceY';
  sliceY.orientation = 'Y';
  sliceY.init();  
  
  sliceZ = new X.renderer2D();
  sliceZ.container = 'sliceZ';
  sliceZ.orientation = 'Z';
  sliceZ.init();  
  
  ren3d.onShowtime = function() {
    
    window.console.log('Loading completed.');
    
    if (_data.volume.file != null) {
      
      // show any volume also in 2d
      sliceX.add(volume);
      sliceY.add(volume);
      sliceZ.add(volume);
      
      sliceX.render();
      sliceY.render();
      sliceZ.render();
      
    }
    
    
    
  };
  
};

//
// Reading files using the HTML5 FileReader.
//
function read(files) {
    
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
     'file': null,
     'filedata': null,
     'extensions': ['NRRD', 'MGZ', 'MGH']
   },
   'labelmap': {
     'file': null,
     'filedata': null,
     'extensions': ['NRRD', 'MGZ', 'MGH']
   },
   'colortable': {
     'file': null,
     'filedata': null,
     'extensions': ['TXT', 'LUT']
   },
   'mesh': {
     'file': null,
     'filedata': null,
     'extensions': ['STL', 'VTK', 'FSM', 'SMOOTHWM', 'INFLATED', 'SPHERE',
                    'PIAL', 'ORIG']
   },
   'scalars': {
     'file': null,
     'filedata': null,
     'extensions': ['CRV']
   },
   'fibers': {
     'file': null,
     'filedata': null,
     'extensions': ['TRK']
   },
  };
  
  
  for ( var i = 0; i < files.length; i++) {
   
   var f = files[i];
   var _fileName = f.name;
   var _fileExtension = _fileName.split('.').pop().toUpperCase();
   var _fileSize = f.size;
   
   // check which type of file it is
   if (_data['volume']['extensions'].indexOf(_fileExtension) >= 0) {
     
     // this can be either the volume or the labelmap
     
     // if we already have a volume, check if the current one is smaller
     // then, set it as a label map, else wise switch them
     if (_data['volume']['file']) {
       
       if (_data['volume']['file'].size < _fileSize) {
         // switcharoo
         _data['labelmap']['file'] = _data['volume']['file'];
         _data['volume']['file'] = f;
         
       } else {
         
         _data['labelmap']['file'] = f;
         
       }
       
     } else {
       
       // no volume yet
       _data['volume']['file'] = f;
       
     }
     
  
   } else if (_data['colortable']['extensions'].indexOf(_fileExtension) >= 0) {
     
     // this is a color table
     _data['colortable']['file'] = f;
     
   } else if (_data['mesh']['extensions'].indexOf(_fileExtension) >= 0) {
     
     // this is a mesh
     _data['mesh']['file'] = f;
     
   } else if (_data['scalars']['extensions'].indexOf(_fileExtension) >= 0) {
     
     // this is a scalars file
     _data['scalars']['file'] = f;
     
   } else if (_data['fibers']['extensions'].indexOf(_fileExtension) >= 0) {
     
     // this is a fibers file
     _data['fibers']['file'] = f;
     
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
  var loadHandler = function(type) {
  
   return function(e) {
  
     // reading complete
     var data = e.target.result;
     
     var base64StartIndex = data.indexOf(',') + 1;
     data = window.atob(data.substring(base64StartIndex));
     
     // attach the data to our scene
     _data[type]['filedata'] = data;
     
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
  
   if (_data[v]['file']) {
     
     var reader = new FileReader();
     
     reader.onerror = errorHandler;
     reader.onload = (loadHandler)(v); // bind the current type
     
     // start reading this file
     reader.readAsDataURL(_data[v]['file']);
   }
   
  });

};

//
// Parse file data and setup X.objects
//
function parse(data) {
  
  // initialize renderers
  initializeRenderers();
  
  if (data['volume']['file']) {
   
   // we have a volume
   volume = new X.volume();
   volume.file = data['volume']['file'].name;
   volume.filedata = data['volume']['filedata'];
   var colortableParent = volume;
   
   if (data['labelmap']['file']) {
     
     // we have a label map
     volume.labelmap.file = data['labelmap']['file'].name;
     volume.labelmap.filedata = data['labelmap']['filedata'];
     colortableParent = volume.labelmap;
     
   }
   
   if (data['colortable']['file']) {
     
     // we have a color table
     colortableParent.colortable.file = data['colortable']['file'].name;
     colortableParent.colortable.filedata = data['colortable']['filedata'];
     
   }
   
   // add the volume
   ren3d.add(volume);
   
  }
  
  if (data['mesh']['file']) {
   
   // we have a mesh
   var mesh = new X.mesh();
   mesh.file = data['mesh']['file'].name;
   mesh.filedata = data['mesh']['filedata'];
   
   if (data['scalars']['file']) {
     
     // we have scalars
     mesh.scalars.file = data['scalars']['file'].name;
     mesh.scalars.filedata = data['scalars']['filedata'];
     
   }
   
   // add the mesh
   ren3d.add(mesh);
   
  }
  
  if (data['fibers']['file']) {
   
   // we have fibers
   var fibers = new X.fibers();
   fibers.file = data['fibers']['file'].name;
   fibers.filedata = data['fibers']['filedata'];
   
   // add the fibers
   ren3d.add(fibers);
   
  }
  
  ren3d.render();

};


