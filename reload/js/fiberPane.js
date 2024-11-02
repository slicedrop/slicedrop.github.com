export class FiberPane {
  constructor(viewer) {
    this.viewer = viewer;
    this.pane = new Pane({
      title: 'Fibers',
      expanded: true,
      container: document.querySelector('.drawer:nth-child(3) .drawer-content'),
    });

    // Initialize state object
    this.state = {
      radius: 0.0,
      length: 3,
      dither: 0.1,
      colorationMode: 'Global direction',
      reductionLevel: '100%'
    };

    // Define available options
    this.colorationOptions = {
      'Global direction': 'globalDirection',
      'Local direction': 'localDirection',
      'Fixed': 'fixed',
      'First Per Vertex Type': 'firstPerVertex',
      'First Per Streamline Type': 'firstPerStreamline'
    };

    this.reductionOptions = {
      '100%': 1,
      '50%': 2,
      '25%': 4,
      '10%': 10
    };

    this.setupControls();
  }

  setupControls() {
    // Add visibility button at the top level
    this.pane.addButton({
      title: 'Toggle Visibility',
    }).on('click', () => {
      const compatibleFiber = this.getFirstCompatibleFiber();
      if (compatibleFiber) {
        compatibleFiber.mesh.visible = !compatibleFiber.mesh.visible;
        this.viewer.updateGLVolume();
      }
    });

    // Basic Properties Folder
    const propertiesFolder = this.pane.addFolder({
      title: 'Properties',
      expanded: true
    });

    // Radius Control
    propertiesFolder.addBinding(this.state, 'radius', {
      min: 0,
      max: 2.0,
      step: 0.1,
      label: 'Radius'
    }).on('change', (ev) => {
      const compatibleFiber = this.getFirstCompatibleFiber();
      if (compatibleFiber) {
        this.viewer.setMeshProperty(
          compatibleFiber.mesh.id,
          'fiberRadius',
          ev.value
        );
        this.viewer.updateGLVolume();
      }
    });

    // Length Control
    propertiesFolder.addBinding(this.state, 'length', {
      min: 0,
      label: 'Length'
    }).on('change', (ev) => {
      const compatibleFiber = this.getFirstCompatibleFiber();
      if (compatibleFiber) {
        this.viewer.setMeshProperty(
          compatibleFiber.mesh.id,
          'fiberLength',
          ev.value
        );
      }
    });

    // Dither Control
    propertiesFolder.addBinding(this.state, 'dither', {
      min: 0,
      step: 0.1,
      label: 'Dither'
    }).on('change', (ev) => {
      const compatibleFiber = this.getFirstCompatibleFiber();
      if (compatibleFiber) {
        this.viewer.setMeshProperty(
          compatibleFiber.mesh.id,
          'fiberDither',
          ev.value
        );
      }
    });

    // Visualization Settings Folder
    const visualFolder = this.pane.addFolder({
      title: 'Visualization',
      expanded: true
    });

    // Coloration Mode
    visualFolder.addBinding(this.state, 'colorationMode', {
      options: this.colorationOptions,
      label: 'Color Mode'
    }).on('change', (ev) => {
      const compatibleFiber = this.getFirstCompatibleFiber();
      if (compatibleFiber) {
        this.viewer.setMeshProperty(
          compatibleFiber.mesh.id,
          'fiberColor',
          ev.value
        );
      }
    });

    // Reduction Level
    visualFolder.addBinding(this.state, 'reductionLevel', {
      options: this.reductionOptions,
      label: 'Reduction'
    }).on('change', (ev) => {
      const compatibleFiber = this.getFirstCompatibleFiber();
      if (compatibleFiber) {
        this.viewer.setMeshProperty(
          compatibleFiber.mesh.id,
          'fiberDecimationStride',
          this.reductionOptions[ev.value]
        );
      }
    });
  }

  getFirstCompatibleFiber() {
    if (!this.viewer.meshes || this.viewer.meshes.length === 0) return null;

    const acceptedFormats = ['.trk', '.tko'];

    for (let i = 0; i < this.viewer.meshes.length; i++) {
      const mesh = this.viewer.meshes[i];
      const fileExtension = '.' + mesh.name.split('.').pop().toLowerCase();
      if (acceptedFormats.includes(fileExtension)) {
        return { mesh, index: i };
      }
    }
    return null;
  }

  // Method to show/hide the pane based on fiber availability
  updateVisibility(show) {
    if (show) {
      this.pane.element.style.display = 'block';
    } else {
      this.pane.element.style.display = 'none';
    }
  }
}


export default FiberPane;