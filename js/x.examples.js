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

function loadFile(file) {

  // Remove trailing slash so we can detect extension
  if (file.slice(-1) === "/") {
      file = file.slice(0, -1);
  }

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
    _data.volume.file = [volume.file];
    ren3d.add(volume);

  } else if (_data['mesh']['extensions'].indexOf(_fileExtension) >= 0) {

    // it's a mesh
    mesh = new X.mesh();
    mesh.file = _file;
    _data.mesh.file = [mesh.file];
    ren3d.add(mesh);

  } else if (_data['fibers']['extensions'].indexOf(_fileExtension) >= 0) {

    // it's a fibers thingie
    fibers = new X.fibers();
    fibers.file = _file;
    _data.fibers.file = [fibers.file];
    ren3d.add(fibers);

  } else {

    throw new Error('Unsupported file type!');

  }

  ren3d.render();

  configurator = function() {

    // all files were loaded so re-attach the filedata so the
    // dropbox sharing can work
      if (_data.volume.file.length > 0) {

        _data.volume.filedata = [volume.filedata];

      }
      if (_data.mesh.file.length > 0) {

        _data.mesh.filedata = [mesh.filedata];

      }
      if (_data.fibers.file.length > 0) {

        _data.fibers.filedata = [fibers.filedata];

      }

      // show the dropbox icon
      $('#share').show();

  };

}
