import { getFirstCompatibleFiber } from "./utils.js";

export class FiberPane {
  constructor(viewer) {
    this.mainViewer = viewer;
    this.viewer = viewer.viewer;
    this.pane = new Pane({
      expanded: true,
      container: document.querySelector(".drawer:nth-child(3) .drawer-content"),
    });

    // Initialize state object
    this.state = {
      radius: 0.0,
      length: 3,
      dither: 0.1,
      colorationMode: "Global direction",
      reductionLevel: "100%",
    };

    // Define available options
    this.colorationOptions = {
      "Global direction": "globalDirection",
      "Local direction": "localDirection",
      Fixed: "fixed",
      "First Per Vertex Type": "firstPerVertex",
      "First Per Streamline Type": "firstPerStreamline",
    };

    this.reductionOptions = {
      "100%": 1,
      "50%": 2,
      "25%": 4,
      "10%": 10,
    };

    this.setupControls();
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
        max: 3.0,
        step: 0.1,
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
      });

    // Visualization Settings Folder
    const visualFolder = this.pane.addFolder({
      title: "Visualization",
      expanded: true,
    });

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
  }

  // Method to show/hide the pane based on fiber availability
  updateVisibility(show) {
    if (show) {
      this.pane.element.style.display = "block";
    } else {
      this.pane.element.style.display = "none";
    }
  }
}

export default FiberPane;
