// 
// X
//
window = {}; // window is not known to workers
importScripts('xtk_edge.js');

//
// LOADING
//
function load(url, callback) {

  var xhr = new XMLHttpRequest();
  
  xhr.onreadystatechange = function() {

    if (xhr.readyState == 4) {
      
      if (xhr.status == 200 || xhr.status == 0) {
        
        callback(xhr.responseText);
        
      }
      
    }
    
  };
  
  xhr.open("GET", url, true);
  xhr.send(null);
  
};

//
// PARSING
//
function parse(data) {

  xParser.parse(xObject, data);
  self.postMessage(xObject);
  
}

self.onmessage = function(event) {

  var _data = event.data;
  var extension = _data[0].toUpperCase();
  var stream = _data[1];
  
  xObject = new X.object();
  
  switch (extension) {
  case 'VTK':
    xParser = new X.parserVTK();
    break;
  case 'TRK':
    xParser = new X.parserTRK();
    break;
  case 'STL':
    xParser = new X.parserSTL();
    break;
  case 'NRRD':
    xObject = new X.volume();
    xParser = new X.parserNRRD();
    break;
  default:
    xParser = new X.parserFSM();
  }
  
  // .. start the loading
  // load('skull.vtk', parse);
  parse(stream);
  
};
