import { getFirstCompatibleFiber, updatePaneVisibility } from "./utils.js";

/**
 * Controls panel for fiber track visualization
 */
export class FiberPane {
  constructor(viewer) {
    this.mainViewer = viewer;
    this.viewer = viewer.viewer;
    this.pane = new Pane({
      expanded: true,
      container: document.querySelector(".drawer-trigger:nth-child(3) .drawer-content"),
    });

    // Initialize state object
    this.state = {
      radius: 0.0,
      length: 3,
      dither: 0.1,
      colorationMode: "",
      colorMap: "",
      shader: "",
      reductionLevel: "100%",
    };

    // Define available options
    this.colorationOptions = {
      "Global direction": "Global",
      "Local direction": "Local",
      "Fixed": "Fixed",
      "First Per Vertex Type (if available)": "DPV0",
    };

    this.reductionOptions = {
      "100%": 1,
      "50%": 2,
      "25%": 4,
      "10%": 10,
    };

    this.colorMapOptions = {
      actc: "actc",
      inferno: "inferno",
      plasma: "plasma",
      warm: "warm",
      winter: "winter",
    };

    // Keep track of advanced controls
    this.advancedControls = [];
    
    // Setup keyboard shortcut
    this.setupAdvancedToggle();

    this.setupControls();
  }

  setupAdvancedToggle() {
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'a') {
        const isVisible = !this.advancedControls[0]?.hidden;
        this.advancedControls.forEach(control => {
          control.hidden = isVisible;
        });
        this.mainViewer.updateSceneState();
      }
    });
  }
  

  setupControls() {
    const updateUtilities = () => {
      this.mainViewer.updateSceneState();
    };

    // Add visibility button at the top level
    this.pane
      .addButton({
        title: "Toggle Visibility",
      })
      .on("click", () => {
        const compatibleFiber = getFirstCompatibleFiber(this.viewer);
        if (compatibleFiber) {
          compatibleFiber.mesh.visible = !compatibleFiber.mesh.visible;
          this.viewer.updateGLVolume();
        }

        updateUtilities();
      });

    // Basic Properties Folder
    const propertiesFolder = this.pane.addFolder({
      title: "Properties",
      expanded: true,
    });

    // Radius Control
    propertiesFolder
      .addBinding(this.state, "radius", {
        min: 0,
        max: 1.0,
        step: 0.5,
        label: "Radius",
      })
      .on("change", (ev) => {
        const compatibleFiber = getFirstCompatibleFiber(this.viewer);

        console.log(compatibleFiber);
        if (compatibleFiber) {
          this.viewer.setMeshProperty(
            compatibleFiber.mesh.id,
            "fiberRadius",
            ev.value
          );
          this.viewer.updateGLVolume();
        }

        updateUtilities();
      });

    // Length Control
    propertiesFolder
      .addBinding(this.state, "length", {
        min: 0,
        label: "Length",
      })
      .on("change", (ev) => {
        const compatibleFiber = getFirstCompatibleFiber(this.viewer);
        if (compatibleFiber) {
          this.viewer.setMeshProperty(
            compatibleFiber.mesh.id,
            "fiberLength",
            ev.value
          );
        }

        updateUtilities();
      });
    
    this.advancedControls.push(
      // Dither Control
      propertiesFolder
        .addBinding(this.state, "dither", {
          min: 0,
          step: 0.1,
          label: "Dither",
        })
        .on("change", (ev) => {
          const compatibleFiber = getFirstCompatibleFiber(this.viewer);
          if (compatibleFiber) {
            this.viewer.setMeshProperty(
              compatibleFiber.mesh.id,
              "fiberDither",
              ev.value
            );
          }

          updateUtilities();
        })
    );

    

    // Visualization Settings Folder
    const visualFolder = this.pane.addFolder({
      title: "Visualization",
      expanded: true,
    });

    // console.log(this.viewer);
    // Coloration Mode
    visualFolder
      .addBinding(this.state, "colorationMode", {
        options: this.colorationOptions,
        label: "Color Mode",
      })
      .on("change", (ev) => {
        const compatibleFiber = getFirstCompatibleFiber(this.viewer);
        if (compatibleFiber) {
          this.viewer.setMeshProperty(
            compatibleFiber.mesh.id,
            "fiberColor",
            ev.value
          );
        }

        updateUtilities();
      });

      this.advancedControls.push(
      visualFolder
      .addBinding(this.state, "colorMap", {
        options: this.colorMapOptions,
        label: "Color Map",
      })
      .on("change", (ev) => {
        const compatibleFiber = getFirstCompatibleFiber(this.viewer);
        if (compatibleFiber) {
          this.viewer.setMeshProperty(
            compatibleFiber.mesh.id,
            "colormap",
            ev.value
          );
        }

        updateUtilities();
      })
    );
    

    // Reduction Level
    visualFolder
      .addBinding(this.state, "reductionLevel", {
        options: this.reductionOptions,
        label: "Reduction",
      })
      .on("change", (ev) => {
        const compatibleFiber = getFirstCompatibleFiber(this.viewer);
        if (compatibleFiber) {
          this.viewer.setMeshProperty(
            compatibleFiber.mesh.id,
            "fiberDecimationStride",
            ev.value
          );
        }

        updateUtilities();
      });

    // Get available shaders from NiiVue
    const shaderOptions = {};

    this.viewer.meshShaderNames().forEach(shader => {
      shaderOptions[shader] = shader;
    });

    this.advancedControls.push(
    // Shader Dropdown
    visualFolder.addBinding(this.state, 'shader', {
      options: shaderOptions,
      label: 'Shader Type'
    }).on('change', (ev) => {
      const compatibleFiber = getFirstCompatibleFiber(this.viewer);
      if (compatibleFiber) {
        this.viewer.setMeshShader(compatibleFiber.mesh.id, ev.value);
      
      }

      updateUtilities();
    })
    );

    this.advancedControls.forEach(control => {
      control.hidden = true;
    });
  }

  /**
   * Update pane visibility based on fiber availability
   * @param {boolean} show - Whether to show the pane
   */
  updateVisibility(show) {
    updatePaneVisibility(this.pane, show);
  }
}

export default FiberPane;
