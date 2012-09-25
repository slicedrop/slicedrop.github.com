// load all examples

function load14yrold() {

  
  // now switch to the viewer
  switchToViewer();
  
  // init renderers
  initializeRenderers();
  createData();
  
  // now the fun part..
  volume = new X.volume();
  volume.file = 'http://x.babymri.org/?T1sub.mgh';
  _data.volume.file = volume.file;
  
  fibers = new X.fibers();
  fibers.file = 'http://x.babymri.org/?streamlineres.trk';
  _data.fibers.file = fibers.file;
  
  ren3d.add(volume);
  ren3d.add(fibers);
  
  ren3d.render();
  
  configurator = function() {

    volume.volumeRendering = true;
    jQuery('#slicing').removeClass('ui-state-active');
    jQuery('#volumerendering').addClass('ui-state-active');
    jQuery('#windowlevel-label').hide();
    jQuery('#windowlevel-volume').hide();
    jQuery('#opacity-label').show();
    jQuery('#opacity-volume').show();
    
    volume.lowerThreshold = 7;
    jQuery('#threshold-volume').dragslider("option", "values", [7, volume.max]);
    
    volume.opacity = 0.05;
    jQuery('#opacity-volume').slider("option", "value", 0.01 * 100);
    
    volume.minColor = [0.47843137254901963, 0, 0.4627450980392157];
    var bgColor = ((1 << 24) + (volume.minColor[0] * 255 << 16) +
        (volume.minColor[1] * 255 << 8) + volume.minColor[2] * 255)
        .toString(16).substr(1);
    
    volume.maxColor = [0, 0.8392156862745098, 0.8392156862745098];
    var fgColor = ((1 << 24) + (volume.maxColor[0] * 255 << 16) +
        (volume.maxColor[1] * 255 << 8) + volume.maxColor[2] * 255)
        .toString(16).substr(1);
    
    jQuery('#bgColorVolume').miniColors("value", bgColor);
    jQuery('#fgColorVolume').miniColors("value", fgColor);
    
    volume.modified();
    
    fibers.scalars.lowerThreshold = 41;
    jQuery("#threshold-fibers").dragslider("option", "values",
        [41, fibers.scalars.max]);
    
    fibers.transform.matrix = new X.matrix(
        [[1, 0, 0, -130], [0, 6.123031769111886e-17, 1, -130],
         [0, -1, 6.123031769111886e-17, 130], [0, 0, 0, 1]]);
    fibers.modified();
    
    ren3d.camera.view = new X.matrix(
        [[-0.5093217615929089, -0.8570143021091494, -0.07821655290449646, 10],
         [0.15980913879519168, -0.1834973848251334, 0.9699431678814355, 17],
         [-0.8456077000154597, 0.48151344295118087, 0.23041792884205461, -330],
         [0, 0, 0, 1]]);
    
    ren3d.resetBoundingBox();
    
  };
  
}

function loadAvf() {

  // now switch to the viewer
  switchToViewer();
  
  // init renderers
  initializeRenderers();
  createData();
  
  // now the fun part
  volume = new X.volume();
  volume.file = 'http://x.babymri.org/?avf.nrrd';
  _data.volume.file = volume.file;
  
  mesh = new X.mesh();
  mesh.file = 'http://x.babymri.org/?avf.vtk';
  mesh.opacity = 0.8;
  _data.mesh.file = mesh.file;
  
  ren3d.add(volume);
  ren3d.add(mesh);
  
  ren3d.render();
  
  configurator = function() {

    mesh.opacity = 0.6;
    jQuery('#opacity-mesh').slider("option", "value", 60);
    
    volume.windowHigh = 1000;
    jQuery('#windowlevel-volume').dragslider("option", "values", [0, 1000]);
    
  };
  
}

function load2yrold() {

  // now switch to the viewer
  switchToViewer();
  
  // init renderers
  initializeRenderers();
  createData();
  
  // now the fun part, yahoooo
  mesh = new X.mesh();
  mesh.file = 'http://x.babymri.org/?lh.smoothwm';
  _data.mesh.file = mesh.file;
  mesh.scalars.file = 'http://x.babymri.org/?lh.smoothwm.C.crv';
  _data.scalars.file = mesh.scalars.file;
  
  ren3d.add(mesh);
  
  ren3d.render();
  
  configurator = function() {

    mesh.scalars.lowerThreshold = 0.11;
    
  };
  
}

function loadBrainstem() {

  // now switch to the viewer
  switchToViewer();
  
  // init renderers
  initializeRenderers();
  createData();
  
  // now the fun part, arrrr
  volume = new X.volume();
  volume.file = 'http://x.babymri.org/?vol.nrrd';
  volume.labelmap.file = 'http://x.babymri.org/?seg.nrrd';
  volume.labelmap.colortable.file = 'http://x.babymri.org/?genericanatomy.txt';
  _data.volume.file = volume.file;
  _data.labelmap.file = volume.labelmap.file;
  
  ren3d.add(volume);
  
  ren3d.render();
  
  configurator = function() {

  };
  
}

function loadFile(file) {

  // now switch to the viewer
  switchToViewer();
  
  // init renderers
  initializeRenderers();
  
  createData();
  
  var _fileExtension = file.split('.').pop().toUpperCase();
  
  // check which type of file it is
  if (_data['volume']['extensions'].indexOf(_fileExtension) >= 0) {
    
    // it's a volume
    volume = new X.volume();
    volume.file = 'http://x.babymri.org/?' + file;
    _data.volume.file = volume.file;
    if (__labelmap) {
      volume.labelmap.file = volume.file.replace('template', 'labelmap');
      volume.labelmap.colortable.file = 'http://x.babymri.org/?genericanatomy.txt';
      volume.labelmap.opacity = 0.7;
      
    }
    volume.lowerThreshold = 75;
    ren3d.add(volume);
    
  } else if (_data['mesh']['extensions'].indexOf(_fileExtension) >= 0) {
    
    // it's a mesh
    mesh = new X.mesh();
    mesh.file = 'http://x.babymri.org/?' + file;
    _data.mesh.file = mesh.file;
    ren3d.add(mesh);
    
  } else if (_data['fibers']['extensions'].indexOf(_fileExtension) >= 0) {
    
    // it's a fibers thingie
    fibers = new X.fibers();
    fibers.file = 'http://x.babymri.org/?' + file;
    _data.fibers.file = fibers.file;
    ren3d.add(fibers);
    
  } else {
    
    throw new Error('Unsupported file type!');
    
  }
  
  ren3d.render();
  
  configurator = function() {

    volume.windowLow = 80;
    jQuery('#windowlevel-volume').dragslider("option", "values",
        [volume.windowLow, volume.windowHigh]);
    jQuery('#threshold-volume').dragslider("option", "values",
        [volume.lowerThreshold, volume.upperThreshold]);
    
    if (__labelmap) {
      // activate the UI for labelmaps
      jQuery('#labelmapSwitch').show();
      jQuery('#opacity-labelmap').slider("option", "value", 40);
    }
    
  };
  
}

function loadVentricles() {

  if (typeof _ventricles !== 'undefined') {
    
    _ventricles.visible = !_ventricles.visible;
    return;
    
  }
  
  _ventricles = new X.mesh();
  _ventricles.file = 'http://x.babymri.org/?' + _week + '/ventricles.vtk';
  _ventricles.color = [0, 0, 1];
  
  ren3d.onShowtime = function() {

    _ventricles.transform.matrix = new X.matrix([[1, 0, 0, 0], [0, 0, -1, 0],
                                                 [0, 1, 0, 0], [0, 0, 0, 1]]);
    
  };
  
  ren3d.add(_ventricles);
  jQuery('#sliceZ').css('position', 'absolute');
  
}

function loadCortex() {

  if (typeof _cortex !== 'undefined') {
    
    _cortex.visible = !_cortex.visible;
    return;
    
  }
  
  _cortex = new X.mesh();
  _cortex.file = 'http://x.babymri.org/?' + _week + '/cortex.vtk';
  _cortex.color = [0, 1, 0];
  _cortex.opacity = 0.5;
  
  ren3d.onShowtime = function() {

    jQuery('#sliceZ').css('position', 'absolute');
    _cortex.transform.matrix = new X.matrix([[1, 0, 0, 0], [0, 0, -1, 0],
                                             [0, 1, 0, 0], [0, 0, 0, 1]]);
    
  };
  
  ren3d.add(_cortex);
  
}

function loadLabelmap() {

  if (__labelmap) {
    
    volume.labelmap.visible = !volume.labelmap.visible;
    return;
    

  }
  
  location.href = "index.html?" + _week + '.labelmap';
  
}
