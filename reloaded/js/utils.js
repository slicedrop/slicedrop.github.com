/**
 * @fileoverview Utility functions for SliceDrop Reloaded
 * Contains helper functions for working with different file types and formats
 */

/** @constant {string[]} List of file extensions for fiber track formats */
const ACCEPTED_FIBER_FORMATS = ['.trk', '.tko', '.trx', '.tck'];

/** @constant {string[]} List of file extensions for 3D mesh formats */
const ACCEPTED_MESH_FORMATS = ['.obj', '.vtk', '.stl', '.mz3', '.smoothwm'];

/**
 * Finds the first fiber track in the viewer's loaded meshes
 * @param {Object} viewer - The NiiVue viewer instance
 * @returns {Object|null} Object containing the mesh and its index, or null if no fiber found
 */
export function getFirstCompatibleFiber(viewer) {
  if (!viewer.meshes || viewer.meshes.length === 0) return null;

  for (let i = 0; i < viewer.meshes.length; i++) {
    const mesh = viewer.meshes[i];
    const fileExtension = '.' + mesh.name.split('.').pop().toLowerCase();
    if (ACCEPTED_FIBER_FORMATS.includes(fileExtension)) {
      return { mesh, index: i };
    }
  }
  return null;
}

/**
 * Finds the first compatible 3D mesh in the viewer's loaded meshes
 * @param {Object} viewer - The NiiVue viewer instance
 * @returns {Object|null} Object containing the mesh and its index, or null if no mesh found
 */
export function getFirstCompatibleMesh(viewer) {
  if (!viewer.meshes || viewer.meshes.length === 0) return null;

  for (let i = 0; i < viewer.meshes.length; i++) {
    const mesh = viewer.meshes[i];
    const fileExtension = '.' + mesh.name.split('.').pop().toLowerCase();
    if (ACCEPTED_MESH_FORMATS.includes(fileExtension)) {
      return { mesh, index: i };
    }
  }
  return null;
}

/**
 * Converts a hex color string to RGB object
 * @param {string} hex - Hex color string (e.g. "#FF0000")
 * @returns {Object|null} Object with r, g, b values (0-255) or null if invalid input
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Generates a color map for NiiVue by interpolating between two colors
 * @param {Object} color1 - Starting color with r,g,b properties (0-255)
 * @param {Object} color2 - Ending color with r,g,b properties (0-255)
 * @param {number} steps - Number of steps in the color map (default: 256)
 * @returns {Object} Color map object compatible with NiiVue
 */
export function generateColorMap(color1, color2, steps = 256) {
  const cmap = {
    R: [],
    G: [],
    B: [],
    A: [],
    I: [],
  };

  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);

    const r = Math.round(color1.r + t * (color2.r - color1.r));
    const g = Math.round(color1.g + t * (color2.g - color1.g));
    const b = Math.round(color1.b + t * (color2.b - color1.b));

    cmap.R.push(r);
    cmap.G.push(g);
    cmap.B.push(b);
    cmap.A.push(255);
    cmap.I.push(Math.round((r + g + b) / 3));
  }

  return cmap;
}

/**
 * Updates the visibility of a UI pane
 * @param {Object} pane - The Tweakpane instance to show/hide
 * @param {boolean} show - Whether to show (true) or hide (false) the pane
 */
export function updatePaneVisibility(pane, show) {
  if (pane && pane.element) {
    pane.element.style.display = show ? 'block' : 'none';
  }
}