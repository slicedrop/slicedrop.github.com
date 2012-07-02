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
    
    volume.opacity = 0.01;
    jQuery('#opacity-volume').slider("option", "value", 0.01 * 100);
    
    volume.minColor = [0.47843137254901963, 0, 0.4627450980392157];
    volume.maxColor = [0, 0.8392156862745098, 0.8392156862745098];
    
    volume.modified();
    
    fibers.scalars.lowerThreshold = 41;
    jQuery("#threshold-fibers").dragslider("option", "values",
        [41, fibers.scalars.max]);
    
    fibers.transform.matrix = new X.matrix(
        [[1, 0, 0, -130], [0, 6.123031769111886e-17, 1, -110],
         [0, -1, 6.123031769111886e-17, 49.99], [0, 0, 0, 1]]);
    fibers.modified();
    
    ren3d.camera.view = new X.matrix([[-0.33, -0.9, 0.1, 4],
                                      [0.388, -0.034, 0.92, 88],
                                      [-0.85, 0.34, 0.375, -350], [0, 0, 0, 1]]);
    
    sliceX.render();
    sliceY.render();
    sliceZ.render();
    
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
    
    sliceX.render();
    sliceY.render();
    sliceZ.render();
    
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

    sliceX.render();
    sliceY.render();
    sliceZ.render();
    
  };
  
}
