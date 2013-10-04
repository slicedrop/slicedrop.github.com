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

/**
 * Setup all UI elements once the loading was completed.
 */
function setupUi() {

  // VOLUME
  if (_data.volume.file.length > 0) {

    // update threshold slider
    jQuery('#threshold-volume').dragslider("option", "max", volume.max);
    jQuery('#threshold-volume').dragslider("option", "min", volume.min);
    jQuery('#threshold-volume').dragslider("option", "values",
        [volume.min, volume.max]);

    // update window/level slider
    jQuery('#windowlevel-volume').dragslider("option", "max", volume.max);
    jQuery('#windowlevel-volume').dragslider("option", "min", volume.min);
    jQuery('#windowlevel-volume').dragslider("option", "values",
        [volume.min, volume.max/2]);

    volume.windowHigh = volume.max/2;

    // update 3d opacity
    jQuery('#opacity-volume').slider("option", "value", 20);
    volume.opacity = 0.2; // re-propagate
    volume.modified();

    // update 2d slice sliders
    var dim = volume.range;

    // ax
    jQuery("#blue_slider").slider("option", "disabled", false);
    jQuery("#blue_slider").slider("option", "min", 0);
    jQuery("#blue_slider").slider("option", "max", dim[2] - 1);
    jQuery("#blue_slider").slider("option", "value", volume.indexZ);

    // sag
    jQuery("#red_slider").slider("option", "disabled", false);
    jQuery("#red_slider").slider("option", "min", 0);
    jQuery("#red_slider").slider("option", "max", dim[0] - 1);
    jQuery("#red_slider").slider("option", "value", volume.indexX);

    // cor
    jQuery("#green_slider").slider("option", "disabled", false);
    jQuery("#green_slider").slider("option", "min", 0);
    jQuery("#green_slider").slider("option", "max", dim[1] - 1);
    jQuery("#green_slider").slider("option", "value", volume.indexY);


    jQuery('#volume .menu').removeClass('menuDisabled');

  } else {

    // no volume
    jQuery('#volume .menu').addClass('menuDisabled');
    jQuery("#blue_slider").slider("option", "disabled", true);
    jQuery("#red_slider").slider("option", "disabled", true);
    jQuery("#green_slider").slider("option", "disabled", true);

  }

  // LABELMAP
  if (_data.labelmap.file.length > 0) {

    jQuery('#labelmapSwitch').show();

    jQuery('#opacity-labelmap').slider("option", "value", 40);
    volume.labelmap.opacity = 0.4; // re-propagate


  } else {

    // no labelmap
    jQuery('#labelmapSwitch').hide();

  }


  // MESH
  if (_data.mesh.file.length > 0) {

    jQuery('#opacity-mesh').slider("option", "value", 100);
    mesh.opacity = 1.0; // re-propagate

    mesh.color = [1, 1, 1];

    jQuery('#mesh .menu').removeClass('menuDisabled');

  } else {

    // no mesh
    jQuery('#mesh .menu').addClass('menuDisabled');

  }

  // SCALARS
  if (_data.scalars.file.length > 0) {

    var combobox = document.getElementById("scalars-selector");
    combobox.value = 'Scalars 1';

    jQuery("#threshold-scalars").dragslider("option", "disabled", false);
    jQuery("#threshold-scalars").dragslider("option", "min",
        mesh.scalars.min * 100);
    jQuery("#threshold-scalars").dragslider("option", "max",
        mesh.scalars.max * 100);
    jQuery("#threshold-scalars").dragslider("option", "values",
        [mesh.scalars.min * 100, mesh.scalars.max * 100]);

  } else {

    var combobox = document.getElementById("scalars-selector");
    combobox.disabled = true;
    jQuery("#threshold-scalars").dragslider("option", "disabled", true);

  }

  // FIBERS
  if (_data.fibers.file.length > 0) {

    jQuery('#fibers .menu').removeClass('menuDisabled');

    jQuery("#threshold-fibers").dragslider("option", "min", fibers.scalars.min);
    jQuery("#threshold-fibers").dragslider("option", "max", fibers.scalars.max);
    jQuery("#threshold-fibers").dragslider("option", "values",
        [fibers.scalars.min, fibers.scalars.max]);

  } else {

    // no fibers
    jQuery('#fibers .menu').addClass('menuDisabled');

  }

  // store the renderer layout
  _current_3d_content = ren3d;
  _current_Ax_content = sliceAx;
  _current_Sag_content = sliceSag;
  _current_Cor_content = sliceCor;


  if (!_webgl_supported) {



  }

  initialize_sharing();


}

function volumerenderingOnOff(bool) {

  if (!volume) {
    return;
  }

  if (bool) {
    volume.lowerThreshold = (volume.min + (volume.max/10));
  }

  volume.volumeRendering = bool;

  if (RT.linked) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushVolume.bind(RT, 'volumeRendering', volume.volumeRendering), 150);
  }


}

function thresholdVolume(event, ui) {

  if (!volume) {
    return;
  }

  volume.lowerThreshold = ui.values[0];
  volume.upperThreshold = ui.values[1];

  if (RT.linked) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushVolume.bind(RT, 'lowerThreshold', volume.lowerThreshold), 150);
    clearTimeout(RT._updater2);
    RT._updater2 = setTimeout(RT.pushVolume.bind(RT, 'upperThreshold', volume.upperThreshold), 150);

  }


}

function windowLevelVolume(event, ui) {

  if (!volume) {
    return;
  }

  volume.windowLow = ui.values[0];
  volume.windowHigh = ui.values[1];

  if (RT.linked) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushVolume.bind(RT, 'windowLow', volume.windowLow), 150);
    clearTimeout(RT._updater2);
    RT._updater2 = setTimeout(RT.pushVolume.bind(RT, 'windowHigh', volume.windowHigh), 150);

  }


}

function opacity3dVolume(event, ui) {

  if (!volume) {
    return;
  }

  volume.opacity = ui.value / 100;

  if (RT.linked) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushVolume.bind(RT, 'opacity', volume.opacity), 150);

  }


}

function volumeslicingSag(event, ui) {

  if (!volume) {
    return;
  }

  volume.indexX = Math
      .floor(jQuery('#red_slider').slider("option", "value"));

  if (RT.linked) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushVolume.bind(RT, 'indexY', volume.indexX), 150);

  }

}

function volumeslicingAx(event, ui) {

  if (!volume) {
    return;
  }

  volume.indexZ = Math.floor(jQuery('#blue_slider').slider("option", "value"));

  if (RT.linked) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushVolume.bind(RT, 'indexX', volume.indexZ), 150);

  }

}

function volumeslicingCor(event, ui) {

  if (!volume) {
    return;
  }

  volume.indexY = Math.floor(jQuery('#green_slider').slider("option", "value"));

  if (RT.linked) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushVolume.bind(RT, 'indexPA', volume.indexY), 150);

  }

}

function fgColorVolume(hex, rgb) {

  if (!volume) {
    return;
  }

  volume.maxColor = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

  if (RT.linked) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushVolume.bind(RT, 'maxColor', volume.maxColor), 150);

  }

}

function bgColorVolume(hex, rgb) {

  if (!volume) {
    return;
  }

  volume.minColor = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

  if (RT.linked) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushVolume.bind(RT, 'minColor', volume.minColor), 150);

  }

}

//
// LABELMAP
//
function opacityLabelmap(event, ui) {

  if (!volume) {
    return;
  }

  volume.labelmap.opacity = ui.value / 100;

  if (RT.linked) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushLabelmap.bind(RT, 'opacity', volume.labelmap.opacity), 150);

  }

}

function toggleLabelmapVisibility() {

  if (!volume) {
    return;
  }

  volume.labelmap.visible = !volume.labelmap.visible;

  if (RT.linked) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushLabelmap.bind(RT, 'visible', volume.labelmap.visible), 150);

  }

}

//
// MESH
//
function toggleMeshVisibility() {

  if (!mesh) {
    return;
  }

  mesh.visible = !mesh.visible;

  if (RT.linked) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushMesh.bind(RT, 'visible', mesh.visible), 150);

  }

}

function meshColor(hex, rgb) {

  if (!mesh) {
    return;
  }

  mesh.color = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

  if (RT.linked) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushMesh.bind(RT, 'color', mesh.color), 150);

  }
}

function opacityMesh(event, ui) {

  if (!mesh) {
    return;
  }

  mesh.opacity = ui.value / 100;

  if (RT.linked) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushMesh.bind(RT, 'opacity', mesh.opacity), 150);

  }
}

function thresholdScalars(event, ui) {

  if (!mesh) {
    return;
  }

  mesh.scalars.lowerThreshold = ui.values[0] / 100;
  mesh.scalars.upperThreshold = ui.values[1] / 100;

  if (RT.linked) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushScalars.bind(RT, 'lowerThreshold', mesh.scalars.lowerThreshold), 150);
    clearTimeout(RT._updater2);
    RT._updater2 = setTimeout(RT.pushScalars.bind(RT, 'upperThreshold', mesh.scalars.upperThreshold), 150);

  }

}

function scalarsMinColor(hex, rgb) {

  if (!mesh) {
    return;
  }

  mesh.scalars.minColor = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

  if (RT.linked) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushScalars.bind(RT, 'minColor', mesh.scalars.minColor), 150);

  }

}

function scalarsMaxColor(hex, rgb) {

  if (!mesh) {
    return;
  }

  mesh.scalars.maxColor = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

  if (RT.linked) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushScalars.bind(RT, 'maxColor', mesh.scalars.maxColor), 150);

  }

}

//
// Fibers
//
function toggleFibersVisibility() {

  if (!fibers) {
    return;
  }

  fibers.visible = !fibers.visible;

  if (RT.linked) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushFibers.bind(RT, 'visible', fibers.visible), 150);

  }


}

function thresholdFibers(event, ui) {

  if (!fibers) {
    return;
  }

  fibers.scalars.lowerThreshold = ui.values[0];
  fibers.scalars.upperThreshold = ui.values[1];
  if (RT.linked) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushFibersScalars.bind(RT, 'lowerThreshold', fibers.scalars.lowerThreshold), 150);
    clearTimeout(RT._updater2);
    RT._updater2 = setTimeout(RT.pushFibersScalars.bind(RT, 'upperThreshold', fibers.scalars.upperThreshold), 150);

  }

}
