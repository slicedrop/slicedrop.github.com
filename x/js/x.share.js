function initialize_sharing() {

  $('#sharelogo').click(share);

};

// entry point when user clicks on "share via Dropbox"
function share() {

  // browser compatibility fix for window.location.origin
  if (!window.location.origin){window.location.origin = window.location.protocol+"//"+window.location.host;}

  var client = new Dropbox.Client({
    // this key has to change for each app
    key : "Q60cVmMyg/A=|pQC3I1F1qW3kRyF3Q2s78saA2VpYpQQwBez7IsFKgQ==",
    sandbox : true
  });

  // first step is authorization with Dropbox
  authorize(client);

}

function authorize(client) {

  client.authDriver(new Dropbox.Drivers.Popup({
    receiverUrl : window.location.origin + window.location.pathname + "/loginok.html",
    useQuery : true
  }));

  $('#sharemsg').show();
  $('#sharemsg').html('Authorizing.. (Please enable pop-ups!)');

  client.authenticate(function(error, client) {

    if ( error ) {
      return showError(error);
    }

    // second step is to display user information
    displayUserInfo(client);

  });

}

function displayUserInfo(client) {

  client.getUserInfo(function(error, userInfo) {

    if ( error ) {
      return showError(error);
    }

    $('#sharemsg').html('Hi, ' + userInfo.name + '!');

    // third step is to create the scene folder
    createSceneFolder(client);

  });

}

function createSceneFolder(client) {

  // create the scene folder (date and time stamped)
  var now = new Date();
  var foldername = now.getFullYear() + '-' + (now.getMonth() + 1) + '-'
      + now.getDate() + '_' + now.getHours() + '-' + now.getMinutes() + '-'
      + now.getSeconds();
  client.mkdir(foldername, function(error) {

    if ( error ) {
      return showError(error);
    }

    // next step is to upload data
    uploadData(client, foldername);

  });

}

function uploadData(client, foldername) {

  // now schedule the data to upload
  var _toUpload = [];

  for ( var d in _data) {

    for ( var f in _data[d].filedata) {

      var _filename = '';
      var _filedata = '';

      if (typeof _data[d].file[f] == "string") {

        // this means the data was not 'dropped'
        // therefor, we don't have HTML5 File objects here

        _filename = basename(_data[d].file[f]);
        _filedata = _data[d].filedata[f];

      } else {

        _filename = _data[d].file[f].name;
        _filedata = _data[d].file[f];

      }

      // if there is no file extension, be sure to pass .DCM
      // since it is DICOM
      var _fileExtension = _filename.split('.').pop().toUpperCase();

      // check for files with no extension
      if ( _fileExtension == _filename.toUpperCase() ) {

        // this must be dicom
        _filename += '.DCM';

      }

      _toUpload.push([ d, _filename, _filedata]);

    }

  }

  if ( _toUpload.length == 0 ) {

    // no data to upload
    $('#sharemsg').html('Examples can not be shared.');
    return;

  }

  var _pending = _toUpload.length;

  $('#sharemsg').html($('#sharemsg').html() + '<br>Uploading... ');

  // do the upload
  for ( var u in _toUpload) {

    u = _toUpload[u];

    // write data
    client.writeFile(foldername + '/' + u[1], u[2], function(error, stat) {

      if ( error ) {
        return showError(error);
      }

      _pending--;

      if ( _pending == 0 ) {

        // all data files uploaded
        $('#sharemsg').html($('#sharemsg').html() + 'Done!');
        writeScene(client, foldername, _toUpload);

      }

    });

  }

}

/**
 * Here we create the scene which later gets parsed by Slice:Drop again.
 */
function writeScene(client, foldername, _toUpload) {

  // then we store a JSON scene
  var _scene = {
    camera : {
      ren3d : Array.apply([], ren3d.camera.view),
      sliceAx : Array.apply([], sliceAx.camera.view),
      sliceSag : Array.apply([], sliceSag.camera.view),
      sliceCor : Array.apply([], sliceCor.camera.view)
    },
    volume : {
      file : []
    },
    labelmap : {
      file : []
    },
    colortable : {
      file : []
    },
    mesh : {
      file : []
    },
    scalars : {
      file : []
    },
    fibers : {
      file : []
    }
  };

  // store properties regarding volume, mesh, fibers
  if ( _data.volume.file.length > 0 ) {

    _scene.volume.indexIS = volume.indexIS;
    _scene.volume.indexLR = volume.indexLR;
    _scene.volume.indexPA = volume.indexPA;
    _scene.volume.lowerThreshold = volume.lowerThreshold;
    _scene.volume.upperThreshold = volume.upperThreshold;
    _scene.volume.opacity = volume.opacity;
    _scene.volume.windowLow = volume.windowLow;
    _scene.volume.windowHigh = volume.windowHigh;
    _scene.volume.minColor = volume.minColor;
    _scene.volume.maxColor = volume.maxColor;
    _scene.volume.volumeRendering = volume.volumeRendering;
    _scene.volume.transform = Array.apply([], volume.transform.matrix);

  }

  if ( _data.labelmap.file.length > 0 ) {
    _scene.labelmap.visible = volume.labelmap.visible;
    _scene.labelmap.opacity = volume.labelmap.opacity;
  }

  if ( _data.mesh.file.length > 0 ) {
    _scene.mesh.visible = mesh.visible;
    _scene.mesh.opacity = mesh.opacity;
    _scene.mesh.color = mesh.color;
    _scene.mesh.transform = Array.apply([], mesh.transform.matrix);
  }

  if ( _data.scalars.file.length > 0 ) {
    _scene.scalars.lowerThreshold = mesh.scalars.lowerThreshold;
    _scene.scalars.upperThreshold = mesh.scalars.upperThreshold;
    _scene.scalars.minColor = mesh.scalars.minColor;
    _scene.scalars.maxColor = mesh.scalars.maxColor;
  }

  if ( _data.fibers.file.length > 0 ) {
    _scene.fibers.visible = fibers.visible;
    _scene.fibers.lowerThreshold = fibers.scalars.lowerThreshold;
    _scene.fibers.upperThreshold = fibers.scalars.upperThreshold;
    _scene.fibers.transform = Array.apply([], fibers.transform.matrix);
  }

  //
  // now attach the files (as urls)..
  //
  var _pending = _toUpload.length;

  // special case to detect a labelmap
  var labelmap = '';
  if ( _data.labelmap.file.length > 0 ) {
    labelmap = _data.labelmap.file[0].name;
  }

  for ( var u in _toUpload) {

    u = _toUpload[u];

    // generate the urls for each file
    client.makeUrl(foldername + '/' + u[1], {
      downloadHack : true
    }, function(error, url) {

      if ( error ) {
        return showError(error);
      }

      var _url = url.url;

      var type = '';

      // check if this is a labelmap
      if ( labelmap != '' ) {

        // compare the filename
        if ( labelmap == _url.split('/').pop() ) {
          type = 'labelmap';
        }

      }

      if ( type == '' ) {

        // we need to re-identify the type for scene storage
        var _fileExtension = _url.split('.').pop().toUpperCase();

        for ( var d in _data) {

          if ( _data[d]['extensions'].indexOf(_fileExtension) >= 0 ) {
            // found the type
            type = d;
            break;

          }

        }

      }

      // .. and store them
      _scene[type].file.push(_url);

      _pending--;

      if ( _pending == 0 ) {

        // all urls are collected, we write now the JSON scene
        var _sceneJSON = JSON.stringify(_scene);
        // HTTPS won't work without a warning during loading
        _sceneJSON = _sceneJSON.replace(/https/g, 'http');

        client.writeFile(foldername + '/scene.json', _sceneJSON, function(
            error, stat) {

          if ( error ) {
            return showError(error);
          }

          client.makeUrl(foldername + '/scene.json', {
            downloadHack : true
          }, function(error, url) {

            $('#sharemsg').html($('#sharemsg').html() + '<br>Scene stored!');

            var _sceneUrl = url.url;

            createShortURL('http://slicedrop.com/?scene=' + _sceneUrl);

          });

        });

      }

    });

  }

}

function createShortURL(url) {

  url = url.replace(/https/g, 'http');

  // query for a short URL
  $.ajax({
    url : 'http://jvf.li/api/shorten?longurl=' + encodeURIComponent(url)
  }).done(
      function(shorturl) {
        // display the short URL

        shorturl = shorturl.replace('jvf.li/', 'my.slicedrop.com/?');

        $('#sharemsg').html(
            $('#sharemsg').html() + '<br><a href="' + shorturl
                + '" target=_blank><span style="font-size:14px;color:red;">'
                + shorturl + '</span></a>');
      });

}

var showError = function(error) {

  switch (error.status) {
  case Dropbox.ApiError.INVALID_TOKEN:
    // If you're using dropbox.js, the only cause behind this error is that
    // the user token expired.
    // Get the user through the authentication flow again.
    $('#sharemsg').html('Authorization failed!');
    break;

  case Dropbox.ApiError.NOT_FOUND:
    // The file or folder you tried to access is not in the user's Dropbox.
    // Handling this error is specific to your application.
    $('#sharemsg').html('File not found!');
    break;

  case Dropbox.ApiError.OVER_QUOTA:
    // The user is over their Dropbox quota.
    // Tell them their Dropbox is full. Refreshing the page won't help.
    $('#sharemsg').html('Your dropbox is full!');
    break;

  case Dropbox.ApiError.RATE_LIMITED:
    // Too many API requests. Tell the user to try again later.
    // Long-term, optimize your code to use fewer API calls.
    $('#sharemsg').html('Too many API calls!');
    break;

  case Dropbox.ApiError.NETWORK_ERROR:
    // An error occurred at the XMLHttpRequest layer.
    // Most likely, the user's network connection is down.
    // API calls will not succeed until the user gets back online.
    $('#sharemsg').html('Network error!');
    break;

  case Dropbox.ApiError.INVALID_PARAM:
  case Dropbox.ApiError.OAUTH_ERROR:
  case Dropbox.ApiError.INVALID_METHOD:
  default:
    // Caused by a bug in dropbox.js, in your application, or in Dropbox.
    // Tell the user an error occurred, ask them to refresh the page.
    $('#sharemsg').html('There was an error!');
  }
  $('#sharemsg').html($('#sharemsg').html() + '<br>Please try again!');
};

// from php.js
function basename (path, suffix) {
  // http://kevin.vanzonneveld.net
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: Ash Searle (http://hexmen.com/blog/)
  // +   improved by: Lincoln Ramsay
  // +   improved by: djmix
  // *     example 1: basename('/www/site/home.htm', '.htm');
  // *     returns 1: 'home'
  // *     example 2: basename('ecra.php?p=1');
  // *     returns 2: 'ecra.php?p=1'
  var b = path.replace(/^.*[\/\\]/g, '');

  if (typeof(suffix) == 'string' && b.substr(b.length - suffix.length) == suffix) {
    b = b.substr(0, b.length - suffix.length);
  }

  return b;
}
