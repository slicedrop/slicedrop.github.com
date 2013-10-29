function loadScene(sceneUrl) {

  // grab the JSON scene
  $
      .ajax({
        url: sceneUrl
      })
      .done(
          function(_scene) {

            if (typeof _scene == "object") {
              scene = _scene;
            } else {
              scene = JSON.parse(_scene);
            }

            // now switch to the viewer
            switchToViewer();

            // init renderers
            initializeRenderers();
            createData();

            if (typeof scene.volume != 'undefined' &&
                typeof scene.volume.file != 'undefined') {
              if (scene.volume.file.length > 0) {

                volume = new X.volume();
                volume.file = scene.volume.file;
                _data.volume.file = volume.file;

                if (typeof scene.labelmap != 'undefined' &&
                    typeof scene.labelmap.file != 'undefined') {
                  if (scene.labelmap.file.length > 0) {

                    volume.labelmap.file = scene.labelmap.file[0];
                    _data.labelmap.file = volume.labelmap.file;

                    if (typeof scene.colortable != 'undefined' &&
                        typeof scene.colortable.file != 'undefined') {
                      if (scene.colortable.file.length > 0) {

                        volume.labelmap.colortable.file = scene.colortable.file[0];
                        _data.colortable.file = volume.labelmap.colortable.file;

                      }
                    }

                  }
                }

                ren3d.add(volume);

              }
            }

            if (typeof scene.mesh != 'undefined' &&
                typeof scene.mesh.file != 'undefined') {
              if (scene.mesh.file.length > 0) {

                mesh = new X.mesh();
                mesh.file = scene.mesh.file;
                _data.mesh.file = mesh.file;

                if (typeof scene.scalars != 'undefined' &&
                    typeof scene.scalars.file != 'undefined') {
                  if (scene.scalars.file.length > 0) {

                    mesh.scalars.file = scene.scalars.file[0];
                    _data.scalars.file = mesh.scalars.file;

                  }
                }

                ren3d.add(mesh);

              }
            }

            if (typeof scene.fibers != 'undefined' &&
                typeof scene.fibers.file != 'undefined') {
              if (scene.fibers.file.length > 0) {

                fibers = new X.fibers();
                fibers.file = scene.fibers.file;
                _data.fibers.file = fibers.file;
                ren3d.add(fibers);

              }
            }

            ren3d.render();

            // check if this scene is already stored on dropbox

            if (sceneUrl.substring(0, 21) == 'http://dl.dropbox.com' || sceneUrl.substring(0,28) == 'http://x.babymri.org/example') {
              // if yes, show the collaborative icons

              // artwork from http://www.iconlet.com/info/94982_download_258x258
              $('#download').show();
              $('#downloadlogo').click(downloadScene);
              // and this artwork is part of the cool jigsoar icons (CC)
              $('#linklogo').click(RT.link);
              $('#linkselectedlogo').click(RT.link);


            } else {

              // if not, show the dropbox icon
              $('#share').show();

            }

            configurator = function() {

              if (typeof scene.camera != 'undefined') {
                // restore the cameras
                ren3d.camera.view = new Float32Array(scene.camera.ren3d);

                if (typeof scene.camera.sliceAx != 'undefined')
                  sliceAx.camera.view = new Float32Array(scene.camera.sliceAx);
                if (typeof scene.camera.sliceSag != 'undefined')
                  sliceSag.camera.view = new Float32Array(scene.camera.sliceSag);
                if (typeof scene.camera.sliceCor != 'undefined')
                  sliceCor.camera.view = new Float32Array(scene.camera.sliceCor);
              }

              //
              // restore the volume settings
              //
              if (typeof scene.volume != 'undefined' &&
                  typeof scene.volume.file != 'undefined') {
                if (scene.volume.file.length > 0) {

                  if (typeof scene.volume.transform != 'undefined') {
                    // the transform
                    volume.transform.matrix = new Float32Array(
                        scene.volume.transform);
                  }

                  if (typeof scene.volume.indexIS != 'undefined') {
                    volume.indexIS = scene.volume.indexIS;
                  }
                  if (typeof scene.volume.indexLR != 'undefined') {
                    volume.indexLR = scene.volume.indexLR;
                  }
                  if (typeof scene.volume.indexPA != 'undefined') {
                    volume.indexPA = scene.volume.indexPA;
                  }
                  jQuery("#yellow_slider").slider("option", "value",
                      volume.indexLR);
                  jQuery("#red_slider")
                      .slider("option", "value", volume.indexAX);
                  jQuery("#green_slider").slider("option", "value",
                      volume.indexPA);

                  if (typeof scene.volume.volumeRendering != 'undefined') {
                    if (scene.volume.volumeRendering) {
                      volume.volumeRendering = true;
                      jQuery('#slicing').removeClass('ui-state-active');
                      jQuery('#volumerendering').addClass('ui-state-active');
                      jQuery('#windowlevel-label').hide();
                      jQuery('#windowlevel-volume').hide();
                      jQuery('#opacity-label').show();
                      jQuery('#opacity-volume').show();

                      if (typeof scene.volume.opacity != 'undefined') {
                        volume.opacity = scene.volume.opacity;
                      }

                    }
                  }
                  jQuery('#opacity-volume').slider("option", "value",
                      volume.opacity * 100);

                  if (typeof scene.volume.lowerThreshold != 'undefined') {
                    volume.lowerThreshold = scene.volume.lowerThreshold;
                  }
                  if (typeof scene.volume.upperThreshold != 'undefined') {
                    volume.upperThreshold = scene.volume.upperThreshold;
                  }
                  jQuery('#threshold-volume').dragslider("option", "values",
                      [volume.lowerThreshold, volume.upperThreshold]);

                  if (typeof scene.volume.windowLow != 'undefined') {
                    volume.windowLow = scene.volume.windowLow;
                  }
                  if (typeof scene.volume.windowHigh != 'undefined') {
                    volume.windowHigh = scene.volume.windowHigh;
                  }
                  jQuery('#windowlevel-volume').dragslider("option", "values",
                      [volume.windowLow, volume.windowHigh]);

                  if (typeof scene.volume.minColor != 'undefined') {
                    volume.minColor = scene.volume.minColor;
                  }
                  var bgColor = ((1 << 24) + (volume.minColor[0] * 255 << 16) +
                      (volume.minColor[1] * 255 << 8) + volume.minColor[2] * 255)
                      .toString(16).substr(1);

                  if (typeof scene.volume.maxColor != 'undefined') {
                    volume.maxColor = scene.volume.maxColor;
                  }
                  var fgColor = ((1 << 24) + (volume.maxColor[0] * 255 << 16) +
                      (volume.maxColor[1] * 255 << 8) + volume.maxColor[2] * 255)
                      .toString(16).substr(1);

                  jQuery('#bgColorVolume').miniColors("value", bgColor);
                  jQuery('#fgColorVolume').miniColors("value", fgColor);

                }
              }

              // restore the labelmap settings
              if (typeof scene.labelmap != 'undefined' &&
                  typeof scene.labelmap.file != 'undefined') {
                if (scene.labelmap.file.length > 0) {

                  if (typeof scene.labelmap.visible != 'undefined') {
                    volume.labelmap.visible = scene.labelmap.visible;
                  }

                  if (!volume.labelmap.visible) {
                    $('#labelmapvisibility').removeClass('show-icon');
                    $('#labelmapvisibility').addClass('hide-icon');
                  }

                  if (typeof scene.labelmap.opacity != 'undefined') {
                    volume.labelmap.opacity = scene.labelmap.opacity;
                  }
                  jQuery('#opacity-labelmap').slider("option", "value",
                      volume.labelmap.opacity * 100);
                }
              }

              //
              // restore the mesh settings
              //
              if (typeof scene.mesh != 'undefined' &&
                  typeof scene.mesh.file != 'undefined') {
                if (scene.mesh.file.length > 0) {

                  if (typeof scene.mesh.transform != 'undefined') {
                    // the transform
                    mesh.transform.matrix = new Float32Array(
                        scene.mesh.transform);
                  }

                  if (typeof scene.mesh.visible != 'undefined') {
                    mesh.visible = scene.mesh.visible;
                  }

                  if (!mesh.visible) {
                    $('#meshvisibility').removeClass('show-icon');
                    $('#meshvisibility').addClass('hide-icon');
                  }

                  if (typeof scene.mesh.opacity != 'undefined') {
                    mesh.opacity = scene.mesh.opacity;
                  }

                  jQuery('#opacity-mesh').slider("option", "value",
                      mesh.opacity * 100);

                  if (typeof scene.mesh.color != 'undefined') {
                    mesh.color = scene.mesh.color;
                  }

                  var meshColor = ((1 << 24) + (mesh.color[0] * 255 << 16) +
                      (mesh.color[1] * 255 << 8) + mesh.color[2] * 255)
                      .toString(16).substr(1);
                  jQuery('#meshColor').miniColors("value", meshColor);

                }
              }

              // restore the scalars settings
              if (typeof scene.scalars != 'undefined' &&
                  typeof scene.scalars.file != 'undefined') {
                if (scene.scalars.file.length > 0) {

                  if (typeof scene.scalars.lowerThreshold != 'undefined') {
                    mesh.scalars.lowerThreshold = scene.scalars.lowerThreshold;
                  }

                  if (typeof scene.scalars.upperThreshold != 'undefined') {
                    mesh.scalars.upperThreshold = scene.scalars.upperThreshold;
                  }
                  jQuery("#threshold-scalars").dragslider(
                      "option",
                      "values",
                      [mesh.scalars.lowerThreshold * 100,
                       mesh.scalars.upperThreshold * 100]);

                  if (typeof scene.scalars.minColor != 'undefined') {
                    mesh.scalars.minColor = scene.scalars.minColor;
                  }
                  var scalarsminColor = ((1 << 24) +
                      (mesh.scalars.minColor[0] * 255 << 16) +
                      (mesh.scalars.minColor[1] * 255 << 8) + mesh.scalars.minColor[2] * 255)
                      .toString(16).substr(1);
                  jQuery('#scalarsMinColor').miniColors("value",
                      scalarsminColor);

                  if (typeof scene.scalars.maxColor != 'undefined') {
                    mesh.scalars.maxColor = scene.scalars.maxColor;
                  }
                  var scalarsmaxColor = ((1 << 24) +
                      (mesh.scalars.maxColor[0] * 255 << 16) +
                      (mesh.scalars.maxColor[1] * 255 << 8) + mesh.scalars.maxColor[2] * 255)
                      .toString(16).substr(1);
                  jQuery('#scalarsMaxColor').miniColors("value",
                      scalarsmaxColor);

                }
              }

              //
              // restore the fiber settings
              //
              if (typeof scene.fibers != 'undefined' &&
                  typeof scene.fibers.file != 'undefined') {
                if (scene.fibers.file.length > 0) {

                  if (typeof scene.fibers.transform != 'undefined') {
                    // the transform
                    fibers.transform.matrix = new Float32Array(
                        scene.fibers.transform);
                  }

                  if (typeof scene.fibers.visible != 'undefined') {
                    fibers.visible = scene.fibers.visible;
                  }
                  if (!fibers.visible) {
                    $('#fibersvisibility').removeClass('show-icon');
                    $('#fibersvisibility').addClass('hide-icon');
                  }

                  if (typeof scene.fibers.lowerThreshold != 'undefined') {
                    fibers.scalars.lowerThreshold = scene.fibers.lowerThreshold;
                  }
                  if (typeof scene.fibers.upperThreshold != 'undefined') {
                    fibers.scalars.upperThreshold = scene.fibers.upperThreshold;
                  }
                  jQuery('#threshold-fibers').dragslider(
                      "option",
                      "values",
                      [fibers.scalars.lowerThreshold,
                       fibers.scalars.upperThreshold]);

                }
              }

              // all files were loaded so re-attach the filedata so the
              // dropbox sharing can work
              if (typeof scene.volume != 'undefined' &&
                  typeof scene.volume.file != 'undefined') {
                if (scene.volume.file.length > 0) {

                  _data.volume.filedata = volume.filedata;

                }
              }
              if (typeof scene.labelmap != 'undefined' &&
                  typeof scene.labelmap.file != 'undefined') {
                if (scene.labelmap.file.length > 0) {

                  _data.labelmap.filedata = volume.labelmap.filedata;

                }
              }
              if (typeof scene.colortable != 'undefined' &&
                  typeof scene.colortable.file != 'undefined') {
                if (scene.colortable.file.length > 0) {

                  _data.colortable.filedata = volume.labelmap.colortable.filedata;

                }
              }
              if (typeof scene.mesh != 'undefined' &&
                  typeof scene.mesh.file != 'undefined') {
                if (scene.mesh.file.length > 0) {

                  _data.mesh.filedata = mesh.filedata;

                }
              }
              if (typeof scene.fibers != 'undefined' &&
                  typeof scene.fibers.file != 'undefined') {
                if (scene.fibers.file.length > 0) {

                  _data.fibers.filedata = fibers.filedata;

                }
              }

            };

          });

}

function downloadScene() {

  var _toDownload = [];

  for ( var d in scene) {

    if (typeof scene[d].file == 'undefined') {
      continue;
    }

    for ( var f in scene[d].file) {

      _toDownload.push(scene[d].file[f]);

    }

  }

  downloadFiles(_toDownload);

}
