var RT = RT || {};
RT.linked = false;
RT.channel = null;
RT.pusher = null;

RT.link = function() {

  if ( !RT.linked ) {

    var _location = (window.location != window.parent.location) ? document.referrer
        : document.location;
    // here we make sure that location is a string
    var channelname = 'mydrop-' + (_location+"").split('?')[1];

    console.log('Linking via channel ' + channelname + '...');

    RT.pusher = new Pusher('7d039f97f26780edd35e');
    Pusher.channel_auth_endpoint = 'http://x.babymri.org/auth.php';

    RT.channel = 'private-' + channelname;
    RT._link = RT.pusher.subscribe(RT.channel);

    RT._updater = 1;
    RT._updater2 = 1;
    RT._old_view = [ 1 ];

    // the events
    RT._link.bind('client-camera-sync', function(data) {
      
      eval(data.target).camera.view = new Float32Array(data.value);

    });
    RT._link.bind('client-volume-sync', function(data) {

      if (_data.volume.file.length == 0) return;
      
      volume[data.target] = data.value;

    });
    RT._link.bind('client-labelmap-sync', function(data) {

      if (_data.labelmap.file.length == 0) return;
      
      volume.labelmap[data.target] = data.value;

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
