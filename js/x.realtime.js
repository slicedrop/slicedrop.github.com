var RT = RT || {};
RT.linked = false;
RT.channel = null;
RT.pusher = null;

RT.link = function() {

  if ( !RT.linked ) {

    var _location = (window.location != window.parent.location) ? document.referrer
        : document.location;
    // here we make sure that location is a string
    var channelname = 'mydrop-' + btoa((_location+"").split('?')[1]);

    console.log('Linking via channel ' + channelname + '...');

    // Pusher.logToConsole = true; // for debugging

    RT.pusher = new Pusher('bb9db0457c7108272899', {
      cluster: 'us2',
      userAuthentication: { endpoint: "http://x.babymri.org/auth.php"},
      authEndpoint: "http://x.babymri.org/auth.php"
    });

    RT.channel = 'private-' + channelname;
    RT._link = RT.pusher.subscribe(RT.channel);

    RT._updater = 1;
    RT._updater2 = 1;
    RT._old_view = [ 1 ];

    // the events
    RT._link.bind('client-ui-sync', function(data) {

      var _old_2d_content = eval('_current_' + data.container + '_content');
      eval('var cont = '+data.rend+'.container');

      showLarge(jQuery(cont), _old_2d_content);

    });
    RT._link.bind('client-camera-sync', function(data) {

      eval(data.target).camera.view = new Float32Array(data.value);

    });
    RT._link.bind('client-volume-sync', function(data) {

      if (_data.volume.file.length == 0) {
        return;
      }

      volume[data.target] = data.value;

      // propagate back to UI
      jQuery("#yellow_slider").slider("option", "value", volume.indexLR);
      jQuery("#red_slider").slider("option", "value", volume.indexIS);
      jQuery("#green_slider").slider("option", "value", volume.indexPA);

      if (volume.volumeRendering) {
        jQuery('#slicing').removeClass('ui-state-active');
        jQuery('#volumerendering').addClass('ui-state-active');
        jQuery('#windowlevel-label').hide();
        jQuery('#windowlevel-volume').hide();
        jQuery('#opacity-label').show();
        jQuery('#opacity-volume').show();
      } else {
        jQuery('#slicing').addClass('ui-state-active');
        jQuery('#volumerendering').removeClass('ui-state-active');
        jQuery('#windowlevel-label').show();
        jQuery('#windowlevel-volume').show();
        jQuery('#opacity-label').hide();
        jQuery('#opacity-volume').hide();
      }

      jQuery('#opacity-volume').slider("option", "value", volume.opacity * 100);
      jQuery('#threshold-volume').dragslider("option", "values", [volume.lowerThreshold, volume.upperThreshold]);
      jQuery('#windowlevel-volume').dragslider("option", "values", [volume.windowLow, volume.windowHigh]);

      var bgColor = ((1 << 24) + (volume.minColor[0] * 255 << 16) +
          (volume.minColor[1] * 255 << 8) + volume.minColor[2] * 255)
          .toString(16).substr(1);

      var fgColor = ((1 << 24) + (volume.maxColor[0] * 255 << 16) +
          (volume.maxColor[1] * 255 << 8) + volume.maxColor[2] * 255)
          .toString(16).substr(1);

      jQuery('#bgColorVolume').miniColors("value", bgColor);
      jQuery('#fgColorVolume').miniColors("value", fgColor);


    });
    RT._link.bind('client-labelmap-sync', function(data) {

      if (_data.labelmap.file.length == 0) {
        return;
      }

      volume.labelmap[data.target] = data.value;

      // propagate back to UI
      if (!volume.labelmap.visible) {
        $('#labelmapvisibility').removeClass('show-icon');
        $('#labelmapvisibility').addClass('hide-icon');
      } else {
        $('#labelmapvisibility').addClass('show-icon');
        $('#labelmapvisibility').removeClass('hide-icon');
      }
      jQuery('#opacity-labelmap').slider("option", "value", volume.labelmap.opacity * 100);

    });
    RT._link.bind('client-mesh-sync', function(data) {

      if (_data.mesh.file.length == 0) {
        return;
      }

      mesh[data.target] = data.value;

      // propagate back to UI
      if (!mesh.visible) {
        $('#meshvisibility').removeClass('show-icon');
        $('#meshvisibility').addClass('hide-icon');
      } else {
        $('#meshvisibility').addClass('show-icon');
        $('#meshvisibility').removeClass('hide-icon');
      }
      jQuery('#opacity-mesh').slider("option", "value", mesh.opacity * 100);
      var meshColor = ((1 << 24) + (mesh.color[0] * 255 << 16) +
          (mesh.color[1] * 255 << 8) + mesh.color[2] * 255)
          .toString(16).substr(1);
      jQuery('#meshColor').miniColors("value", meshColor);

    });
    RT._link.bind('client-scalars-sync', function(data) {

      if (_data.scalars.file.length == 0) {
        return;
      }

      mesh.scalars[data.target] = data.value;

      // propagate back to UI
      jQuery("#threshold-scalars").dragslider("option", "values",
          [mesh.scalars.lowerThreshold * 100, mesh.scalars.upperThreshold * 100]);

      var scalarsminColor = ((1 << 24) + (mesh.scalars.minColor[0] * 255 << 16) +
          (mesh.scalars.minColor[1] * 255 << 8) + mesh.scalars.minColor[2] * 255)
          .toString(16).substr(1);
      jQuery('#scalarsMinColor').miniColors("value", scalarsminColor);

      var scalarsmaxColor = ((1 << 24) + (mesh.scalars.maxColor[0] * 255 << 16) +
          (mesh.scalars.maxColor[1] * 255 << 8) + mesh.scalars.maxColor[2] * 255)
          .toString(16).substr(1);
      jQuery('#scalarsMaxColor').miniColors("value", scalarsmaxColor);

    });
    RT._link.bind('client-fibers-sync', function(data) {

      if (_data.fibers.file.length == 0) {
        return;
      }

      fibers[data.target] = data.value;

      if (!fibers.visible) {
        $('#fibersvisibility').removeClass('show-icon');
        $('#fibersvisibility').addClass('hide-icon');
      } else {
        $('#fibersvisibility').addClass('show-icon');
        $('#fibersvisibility').removeClass('hide-icon');
      }

    });
    RT._link.bind('client-fibersscalars-sync', function(data) {

      if (_data.fibers.file.length == 0) {
        return;
      }

      fibers.scalars[data.target] = data.value;
      jQuery('#threshold-fibers').dragslider("option", "values", [fibers.scalars.lowerThreshold, fibers.scalars.upperThreshold]);

    });

    // we are online
    RT.linked = true;

    // switch to the blue icon
    $('#linklogo').hide();
    $('#linkselectedlogo').show();

  } else {

    RT.pusher.unsubscribe(RT.channel);

    RT.linked = false;

    // switch to the gray icon
    $('#linkselectedlogo').hide();
    $('#linklogo').show();

  }

};

RT.pushCamera = function(renderer) {

  var _current_view = Array.apply([], eval(renderer).camera.view);

  if ( !arraysEqual(_current_view, RT._old_view) ) {

    RT._link.trigger('client-camera-sync', {
      'target' : renderer,
      'value' : _current_view
    });

    RT._old_view = _current_view;

  }

};

RT.pushVolume = function(target, value) {

  RT._link.trigger('client-volume-sync', {
    'target' : target,
    'value' : value
  });

};

RT.pushLabelmap = function(target, value) {

  RT._link.trigger('client-labelmap-sync', {
    'target' : target,
    'value' : value
  });

};

RT.pushMesh = function(target, value) {

  RT._link.trigger('client-mesh-sync', {
    'target' : target,
    'value' : value
  });

};

RT.pushScalars = function(target, value) {

  RT._link.trigger('client-scalars-sync', {
    'target' : target,
    'value' : value
  });

};

RT.pushFibers = function(target, value) {

  RT._link.trigger('client-fibers-sync', {
    'target' : target,
    'value' : value
  });

};

RT.pushFibersScalars = function(target, value) {

  RT._link.trigger('client-fibersscalars-sync', {
    'target' : target,
    'value' : value
  });

};

RT.pushUI = function(rend, container) {

  RT._link.trigger('client-ui-sync', {
    'rend' : rend,
    'container' : container
  });

};

// compare two arrays
function arraysEqual(arr1, arr2) {

  if ( arr1.length !== arr2.length ) {
    return false;
  }
  for ( var i = arr1.length; i--;) {
    if ( arr1[i] !== arr2[i] ) {
      return false;
    }
  }

  return true;
}
