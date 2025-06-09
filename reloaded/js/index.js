import * as niivue from "https://unpkg.com/@niivue/niivue@0.57.0/dist/index.js";

window.niivue = niivue;

//
// FILE SELECT / DROP
//
const overlay = document.getElementById("dropZoneOverlay");
const selectbutton = document.getElementById("fileInput");
const landingpage = document.getElementById("landingContainer");
const viewer = document.getElementById("viewerContainer");

window.addEventListener("dragenter", (e) => {
    e.preventDefault();
    e.stopPropagation();
    overlay.style.display = 'block';
});
window.addEventListener("dragleave", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.x == 0 && e.y == 0) {
      overlay.style.display = 'none'; //hide when cursor leaves window
    }
});
window.addEventListener("dragover", (e) => {
    e.preventDefault();
    e.stopPropagation();
});
window.addEventListener("drop", (e) => {
    e.preventDefault();
    e.stopPropagation();

    overlay.style.display = 'none';

    console.log('files dropped', e.dataTransfer.files);

    var de = new DragEvent(e.type, e);

    document.getElementById('gl1').dispatchEvent(de);

    // load(e.dataTransfer.files);

});
// selectbutton.addEventListener("change", (e) => {

//     console.log('files selected', e.target.files);

//     window.eee = e;

//     var dataTransfer = new DataTransfer();

//     const mockDropEvent = {
//         preventDefault: () => {},
//         dataTransfer: {
//           files: e.target.files,
//         },
//     };

//     var de = new DragEvent('drop', mockDropEvent);

//     // var de = new DragEvent(e.type, e);
//     // // de.dataTransfer = {};
//     // window.ddd = de;
//     // de.dataTransfer.files = e.target.files;

//     document.getElementById('gl1').dispatchEvent(mockDropEvent);

//     // load(e.target.files);

// });

start();

function start() {
    //
    // START NIIVUE
    //
    const nv = new niivue.Niivue({
      backColor: [0.1, 0.1, 0.1, 1],
      show3Dcrosshair: false,
      onImageLoaded: () => {

        setupUi();
        nv.setVolumeRenderIllumination(-1);
        nv.volumes[0].fgcolor = {r:1,g:1,b:1};
        nv.volumes[0].bgcolor = {r:0,g:0,b:0};

        showViewer();

      },
      onOverlayLoaded: () => {

        console.log('load overlay')

      },
      onMeshLoaded: (data) => {

        setupUi();

        showViewer();

      },
      onLocationChange: (data) => {
        
      }
    });

    nv.attachTo('gl1');
    nv.setHeroImage(7 * 0.1);
    nv.opts.textHeight = 0.02;
    // nv.opts.isOrientCube = true;
    nv.opts.isAntiAlias = true;
    nv.opts.crosshairWidth = 0.1;
    nv.opts.crosshairColor = [1.0, 1.0, 1.0, 1.0];
    nv.opts.yoke3Dto2DZoom = true
    nv.opts.multiplanarEqualSize = true;
    // nv.opts.gradientOrder = 2;
    nv.setSliceType(nv.sliceTypeMultiplanar);
    nv.opts.clipPlaneColor = [180/255, 180/255, 180/255, 0.1];
    // nv.setClipPlane([-0.12, 180, 40]);
    nv.opts.dragMode = nv.dragModes.slicer3D;

    nv.setInterpolation(true);

    window.nv = nv;

}

function loadExample(which) {

    loadUrl('https://fly.cs.umb.edu/data/X/example'+which+'.nvd');

}

async function loadUrl(url) {

    if (url.endsWith('.nvd')) {

        niivue.NVDocument.loadFromUrl(url).then((doc) => {
            nv.loadDocument(doc);
            window.doc = doc;
        });
        
    } else {
        nv.loadFromUrl(url);
    }

    showViewer();

}

// async function load(files) {

//     var nv = window.nv;

//     console.log(files);

//     // SORT DATA BY SIZE, LARGE FILES FIRST
//     files = Array.from(files);

//     const sortedFiles = files.sort((a, b) => b.size - a.size);


//     var VOLUMELOADED = false;
//     var MESHLOADED = false;

//     var nvdoc = null;

//     //
//     // LOAD DATA
//     //
//     await Promise.all( sortedFiles.map(file => {

//       const filename = file.name.toLowerCase();

//       if (filename.endsWith('.nvd')) {
        

//         // this is a saved scene
//         nvdoc = niivue.NVDocument.loadFromFile(file);


//       } else {




//         // check if there is already a volume in the scene,
//         // then this is likely an overlay
//         if (VOLUMELOADED) {

//             console.log('2nd volume', filename);

//         }

//         if (nv.isMeshExt(filename)) {
//             MESHLOADED = true;
//         } else {
//             VOLUMELOADED = true;
//         }

//         // any other file
//         nv.loadFromFile(file); 
//       }
        
//     }));


//     if (nvdoc) {

//         await nv.loadDocument(nvdoc);
//         console.log('Loaded scene!');
//     }
        


//     showViewer();
    
// }

function showViewer() {
    //
    // SHOW VIEWER
    //
    landingpage.classList.add("hidden");
    viewer.classList.remove("hidden");

}



window.loadUrl = loadUrl;
window.loadExample = loadExample;
