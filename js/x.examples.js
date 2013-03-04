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

// load all examples

function load14yrold() {


  // now switch to the viewer
  switchToViewer();

  // init renderers
  initializeRenderers();
  createData();

  // now the fun part..
  volume = new X.volume();
  volume.file = 'http://x.babymri.org/?T1sub.nii';
  _data.volume.file = volume.file;

  fibers = new X.fibers();
  fibers.file = 'http://x.babymri.org/?streamlineres.small.trk';
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

    fibers.transform.flipY();
    fibers.transform.translateX(-125);
    fibers.transform.translateY(-120);
    fibers.transform.translateZ(-120);

    ren3d.camera.view = new Float32Array(
        [-0.5, 0.15, -0.84, 0, -0.8, -0.1, 0.4, 0, 0, 1, 0.2, 0, 10,17,-330,1]);


    ren3d.resetBoundingBox();

  };

}

function loadFile(file) {

  var _file = 'http://x.babymri.org/?' + file;

  if (file.substring(0,4) == 'http') {
    // external url detected
    console.log('Using external data url: ' + file);
    _file = file;
  }

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
    volume.file = _file;
    _data.volume.file = volume.file;
    ren3d.add(volume);

  } else if (_data['mesh']['extensions'].indexOf(_fileExtension) >= 0) {

    // it's a mesh
    mesh = new X.mesh();
    mesh.file = _file;
    _data.mesh.file = mesh.file;
    ren3d.add(mesh);

  } else if (_data['fibers']['extensions'].indexOf(_fileExtension) >= 0) {

    // it's a fibers thingie
    fibers = new X.fibers();
    fibers.file = _file;
    _data.fibers.file = fibers.file;
    ren3d.add(fibers);

  } else {

    throw new Error('Unsupported file type!');

  }

  ren3d.render();

  configurator = function() {

  };

}
