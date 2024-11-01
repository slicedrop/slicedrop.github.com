export class MeshPane {
  constructor(viewer) {
    this.viewer = viewer;
    this.pane = new Pane({
      title: 'Mesh',
      expanded: true,
      container: document.querySelector('.drawer:nth-child(2) .drawer-content'),
    });

    // Initialize state object
    this.state = {
      opacity: 0.7,
      reverseFaces: false,
      meshColor: '#FFFFFF',
      shader: 'Default',
      matcap: 'None'
    };

    // Available matcap options
    this.matcapOptions = {
      'None': 'none',
      'Shiny': 'shiny',
      'Cortex': 'cortex',
      'Cream': 'cream',
      'Fuzzy': 'fuzzy',
      'Peach': 'peach',
      'Plastic': 'plastic'
    };

    this.setupControls();
  }

  setupControls() {
    this.pane.addButton({
      title: 'Toggle Visibility',
    }).on('click', () => {
      const compatibleMesh = this.getFirstCompatibleMesh();
      if (compatibleMesh) {
        compatibleMesh.mesh.visible = !compatibleMesh.mesh.visible;
        this.viewer.updateGLVolume();
      }
    });

    // Basic Controls Folder
    const basicFolder = this.pane.addFolder({
      title: 'Basic Controls',
      expanded: true
    });

    // Opacity Control
    basicFolder.addBinding(this.state, 'opacity', {
      min: 0,
      max: 1,
      step: 0.1,
      label: 'Opacity'
    }).on('change', (ev) => {
      const compatibleMesh = this.getFirstCompatibleMesh();
      if (compatibleMesh) {
        this.viewer.setMeshLayerProperty(
          compatibleMesh.mesh.id,
          0,
          'opacity',
          ev.value
        );
      }
    });

    // Reverse Faces Control
    basicFolder.addBinding(this.state, 'reverseFaces', {
      label: 'Reverse Faces'
    }).on('change', (ev) => {
      const compatibleMesh = this.getFirstCompatibleMesh();
      if (compatibleMesh) {
        this.viewer.reverseFaces(compatibleMesh.mesh.id);
      }
    });

    // Color Control
    basicFolder.addBinding(this.state, 'meshColor', {
      picker: 'inline',
      expanded: true,
      label: 'Color'
    }).on('change', (ev) => {
      const compatibleMesh = this.getFirstCompatibleMesh();
      if (compatibleMesh) {
        const color = this.hexToRgb(ev.value);
        this.viewer.setMeshProperty(compatibleMesh.mesh.id, 'rgba255', [
          color.r,
          color.g,
          color.b,
          255
        ]);
      }
    });

    // Save Bitmap Button
    basicFolder.addButton({
      title: 'Save Bitmap',
    }).on('click', () => {
      this.viewer.saveScene('Screenshot.png');
    });

    // Shader Controls Folder
    const shaderFolder = this.pane.addFolder({
      title: 'Shader Settings',
      expanded: true
    });

    // Get available shaders from NiiVue
    const shaderOptions = {};

    this.viewer.meshShaderNames().forEach(shader => {
      shaderOptions[shader] = shader;
    });

    // Shader Dropdown
    shaderFolder.addBinding(this.state, 'shader', {
      options: shaderOptions,
      label: 'Shader Type'
    }).on('change', (ev) => {
      const compatibleMesh = this.getFirstCompatibleMesh();
      if (compatibleMesh) {
        this.viewer.setMeshShader(compatibleMesh.mesh.id, ev.value);
        
        // Show/hide matcap options based on shader selection
        if (ev.value === 'Matcap') {
          matcapBinding.hidden = false;
        } else {
          matcapBinding.hidden = true;
          this.state.matcap = 'None';
        }
      }
    });

    // Matcap Control (hidden by default)
    const matcapBinding = shaderFolder.addBinding(this.state, 'matcap', {
      options: this.matcapOptions,
      label: 'Matcap Style',
      hidden: true
    }).on('change', (ev) => {
      const compatibleMesh = this.getFirstCompatibleMesh();
      if (compatibleMesh && ev.value !== 'none') {
        this.viewer.setMeshShader(compatibleMesh.mesh.id, 'Matcap');
        this.viewer.loadMatCapTexture(
          './matcaps/' + ev.value + '.jpg'
        );
      }
    });
  }

  getFirstCompatibleMesh() {
    if (!this.viewer.meshes || this.viewer.meshes.length === 0) return null;

    const acceptedFormats = ['.obj', '.vtk', '.stl', '.mz3', '.smoothwm'];

    for (let i = 0; i < this.viewer.meshes.length; i++) {
      const mesh = this.viewer.meshes[i];
      const fileExtension = '.' + mesh.name.split('.').pop().toLowerCase();
      if (acceptedFormats.includes(fileExtension)) {
        return { mesh, index: i };
      }
    }
    return null;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Method to show/hide the pane based on mesh availability
  updateVisibility(show) {
    if (show) {
      this.pane.element.style.display = 'block';
    } else {
      this.pane.element.style.display = 'none';
    }
  }
}

export default MeshPane;