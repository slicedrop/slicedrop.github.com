import { NiiVueViewer } from './viewer.js';
import { DropZoneHandler } from './dropHandler.js';


// Initialize viewer
const viewer = new NiiVueViewer('gl1');

// Initialize drop handler
new DropZoneHandler(viewer);


window.nv = viewer.viewer;
