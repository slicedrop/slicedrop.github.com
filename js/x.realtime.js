var RT = RT || {};
RT.linked = false;

RT.link = function() {

  var channelname = 'abcdef';

  var pusher = new Pusher('7d039f97f26780edd35e');
  Pusher.channel_auth_endpoint = 'http://x.babymri.org/auth.php';

  RT._channel = pusher.subscribe('private-' + channelname);

  RT._updater = 1;
  RT._old_view = [1];

  // the events
  RT._channel.bind('client-camera-sync', function(data) {

    eval(data.target).camera.view = new Float32Array(data.value);

  });
  RT._channel.bind('client-volume-sync', function(data) {

    volume[data.target] = data.value;

  });

  // observe the cameras
  RT.observeCamera('ren3d');
  RT.observeCamera('sliceX');
  RT.observeCamera('sliceY');
  RT.observeCamera('sliceZ');

  RT.linked = true;

};

RT.observeCamera = function(renderer) {

  eval(renderer).interactor.onMouseUp = function(e) {
    clearInterval(RT._updater);
  };

  eval(renderer).interactor.onMouseDown = function(e) {
    RT._updater = setInterval(RT.pushCamera.bind(this,renderer), 150);
  };

  eval(renderer).interactor.onMouseWheel = function(e) {

    clearTimeout(RT._updater);
    RT._updater = setTimeout(RT.pushCamera.bind(this,renderer), 150);

  };

};

RT.pushCamera = function(renderer) {

  console.log('push');

  var _current_view = Array.apply([], eval(renderer).camera.view);

  if (!arraysEqual(_current_view, RT._old_view)) {

    RT._channel.trigger('client-camera-sync', {
      'target': renderer,
      'value': _current_view
    });

    RT._old_view = _current_view;

  }

};

RT.pushVolume = function(target, value) {

  RT._channel.trigger('client-volume-sync', {
    'target': target,
    'value': value
  });

};


// compare two arrays
function arraysEqual(arr1, arr2) {

  if (arr1.length !== arr2.length) {
    return false;
  }
  for ( var i = arr1.length; i--;) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}
