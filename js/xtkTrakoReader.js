function xtkTrakoReader() {
  
  this.decoderModule = DracoDecoderModule();
  this.decoder = new this.decoderModule.Decoder();

};

xtkTrakoReader.read = function(file, callback) {

  var xhr = new XMLHttpRequest();
  
  xhr.open('GET', file);  
  xhr.responseType = 'json';

  xhr.onload = function(r) {

    gltf = r.target.response;

    var r = new xtkTrakoReader();
    obj = r.parse(gltf);

    callback(obj);

  };

  xhr.send();

};


xtkTrakoReader.gltfType_to_vtkNumberOfComponents = {
  
  'SCALAR': 1,
  'VEC2': 2,
  'VEC3': 3,
  'VEC4': 4

};

xtkTrakoReader.gltfComponentType_to_size = {

  5123: 2,
  5125: 4,
  5126: 4

};

xtkTrakoReader.prototype.parse = function(gltf) {

  f = new X.fibers();
  f.type = 'LINES';

  attributes = gltf.meshes[0].primitives[0].attributes;

  if ('properties' in gltf.meshes[0].primitives[0].extras) {
    properties = gltf.meshes[0].primitives[0].extras['properties'];
  }
  else {
    properties = {};
  }

  points = this.decode(this.decoderModule, this.decoder, gltf, attributes.POSITION);

  indices = this.decode(this.decoderModule, this.decoder, gltf, gltf.meshes[0].primitives[0].indices);

  // indices = indices.slice(0,100);

  // create XTK Points
  f.points = new X.triplets(indices.length * 3);
  f.normals = new X.triplets(indices.length * 3);
  f.colors = new X.triplets(indices.length * 3);
  for (var i=0; i<indices.length;i++) {
    f.normals.add(1,1,1);
    f.colors.add(1,1,1);
  }

  var vertex_p = 0;
  for (var i=0; i<indices.length;i++) {

    vertex_p = 3*indices[i];

    f.points.add(points[ vertex_p ], points[ vertex_p + 1 ], points[ vertex_p + 2 ]);

    vertex_p += 1;

  }

  // TODO add colors and normals
  // TODO scalars and properties

  return f;

};

xtkTrakoReader.prototype.decode = function(decoderModule, decoder, gltf, which) {

  accessor = gltf.accessors[which];

  bufferview = accessor.bufferView;
  data = gltf.buffers[gltf.bufferViews[bufferview].buffer];
  
  magic = 'data:application/octet-stream;base64,'
  bytes = atob(data.uri.substring(magic.length))

  if (bytes.substring(0,5) != 'DRACO') {
    console.log('Did not find Draco compressed data..');
    return gltf;
  }


  var rawLength = bytes.length;
  // from: https://gist.github.com/borismus/1032746
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for(i = 0; i < rawLength; i++) {
    array[i] = bytes.charCodeAt(i);
  }

  var buffer = new decoderModule.DecoderBuffer();
  buffer.Init(array, rawLength);


  var pointcloud = new decoderModule.PointCloud();
  decoder.DecodeBufferToPointCloud(buffer, pointcloud);

  var attr = decoder.GetAttribute(pointcloud, 0)
  var num_points = pointcloud.num_points();

  var itemSize = xtkTrakoReader.gltfType_to_vtkNumberOfComponents[accessor.type];
  var elementBytes = xtkTrakoReader.gltfComponentType_to_size[accessor.componentType];


  array = new Float32Array(num_points*itemSize);
  var points = new decoderModule.DracoFloat32Array()
  decoder.GetAttributeFloatForAllPoints(pointcloud, attr, points)

  for (var i=0; i< num_points*itemSize; i++) {

    array[i] = points.GetValue(i);

  }
  
  if (elementBytes == 2) {

    // we need to process the indicies to be ready for rendering

    var indices = [];
    var pointer = 0;
    for (var p in array) {
      
      var length = Math.round(array[p]);

      for(var i=pointer;i<pointer+length-1;i++) {
        indices.push(Math.round(i));
        indices.push(Math.round(i+1));
      }

      pointer = pointer + length

    }

    array = new Uint16Array(indices);

  }

  return array;

};
