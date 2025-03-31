import * as niivue from "https://niivue.github.io/niivue/dist/index.js";

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

    start(e.dataTransfer.files);

});
selectbutton.addEventListener("change", (e) => {

    console.log('files selected', e.target.files);

    start(e.target.files);

});

async function start(files) {
    //
    // START NIIVUE
    //
    const nv = new niivue.Niivue({
      backColor: [0.1, 0.1, 0.1, 1],
      show3Dcrosshair: false,
      onImageLoaded: () => {

      },
      onOverlayLoaded: () => {

      },
      onMeshLoaded: (data) => {

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
    nv.setSliceType(nv.sliceTypeMultiplanar);
    // nv.setClipPlane([-0.12, 180, 40]);
    nv.opts.dragMode = nv.dragModes.slicer3D;

    nv.setInterpolation(true);

    window.nv = nv;

    //
    // LOAD DATA
    //
    await Promise.all( Array.from(files).map(file => nv.loadFromFile(file)) );
    
    //
    // SHOW VIEWER
    //
    landingpage.classList.add("hidden");
    viewer.classList.remove("hidden");
}