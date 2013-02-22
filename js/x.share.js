function initialize_sharing() {

  $('#share').click(share);

};

function share() {

  client = new Dropbox.Client({
    key: "Q60cVmMyg/A=|pQC3I1F1qW3kRyF3Q2s78saA2VpYpQQwBez7IsFKgQ==",
    sandbox: true
  });

  client.authDriver(new Dropbox.Drivers.Popup({
    receiverUrl: "http://chris/d/slicedrop.github.com/loginok.html",
    useQuery: true
  }));

  client.authenticate(function(error, client) {

    if (error) {
      // Replace with a call to your own error-handling code.
      //
      // Don't forget to return from the callback, so you don't execute the code
      // that assumes everything went well.
      return showError(error);
    }

    // Replace with a call to your own application code.
    //
    // The user authorized your app, and everything went well.
    // client is a Dropbox.Client instance that you can use to make API calls.
    client.getUserInfo(function(error, userInfo) {

      if (error) {
        return showError(error); // Something went wrong.
      }

      console.log(userInfo.name);
      //window.document.body.innerHTML += "Hello, " + userInfo.name + "!<br><br>";
    });



  });

};




var showError = function(error) {

  switch (error.status) {
  case Dropbox.ApiError.INVALID_TOKEN:
    // If you're using dropbox.js, the only cause behind this error is that
    // the user token expired.
    // Get the user through the authentication flow again.
    console.log('INVALID TOKEN');
    break;

  case Dropbox.ApiError.NOT_FOUND:
    // The file or folder you tried to access is not in the user's Dropbox.
    // Handling this error is specific to your application.
    console.log('NOT FOUND');
    break;

  case Dropbox.ApiError.OVER_QUOTA:
    // The user is over their Dropbox quota.
    // Tell them their Dropbox is full. Refreshing the page won't help.
    console.log('OVER QUOTA');
    break;

  case Dropbox.ApiError.RATE_LIMITED:
    // Too many API requests. Tell the user to try again later.
    // Long-term, optimize your code to use fewer API calls.
    console.log('RATE LIMITED');
    break;

  case Dropbox.ApiError.NETWORK_ERROR:
    // An error occurred at the XMLHttpRequest layer.
    // Most likely, the user's network connection is down.
    // API calls will not succeed until the user gets back online.
    console.log('NETWORK ERROR');
    break;

  case Dropbox.ApiError.INVALID_PARAM:
  case Dropbox.ApiError.OAUTH_ERROR:
  case Dropbox.ApiError.INVALID_METHOD:
  default:
    // Caused by a bug in dropbox.js, in your application, or in Dropbox.
    // Tell the user an error occurred, ask them to refresh the page.
    console.log('ERROR');
  }
};
