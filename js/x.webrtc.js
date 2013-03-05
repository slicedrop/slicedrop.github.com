WRTC = {};

WRTC.session = -1;

WRTC.connect = function() {

  var sessionId = WRTC.session;
  
  var _api = '23161912';
  
  // Todo shall be re-generated
  var token = 'T1==cGFydG5lcl9pZD0yMzE2MTkxMiZzZGtfdmVyc2lvbj10YnJ1YnktdGJyYi12MC45MS4yMDExLTAyLTE3JnNpZz1kN2ZkYzJkMDQxYWQ2ZTM2Y2VlNTAyMWQ0ZWJkNWM2NGM2ZmY2NTM3OnJvbGU9bW9kZXJhdG9yJnNlc3Npb25faWQ9MV9NWDR5TXpFMk1Ua3hNbjR4TWpjdU1DNHdMakYtVFc5dUlFMWhjaUF3TkNBeU1Eb3pPRG94TWlCUVUxUWdNakF4TTM0d0xqYzFNVFkxTURkLSZjcmVhdGVfdGltZT0xMzYyNDU4NzE5Jm5vbmNlPTAuNTYzMjM2NzE0NTU1OTc0NyZleHBpcmVfdGltZT0xMzY1MDUwNzE0JmNvbm5lY3Rpb25fZGF0YT0=';
  
  // Initialize session, set up event listeners, and connect
  var session = TB.initSession(sessionId);
  session.addEventListener('sessionConnected', sessionConnectedHandler);
  session.connect(_api, token);
  
  // session.addEventListener("sessionConnected", sessionConnectedHandler);
  session.addEventListener("streamCreated", streamCreatedHandler);

  function sessionConnectedHandler(event) {
    var publisher = TB.initPublisher(_api, 'cams');
    // session.publish(publisher);
    subscribeToStreams(event.streams);
    session.publish(publisher);
  }

  function subscribeToStreams(streams) {
    for (var i = 0; i < streams.length; i++) {
      var stream = streams[i];
      if ( stream.connection.connectionId != session.connection.connectionId ) {
        session.subscribe(stream);
      }
    }
  }

  function streamCreatedHandler(event) {
    subscribeToStreams(event.streams);
  }          

};