function loadScene(sceneUrl) {
  
  // grab the JSON scene
  $.ajax({
    url: sceneUrl
  }).done(function(_scene) {

    scene = _scene;
    
    // now switch to the viewer
    switchToViewer();
    
    console.log(scene);

    // init renderers
    initializeRenderers();
    createData();
    
    if (scene.volume.file.length > 0) {
      
      volume = new X.volume();
      volume.file = scene.volume.file;
      _data.volume.file = volume.file;
      
      if (scene.labelmap.file.length > 0) {
        
        volume.labelmap.file = scene.labelmap.file[0];
        _data.labelmap.file = volume.labelmap.file;
        
        if (scene.colortable.file.length > 0) {
          
          volume.labelmap.colortable.file = scene.colortable.file[0];
          _data.colortable.file = volume.labelmap.colortable.file; 
          
        }
        
      }
      
      ren3d.add(volume);
      
    }
    
    if (scene.mesh.file.length > 0) {
      
      mesh = new X.mesh();
      mesh.file = scene.mesh.file;
      _data.mesh.file = mesh.file;
      
      if (scene.scalars.file.length > 0) {
        
        mesh.scalars.file = scene.scalars.file[0];
        _data.scalars.file = mesh.scalars.file;
        
      }
      
      ren3d.add(mesh);
      
    }
    
    if (scene.fibers.file.length > 0) {
      
      fibers = new X.fibers();
      fibers.file = scene.fibers.file;
      _data.fibers.file = fibers.file;
      ren3d.add(fibers);
      
    }    
    
    ren3d.render();
    
    // show the download icon
    // artwork from http://www.iconlet.com/info/94982_download_258x258
    $('#download').show();
    $('#downloadlogo').click(downloadScene);
    // and this artwork is part of the cool jigsoar icons (CC)
    $('#linklogo').click(RT.link);
    $('#linkselectedlogo').click(RT.link);
    
    configurator = function() {

      // restore the cameras
      ren3d.camera.view = new Float32Array(scene.camera.ren3d);
      sliceX.camera.view = new Float32Array(scene.camera.sliceX);
      sliceY.camera.view = new Float32Array(scene.camera.sliceY);
      sliceZ.camera.view = new Float32Array(scene.camera.sliceZ);
      
      //
      // restore the volume settings
      //
      if (_data.volume.file.length > 0) {
          
        // the transform
        volume.transform.matrix = new Float32Array(scene.volume.transform);
        
        volume.indexX = scene.volume.indexX;
        volume.indexY = scene.volume.indexY;
        volume.indexZ = scene.volume.indexZ;
        jQuery("#yellow_slider").slider("option", "value", volume.indexX);
        jQuery("#red_slider").slider("option", "value", volume.indexY);
        jQuery("#green_slider").slider("option", "value", volume.indexZ);
        
        if (scene.volume.volumeRendering) {
          volume.volumeRendering = true;
          jQuery('#slicing').removeClass('ui-state-active');
          jQuery('#volumerendering').addClass('ui-state-active');
          jQuery('#windowlevel-label').hide();
          jQuery('#windowlevel-volume').hide();
          jQuery('#opacity-label').show();
          jQuery('#opacity-volume').show();
          
          volume.opacity = scene.volume.opacity;
          jQuery('#opacity-volume').slider("option", "value", volume.opacity * 100);          
          
        }
  
        volume.lowerThreshold = scene.volume.lowerThreshold;
        volume.upperThreshold = scene.volume.upperThreshold;
        jQuery('#threshold-volume').dragslider("option", "values", [volume.lowerThreshold, volume.upperThreshold]);
  
        volume.windowLow = scene.volume.windowLow;
        volume.windowHigh = scene.volume.windowHigh;
        jQuery('#windowlevel-volume').dragslider("option", "values", [volume.windowLow, volume.windowHigh]);      
        
        volume.minColor = scene.volume.minColor;
        var bgColor = ((1 << 24) + (volume.minColor[0] * 255 << 16) +
            (volume.minColor[1] * 255 << 8) + volume.minColor[2] * 255)
            .toString(16).substr(1);
  
        volume.maxColor = scene.volume.maxColor;
        var fgColor = ((1 << 24) + (volume.maxColor[0] * 255 << 16) +
            (volume.maxColor[1] * 255 << 8) + volume.maxColor[2] * 255)
            .toString(16).substr(1);
  
        jQuery('#bgColorVolume').miniColors("value", bgColor);
        jQuery('#fgColorVolume').miniColors("value", fgColor);
        
      }
      
      // restore the labelmap settings
      if (_data.labelmap.file.length > 0) {
        volume.labelmap.visible = scene.labelmap.visible;
        if (!volume.labelmap.visible) {
          $('#labelmapvisibility').removeClass('show-icon');
          $('#labelmapvisibility').addClass('hide-icon');
        }
        volume.labelmap.opacity = scene.labelmap.opacity;
        jQuery('#opacity-labelmap').slider("option", "value", volume.labelmap.opacity * 100);
      }
      
      //
      // restore the mesh settings
      //
      if (_data.mesh.file.length > 0) {
        
        // the transform
        mesh.transform.matrix = new Float32Array(scene.mesh.transform);        
        
        mesh.visible = scene.mesh.visible;
        if (!mesh.visible) {
          $('#meshvisibility').removeClass('show-icon');
          $('#meshvisibility').addClass('hide-icon');          
        }
        mesh.opacity = scene.mesh.opacity;
        jQuery('#opacity-mesh').slider("option", "value", mesh.opacity * 100);
        
        mesh.color = scene.mesh.color;
        var meshColor = ((1 << 24) + (mesh.color[0] * 255 << 16) +
            (mesh.color[1] * 255 << 8) + mesh.color[2] * 255)
            .toString(16).substr(1);        
        jQuery('#meshColor').miniColors("value", meshColor);
        
      }
      
      // restore the scalars settings
      if (_data.scalars.file.length > 0) {
        mesh.scalars.lowerThreshold = scene.scalars.lowerThreshold;
        mesh.scalars.upperThreshold = scene.scalars.upperThreshold;
        jQuery("#threshold-scalars").dragslider("option", "values",
            [mesh.scalars.lowerThreshold * 100, mesh.scalars.upperThreshold * 100]);
        
        mesh.scalars.minColor = scene.scalars.minColor;
        var scalarsminColor = ((1 << 24) + (mesh.scalars.minColor[0] * 255 << 16) +
            (mesh.scalars.minColor[1] * 255 << 8) + mesh.scalars.minColor[2] * 255)
            .toString(16).substr(1);        
        jQuery('#scalarsMinColor').miniColors("value", scalarsminColor);
                
        mesh.scalars.maxColor = scene.scalars.maxColor;
        var scalarsmaxColor = ((1 << 24) + (mesh.scalars.maxColor[0] * 255 << 16) +
            (mesh.scalars.maxColor[1] * 255 << 8) + mesh.scalars.maxColor[2] * 255)
            .toString(16).substr(1);        
        jQuery('#scalarsMaxColor').miniColors("value", scalarsmaxColor);
        
      }
      
      //
      // restore the fiber settings
      //
      if (_data.fibers.file.length > 0) {
        
        // the transform
        fibers.transform.matrix = new Float32Array(scene.fibers.transform);        
        
        fibers.visible = scene.fibers.visible;
        if (!fibers.visible) {
          $('#fibersvisibility').removeClass('show-icon');
          $('#fibersvisibility').addClass('hide-icon');          
        }
        
        fibers.scalars.lowerThreshold = scene.fibers.lowerThreshold;
        fibers.scalars.upperThreshold = scene.fibers.upperThreshold;
        jQuery('#threshold-fibers').dragslider("option", "values", [fibers.scalars.lowerThreshold, fibers.scalars.upperThreshold]);       
        
      }
      
      // reset the 3d bounding box
      ren3d.resetBoundingBox();
      
    };
  
  });
  
}

function downloadScene() {
  
  var _toDownload = [];
  
  for (var d in scene) {
    
    for (var f in scene[d].file) {
      
      _toDownload.push(scene[d].file[f]);
      
    }
    
  }
  
  downloadFiles(_toDownload);
  
}