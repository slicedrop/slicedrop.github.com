# SliceDrop Reloaded

A browser-based 3D/2D medical imaging visualization tool built with ES6 JavaScript and the NiiVue library.

## Features

- Load and visualize 3D medical imaging data directly in the browser
- Support for multiple file formats:
  - Volumes: `.nii`, `.nii.gz`, DICOM
  - Meshes: `.obj`, `.vtk`, `.stl`, FreeSurfer formats
  - Fiber tracks: `.trk`, `.tko`
- Interactive visualization with:
  - Multi-planar 2D views (axial, coronal, sagittal)
  - 3D rendering with adjustable camera and lighting
  - Volume and mesh controls
  - Color mapping and opacity controls
- No server processing - all visualization happens client-side

## Getting Started

### Local Development

1. Clone this repository
2. Run a local HTTP server in the project directory:
   ```
   python -m http.server
   ```
   or
   ```
   npx http-server
   ```
3. Open your browser to `http://localhost:8000`

### Usage

- Drag and drop supported files onto the interface
- Use the control panels on the left to adjust visualization parameters
- Try the example datasets to explore different visualization options

## Project Structure

- `index.html` - Main entry point
- `css/` - Stylesheets
- `js/`
  - `index.js` - Application entry point
  - `viewer.js` - Main viewer component
  - `*Pane.js` - Control panel components for different data types
  - `dropHandler.js` - File drag-and-drop handling
  - `utils.js` - Utility functions
- `images/` - UI assets
- `matcaps/` - Materials for 3D rendering