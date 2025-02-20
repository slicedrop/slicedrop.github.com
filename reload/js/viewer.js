import * as niivue from "https://niivue.github.io/niivue/dist/index.js";
import { VolumePane } from "./volumePane.js";
import { MeshPane } from "./meshPane.js";
import { FiberPane } from "./fiberPane.js";
import { UtilitiesPane } from "./utilitiesPane.js";
import { getFirstCompatibleFiber, getFirstCompatibleMesh } from "./utils.js";

export class NiiVueViewer {
  constructor(canvasId) {
    this.canvasId = canvasId;

    this.loadedVolumes = [];
    this.loadedMeshes = [];
    this.loadedFibers = [];

    this.sliders = {
      ax: document.getElementById('axSlider'),
      cor: document.getElementById('corSlider'),
      sag: document.getElementById('sagSlider')
    };

  
    this.initialize();

    window.nv = this.viewer;
    this.setupPinControls();

    this.utilitiesPane = new UtilitiesPane(this);

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
    this.setupSliders();
    window.addEventListener('resize', () => this.resizeSliders());
  }

  setupSliders() {
    // Handle slider input
    const moveSlider = () => {
      this.viewer.scene.crosshairPos = [
        this.sliders.sag.value / 100,
        this.sliders.cor.value / 100,
        this.sliders.ax.value / 100
      ];
      this.viewer.drawScene();
    };

    // Add input listeners
    Object.values(this.sliders).forEach(slider => {
      slider.oninput = moveSlider;
    });

    // Handle location changes
    this.viewer.opts.onLocationChange = () => {
      if (this.isMultiView()) {
        const pos = this.viewer.scene.crosshairPos;
        this.sliders.ax.value = Math.round(pos[2] * 100);
        this.sliders.cor.value = Math.round(pos[1] * 100);
        this.sliders.sag.value = Math.round(pos[0] * 100);
        this.resizeSliders();
      }
    };
  }

  isMultiView() {
    const volumePane = this.loadedVolumes[0]?.pane;
    return volumePane?.state.sliceType === 'multi';
  }

  resizeSliders() {
    if (!this.isMultiView()) {
      Object.values(this.sliders).forEach(slider => {
        slider.style.visibility = 'hidden';
      });
      return;
    }

    const dpr = 1/this.viewer.uiData.dpr;
    const container = document.getElementById('gl1');
    const containerRect = container.getBoundingClientRect();

    Object.entries(this.sliders).forEach(([type, slider], index) => {
      const slice = this.viewer.screenSlices.find(s => s.axCorSag === index);
      const ltwh = slice?.leftTopWidthHeight || [-1, 0, 0, 0];

      if (ltwh[0] < 0) {
        slider.style.visibility = 'hidden';
        return;
      }

      slider.style.visibility = 'visible';
      slider.style.left = `${Math.min(Math.max(ltwh[0] * dpr, 0), containerRect.width - 20)}px`;
      slider.style.top = `${Math.min(Math.max((ltwh[1] - this.viewer.opts.tileMargin) * dpr, 0), containerRect.height - 20)}px`;
      slider.style.width = `${Math.min(ltwh[2] * dpr, containerRect.width - parseFloat(slider.style.left))}px`;
    });
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
    console.log("Updating drawer states...");
  
    const volumeDrawer = document.querySelector(".drawer-trigger:nth-child(1) .drawer");
    const meshDrawer = document.querySelector(".drawer-trigger:nth-child(2) .drawer");
    const fiberDrawer = document.querySelector(".drawer-trigger:nth-child(3) .drawer");

  
    // Check for volumes
    if (this.viewer.volumes && this.viewer.volumes.length > 0) {
      volumeDrawer?.classList.add("active");
      volumeDrawer?.classList.remove("inactive");
    } else {
      volumeDrawer?.classList.remove("active");
      volumeDrawer?.classList.add("inactive");
    }
  
    // Check for compatible meshes
    const compatibleMesh = getFirstCompatibleMesh(this.viewer);
    if (compatibleMesh) {
      meshDrawer?.classList.add("active");
      meshDrawer?.classList.remove("inactive");
      console.log("Mesh drawer activated");
    } else {
      meshDrawer?.classList.remove("active");
      meshDrawer?.classList.add("inactive");
    }

  
    // Check for compatible fibers
    const compatibleFiber = getFirstCompatibleFiber(this.viewer);
    if (compatibleFiber) {
      fiberDrawer?.classList.add("active");
      fiberDrawer?.classList.remove("inactive");
      console.log("Fiber drawer activated, compatible fiber found:", compatibleFiber);
    } else {
      fiberDrawer?.classList.remove("active");
      fiberDrawer?.classList.add("inactive");
      console.log("No compatible fiber found");
    }
  }

  initialize() {
    this.viewer = new niivue.Niivue({
      backColor: [0, 0, 0, 0],
      show3Dcrosshair: true,
      onImageLoaded: () => {
        this.updateDrawerStates();
        this.originalImage = this.viewer.volumes[0].img.slice();
        
        this.resizeSliders();
      },
      onOverlayLoaded: () => {
        this.updateDrawerStates();
      },
      onMeshLoaded: () => {
        this.updateDrawerStates();
      },
      onLocationChange: (data) => {
        if (this.viewer.opts.sliceType === this.viewer.sliceTypeMultiplanar) {
          let fracXYZ = this.viewer.scene.crosshairPos;
          const axSlider = document.getElementById('axSlider');
          const corSlider = document.getElementById('corSlider');
          const sagSlider = document.getElementById('sagSlider');
          
          if (axSlider && corSlider && sagSlider) {
            axSlider.value = Math.round(fracXYZ[2] * 100);
            corSlider.value = Math.round(fracXYZ[1] * 100);
            sagSlider.value = Math.round(fracXYZ[0] * 100);
          }
          this.resizeSliders();
        }
      }
    });

    this.viewer.attachTo('gl1');
    this.viewer.setHeroImage(7 * 0.1);
    this.viewer.opts.textHeight = 0.02;
    this.viewer.opts.crosshairWidth = 0.5;
    this.viewer.opts.multiplanarEqualSize = true;
    this.viewer.setSliceType(this.viewer.sliceTypeMultiplanar);
    this.viewer.setClipPlane([-0.12, 180, 40]);
    this.viewer.setInterpolation(true);

    const volumePane = new VolumePane(this);
    this.loadedVolumes.push({ pane: volumePane });

    const meshPane = new MeshPane(this);
    this.loadedMeshes.push({ pane: meshPane });

    const fiberPane = new FiberPane(this);
    this.loadedFibers.push({ pane: fiberPane });

    // Add resize observer to handle container size changes
    const resizeObserver = new ResizeObserver(() => {
      this.resizeSliders();
    });
    resizeObserver.observe(document.getElementById('gl1'));

    this.setupSliders();
  }

  setupPinControls() {
    const pinIcons = document.querySelectorAll(".pin-icon");
    const drawers = document.querySelectorAll(".drawer");
  
    // Add inactive class to all drawers initially
    drawers.forEach(drawer => {
      drawer.classList.add('inactive');
    });
  
    pinIcons.forEach((pin) => {
      pin.addEventListener("click", (e) => {
        e.stopPropagation();
        const drawer = pin.closest(".drawer");
        
        // Only allow pinning if drawer is active
        if (drawer.classList.contains('active')) {
          const isPinned = drawer.classList.toggle("pinned");
          pin.classList.toggle("pinned");
  
          if (!isPinned) {
            drawer.style.width = "26px";
          }
        }
      });
    });
  
    // We don't need the hover handlers anymore since CSS handles it
    // But we'll keep event listeners for any other functionality you might need
    drawers.forEach((drawer) => {
      drawer.addEventListener("mouseenter", () => {
        // Any additional functionality on drawer hover can go here
      });
  
      drawer.addEventListener("mouseleave", () => {
        // Any additional functionality on drawer leave can go here
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

  updateSceneState() {
    this.utilitiesPane.updateJSON();

    // console.log("Utilities updated");
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
      this.updateSceneState();

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
        "https://raw.githubusercontent.com/gaiborjosue/powerboost/refs/heads/tweakpane/";
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
