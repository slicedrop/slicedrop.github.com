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

  // LOAD POWERBOOST
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://mpsych.github.io/powerboost/dist/powerboost.min.js";
  document.head.appendChild(script);

  // VOLUME
  if (nv.volumes.length > 0) {

    for(var v in nv.volumes) {

      var volume = nv.volumes[v];

      console.log('Setting up volume', v);

      // TODO add volume tab



      // update threshold slider
      jQuery('#windowlevel-volume').dragslider("option", "max", volume.global_max);
      jQuery('#windowlevel-volume').dragslider("option", "min", volume.global_min);
      jQuery('#windowlevel-volume').dragslider("option", "values",
          [volume.cal_min, volume.cal_max]);


      // RIGHT NOW we only support one volume loaded
      break;

    }








    // // update window/level slider
    // jQuery('#windowlevel-volume').dragslider("option", "max", volume.max);
    // jQuery('#windowlevel-volume').dragslider("option", "min", volume.min);
    // jQuery('#windowlevel-volume').dragslider("option", "values",
    //     [volume.min, volume.max/2]);

    // volume.windowHigh = volume.max/2;



    // update 3d opacity
    jQuery('#opacity-volume').slider("option", "value", 100);
    // volume.opacity = 0.2; // re-propagate
    // volume.modified();

    // update 2d slice sliders
    var dim = volume.range;

    // // ax
    // jQuery("#blue_slider").slider("option", "disabled", false);
    // jQuery("#blue_slider").slider("option", "min", 0);
    // jQuery("#blue_slider").slider("option", "max", dim[2] - 1);
    // jQuery("#blue_slider").slider("option", "value", volume.indexZ);

    // // sag
    // jQuery("#red_slider").slider("option", "disabled", false);
    // jQuery("#red_slider").slider("option", "min", 0);
    // jQuery("#red_slider").slider("option", "max", dim[0] - 1);
    // jQuery("#red_slider").slider("option", "value", volume.indexX);

    // // cor
    // jQuery("#green_slider").slider("option", "disabled", false);
    // jQuery("#green_slider").slider("option", "min", 0);
    // jQuery("#green_slider").slider("option", "max", dim[1] - 1);
    // jQuery("#green_slider").slider("option", "value", volume.indexY);


    // ENABLE THAT TAB
    jQuery('#volume .menu').removeClass('menuDisabled');

  } else {

    // no volume
    jQuery('#volume .menu').addClass('menuDisabled');
    // jQuery("#blue_slider").slider("option", "disabled", true);
    // jQuery("#red_slider").slider("option", "disabled", true);
    // jQuery("#green_slider").slider("option", "disabled", true);

  }

  // LABELMAP
  // if (_data.labelmap.file.length > 0) {
  if (-1 > 0) {

    jQuery('#labelmapSwitch').show();

    jQuery('#opacity-labelmap').slider("option", "value", 40);
    volume.labelmap.opacity = 0.4; // re-propagate


  } else {

    // no labelmap
    jQuery('#labelmapSwitch').hide();

  }


  // MESH
  if (nv.meshes.length > 0) {

    for(var m in nv.meshes) {

      m = nv.meshes[m];

      if (typeof m.fiberLengths === 'undefined') {

        // a real mesh, not fibers

        jQuery('#opacity-mesh').slider("option", "value", 100);
        // mesh.opacity = 1.0; // re-propagate

        // mesh.color = [1, 1, 1];

        jQuery('#mesh .menu').removeClass('menuDisabled');

        // jump out
        // TODO only one mesh supported right now
        break;

      }

    }


  } else {

    // no mesh
    jQuery('#mesh .menu').addClass('menuDisabled');

  }

  // SCALARS
  // if (_data.scalars.file.length > 0) {
  if (-1 > 0) {

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
  // if (_data.fibers.file.length > 0) {
  if (-1 > 0) {

    jQuery('#fibers .menu').removeClass('menuDisabled');

    jQuery("#threshold-fibers").dragslider("option", "min", fibers.scalars.min);
    jQuery("#threshold-fibers").dragslider("option", "max", fibers.scalars.max);
    jQuery("#threshold-fibers").dragslider("option", "values",
        [fibers.scalars.min, fibers.scalars.max]);

  } else {

    // no fibers
    jQuery('#fibers .menu').addClass('menuDisabled');

  }


  // FIBERS
  if (nv.meshes.length > 0) {

    for(var m in nv.meshes) {

      m = nv.meshes[m];

      if (typeof m.fiberLengths !== 'undefined') {

        // Fibers!

        jQuery('#fibers .menu').removeClass('menuDisabled');


        var min_fiberlength = Math.min(...nv.meshes[0].fiberLengths);
        var max_fiberlength = Math.max(...nv.meshes[0].fiberLengths);


        jQuery("#threshold-fibers").dragslider("option", "min", min_fiberlength);
        jQuery("#threshold-fibers").dragslider("option", "max", max_fiberlength);
        jQuery("#threshold-fibers").dragslider("option", "values",
            [min_fiberlength, max_fiberlength]);

        // jump out
        // TODO only one fiber dataset supported right now
        break;

      }

    }


  } else {

    // no mesh
    jQuery('#mesh .menu').addClass('menuDisabled');

  }


  // initialize_sharing();


}

function volumerenderingOnOff(bool) {

  if (bool) {

    nv.setVolumeRenderIllumination(0);

  } else {

    nv.setVolumeRenderIllumination(-1);

  }

  // if (!volume) {
  //   return;
  // }

  // if (bool) {
  //   volume.lowerThreshold = (volume.min + (volume.max/10));
  // }

  // volume.volumeRendering = bool;

  // if (RT.linked) {

  //   clearTimeout(RT._updater);
  //   RT._updater = setTimeout(RT.pushVolume.bind(RT, 'volumeRendering', volume.volumeRendering), 150);
  // }


}

function windowLevelVolume(event, ui) {

  nv.volumes[0].cal_min = ui.values[0];
  nv.volumes[0].cal_max = ui.values[1];
  nv.updateGLVolume();

  // if (!volume) {
  //   return;
  // }

  // volume.lowerThreshold = ui.values[0];
  // volume.upperThreshold = ui.values[1];

  // if (RT.linked) {

  //   clearTimeout(RT._updater);
  //   RT._updater = setTimeout(RT.pushVolume.bind(RT, 'lowerThreshold', volume.lowerThreshold), 150);
  //   clearTimeout(RT._updater2);
  //   RT._updater2 = setTimeout(RT.pushVolume.bind(RT, 'upperThreshold', volume.upperThreshold), 150);

  // }


}

// function windowLevelVolume(event, ui) {

//   nv.setGamma(ui.value);

//   // if (!volume) {
//   //   return;
//   // }

//   // volume.windowLow = ui.values[0];
//   // volume.windowHigh = ui.values[1];

//   // if (RT.linked) {

//   //   clearTimeout(RT._updater);
//   //   RT._updater = setTimeout(RT.pushVolume.bind(RT, 'windowLow', volume.windowLow), 150);
//   //   clearTimeout(RT._updater2);
//   //   RT._updater2 = setTimeout(RT.pushVolume.bind(RT, 'windowHigh', volume.windowHigh), 150);

//   // }


// }

function opacity3dVolume(event, ui) {

  // if (!volume) {
  //   return;
  // }

  nv.setOpacity(0, ui.value / 100);

  // volume.opacity = ui.value / 100;

  // if (RT.linked) {

  //   clearTimeout(RT._updater);
  //   RT._updater = setTimeout(RT.pushVolume.bind(RT, 'opacity', volume.opacity), 150);

  // }


}

// function volumeslicingSag(event, ui) {

//   if (!volume) {
//     return;
//   }

//   volume.indexX = Math
//       .floor(jQuery('#red_slider').slider("option", "value"));

//   if (RT.linked) {

//     clearTimeout(RT._updater);
//     RT._updater = setTimeout(RT.pushVolume.bind(RT, 'indexY', volume.indexX), 150);

//   }

// }

// function volumeslicingAx(event, ui) {

//   if (!volume) {
//     return;
//   }

//   volume.indexZ = Math.floor(jQuery('#blue_slider').slider("option", "value"));

//   if (RT.linked) {

//     clearTimeout(RT._updater);
//     RT._updater = setTimeout(RT.pushVolume.bind(RT, 'indexX', volume.indexZ), 150);

//   }

// }

// function volumeslicingCor(event, ui) {

//   if (!volume) {
//     return;
//   }

//   volume.indexY = Math.floor(jQuery('#green_slider').slider("option", "value"));

//   if (RT.linked) {

//     clearTimeout(RT._updater);
//     RT._updater = setTimeout(RT.pushVolume.bind(RT, 'indexPA', volume.indexY), 150);

//   }

// }

function fgColorVolume(hex, rgb) {

  nv.volumes[0].fgcolor = rgb;

  // if (!volume) {
  //   return;
  // }

  // volume.maxColor = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

  // if (RT.linked) {

  //   clearTimeout(RT._updater);
  //   RT._updater = setTimeout(RT.pushVolume.bind(RT, 'maxColor', volume.maxColor), 150);

  // }

  updateColorMap();

}

function bgColorVolume(hex, rgb) {

  nv.volumes[0].bgcolor = rgb;

  // if (!volume) {
  //   return;
  // }

  // volume.minColor = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

  // if (RT.linked) {

  //   clearTimeout(RT._updater);
  //   RT._updater = setTimeout(RT.pushVolume.bind(RT, 'minColor', volume.minColor), 150);

  // }\

  updateColorMap();

}

function updateColorMap() {




  const cmap = generateColorMap(nv.volumes[0].bgcolor, nv.volumes[0].fgcolor);

  const key = "CustomGradient";
  nv.addColormap(key, cmap);
  nv.volumes[0].colormap = key;
  nv.updateGLVolume();


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

  // if (!mesh) {
  //   return;
  // }

  nv.meshes[0].visible = !nv.meshes[0].visible;
  nv.updateGLVolume();

  // if (RT.linked) {

  //   clearTimeout(RT._updater);
  //   RT._updater = setTimeout(RT.pushMesh.bind(RT, 'visible', mesh.visible), 150);

  // }

}

function meshColor(hex, rgb) {


  nv.setMeshProperty(nv.meshes[0].id, 'rgba255', [rgb.r, rgb.g, rgb.b, 255]);

  // if (!mesh) {
  //   return;
  // }

  // mesh.color = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

  // if (RT.linked) {

  //   clearTimeout(RT._updater);
  //   RT._updater = setTimeout(RT.pushMesh.bind(RT, 'color', mesh.color), 150);

  // }
}

function opacityMesh(event, ui) {

  // if (!mesh) {
  //   return;
  // }

  // mesh.opacity = ui.value / 100;

  // if (RT.linked) {

  //   clearTimeout(RT._updater);
  //   RT._updater = setTimeout(RT.pushMesh.bind(RT, 'opacity', mesh.opacity), 150);

  // }
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

  // if (!fibers) {
  //   return;
  // }

  nv.meshes[0].visible = !nv.meshes[0].visible;
  nv.updateGLVolume();

  // fibers.visible = !fibers.visible;

  // if (RT.linked) {

  //   clearTimeout(RT._updater);
  //   RT._updater = setTimeout(RT.pushFibers.bind(RT, 'visible', fibers.visible), 150);

  // }


}

function thresholdFibers(event, ui) {


  nv.setMeshProperty(
    nv.meshes[0].id,
    "fiberLength",
    ui.values[0]
  );


  // if (!fibers) {
  //   return;
  // }

  // fibers.scalars.lowerThreshold = ui.values[0];
  // fibers.scalars.upperThreshold = ui.values[1];
  // if (RT.linked) {

  //   clearTimeout(RT._updater);
  //   RT._updater = setTimeout(RT.pushFibersScalars.bind(RT, 'lowerThreshold', fibers.scalars.lowerThreshold), 150);
  //   clearTimeout(RT._updater2);
  //   RT._updater2 = setTimeout(RT.pushFibersScalars.bind(RT, 'upperThreshold', fibers.scalars.upperThreshold), 150);

  // }

}
