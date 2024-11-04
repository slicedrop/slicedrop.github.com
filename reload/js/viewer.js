import * as niivue from "https://niivue.github.io/niivue/dist/index.js";
import { VolumePane } from './volumePane.js';
import { MeshPane } from './meshPane.js';
import { FiberPane } from './fiberPane.js';
import { getFirstCompatibleFiber, getFirstCompatibleMesh } from './utils.js';

export class NiiVueViewer {
  constructor(canvasId) {
    this.canvasId = canvasId;
    

    this.initialize();

    window.nv = this.viewer;
    this.setupPinControls();

    this.exampleData = {
      example1: [
        "https://fly.cs.umb.edu/data/X/example1/streamlineres.small.trk",
        "https://fly.cs.umb.edu/data/X/example1/T1sub.nii.gz",
      ],
      example2: [
        "https://fly.cs.umb.edu/data/X/example2/avf.vtk",
        "https://fly.cs.umb.edu/data/X/example2/avf.nii",
      ],
      example3: ["https://fly.cs.umb.edu/data/X/example3/lh.smoothwm"],
      example4: [
        "https://fly.cs.umb.edu/data/X/example4/seg.nii.gz",
        "https://fly.cs.umb.edu/data/X/example4/vol.nii.gz",
      ],
    };


    this.setupExampleHandlers();
  }

  setupExampleHandlers() {
    const examples = document.querySelectorAll(".example-card");
    const drawerContainer = document.querySelector(".drawer-container");
    const landingContainer = document.getElementById("landingContainer");
    const viewerContainer = document.getElementById("viewerContainer");

    // Handle both the card click and view button click
    [...examples].forEach((element, index) => {
      element.addEventListener("click", async (e) => {
        e.preventDefault();

        // Hide landing, show viewer
        landingContainer.classList.add("hidden");
        viewerContainer.classList.remove("hidden");

        // Load the data
        const urls = this.exampleData[`example${index + 1}`];

        try {
          const loadPromises = urls.map((url) =>
            fetch(url)
              .then((response) => response.blob())
              .then((blob) => {
                const file = new File([blob], url.split("/").pop());
                return this.loadFile(file);
              })
          );

          await Promise.all(loadPromises);
          drawerContainer.classList.add("visible");
          this.updateDrawerStates();
        } catch (error) {
          console.error("Error loading example data:", error);
        }
      });
    });
  }

  updateDrawerStates() {
    console.log("Updating drawer states..."); // Debug log

    const volumeDrawer = document.querySelector(".drawer:nth-child(1)");
    const meshDrawer = document.querySelector(".drawer:nth-child(2)");
    const fiberDrawer = document.querySelector(".drawer:nth-child(3)");

    // Log current state
    console.log("Volumes:", this.viewer.volumes?.length);
    console.log("Meshes:", this.viewer.meshes?.length);

    // Check for volumes
    if (this.viewer.volumes && this.viewer.volumes.length > 0) {
      volumeDrawer?.classList.add("active");
      console.log("Volume drawer activated");
    } else {
      volumeDrawer?.classList.remove("active");
    }

    // Check for compatible meshes
    const compatibleMesh = getFirstCompatibleMesh(this.viewer);
    if (compatibleMesh) {
      meshDrawer?.classList.add("active");
      console.log("Mesh drawer activated");
    } else {
      meshDrawer?.classList.remove("active");
    }

    // Check for compatible fibers
    const compatibleFiber = getFirstCompatibleFiber(this.viewer);
    if (compatibleFiber) {
      fiberDrawer?.classList.add("active");
      console.log("Fiber drawer activated");
    } else {
      fiberDrawer?.classList.remove("active");
    }
  }

  initialize() {
    this.viewer = new niivue.Niivue({
      backColor: [0, 0, 0, 0],
      show3Dcrosshair: true,
      onImageLoaded: () => {
        this.updateDrawerStates();
      },
      onOverlayLoaded: () => {
        this.updateDrawerStates();
      },

      onMeshLoaded: () => {
        this.updateDrawerStates();
      },
    });

    this.viewer.attachTo(this.canvasId);
    this.viewer.setSliceType(this.viewer.sliceTypeMultiplanar);
    this.viewer.setClipPlane([-0.12, 180, 40]);

    // Initialize controls
    const volumePane = new VolumePane(this.viewer);
    const meshPane = new MeshPane(this.viewer);
    const fiberPane = new FiberPane(this.viewer);
  }

  setupPinControls() {
    const pinIcons = document.querySelectorAll(".pin-icon");

    pinIcons.forEach((pin) => {
      pin.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent drawer from closing

        const drawer = pin.closest(".drawer");
        const isPinned = drawer.classList.toggle("pinned");
        pin.classList.toggle("pinned");

        // If we're unpinning and not hovering, close the drawer
        if (!isPinned && !drawer.matches(":hover")) {
          drawer.style.width = "40px";
        }
      });
    });

    // Handle drawer hover when pinned
    const drawers = document.querySelectorAll(".drawer");
    drawers.forEach((drawer) => {
      drawer.addEventListener("mouseenter", () => {
        if (!drawer.classList.contains("pinned")) {
          drawer.style.width = "340px";
        }
      });

      drawer.addEventListener("mouseleave", () => {
        if (!drawer.classList.contains("pinned")) {
          drawer.style.width = "40px";
        }
      });
    });
  }

  setupSliceTypeControl() {
    const sliceTypeSelect = document.getElementById("sliceType");
    if (sliceTypeSelect) {
      sliceTypeSelect.addEventListener("change", (e) => {
        this.setSliceType(e.target.value);
      });
    }
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  async loadFile(file) {
    try {
      await this.viewer.loadFromFile(file);

      // Set initial states
      if (this.viewer.volumes && this.viewer.volumes.length > 0) {
        const sliceTypeSelect = document.getElementById("sliceType");
        if (sliceTypeSelect) {
          this.setSliceType(sliceTypeSelect.value);
        }
      }

      // Update drawer states after any file load
      this.updateDrawerStates();

      const compileAndExecuteBoostlet = (code) => {
        // Remove any existing script to avoid duplicates
        let existingScript = document.getElementById("powerboost-script");
        if (existingScript) {
          existingScript.remove();
        }

        // Create and execute the script
        let script = document.createElement("script");
        script.id = "powerboost-script";
        script.textContent = `(function(){${code.trim()}})();`;
        document.body.appendChild(script);
      };

      const baseurl =
        "https://raw.githubusercontent.com/mpsych/powerboost/refs/heads/main/";
      const scriptName = "floatingUI.js";

      const loadBoostlet = (url) => {
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("GET", url);
          xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                resolve(xhr.response);
              } else {
                reject(new Error("Failed to load PowerBoost"));
              }
            }
          };
          xhr.send(null);
        });
      };

      // Load and execute PowerBoost
      loadBoostlet(baseurl + scriptName)
        .then(compileAndExecuteBoostlet)
        .catch((error) => console.error("Error loading PowerBoost:", error));

      return true;

    } catch (error) {
      console.error("Error loading file:", error);

      return false;
    }
  }
}

export default NiiVueViewer;
