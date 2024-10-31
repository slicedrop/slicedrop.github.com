import * as niivue from "https://niivue.github.io/niivue/dist/index.js";

export class NiiVueViewer {
  constructor(canvasId) {
    this.canvasId = canvasId;
    this.viewer = null;
    this.volumeRange = { min: 0, max: 100 };
    this.initialize();
    this.setupSliceTypeControl();
    this.setupColorControls();
    this.setupGammaControl();
    this.setupThresholdControl();
    this.setupViewControls();
    this.setupClipperControls();
    this.setupPinControls();
    this.setupMeshControls();
    this.setupShaderControl();
    this.setupMatcapControl();
    this.acceptedMeshFormats = [".obj", ".vtk", ".stl", ".mz3", ".smoothwm"];
    this.setupMeshVisibility();
    this.acceptedFiberFormats = [".trk", ".tko"];
    this.setupFiberControls();

    // Make viewer accessible globally as nv
    window.nv = this.viewer;

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
    const compatibleMesh = this.getFirstCompatibleMesh();
    if (compatibleMesh) {
      meshDrawer?.classList.add("active");
      console.log("Mesh drawer activated");
    } else {
      meshDrawer?.classList.remove("active");
    }

    // Check for compatible fibers
    const compatibleFiber = this.getFirstCompatibleFiber();
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
  }

  getFirstCompatibleMesh() {
    if (!this.viewer.meshes || this.viewer.meshes.length === 0) return null;

    for (let i = 0; i < this.viewer.meshes.length; i++) {
      const mesh = this.viewer.meshes[i];
      const fileExtension = "." + mesh.name.split(".").pop().toLowerCase();
      if (this.acceptedMeshFormats.includes(fileExtension)) {
        return { mesh, index: i };
      }
    }
    return null;
  }

  getFirstCompatibleFiber() {
    if (!this.viewer.meshes || this.viewer.meshes.length === 0) return null;

    for (let i = 0; i < this.viewer.meshes.length; i++) {
      const mesh = this.viewer.meshes[i];
      const fileExtension = "." + mesh.name.split(".").pop().toLowerCase();
      if (this.acceptedFiberFormats.includes(fileExtension)) {
        return { mesh, index: i };
      }
    }
    return null;
  }

  setupMeshVisibility() {
    const visibilityBtn = document.getElementById("meshVisibilityBtn");

    if (visibilityBtn) {
      visibilityBtn.addEventListener("click", () => {
        const compatibleMesh = this.getFirstCompatibleMesh();
        if (!compatibleMesh) return;

        // Toggle visibility
        compatibleMesh.mesh.visible = !compatibleMesh.mesh.visible;

        // Update icon
        const icon = visibilityBtn.querySelector("i");
        if (icon) {
          icon.className = compatibleMesh.mesh.visible
            ? "fa-solid fa-eye"
            : "fa-solid fa-eye-slash";
        }

        // Update rendering
        this.viewer.updateGLVolume();
      });
    }
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

  setupViewControls() {
    const smoothCheck = document.getElementById("smoothCheck");
    const invertCheck = document.getElementById("invertCheck");

    if (smoothCheck) {
      // Set initial state
      smoothCheck.checked = true;
      this.viewer.setInterpolation(true);

      smoothCheck.addEventListener("change", (e) => {
        this.viewer.setInterpolation(!e.target.checked);
      });
    }

    if (invertCheck) {
      // Set initial state
      invertCheck.checked = false;

      invertCheck.addEventListener("change", (e) => {
        if (!this.viewer.volumes || this.viewer.volumes.length === 0) return;
        this.viewer.volumes[0].colormapInvert = e.target.checked;
        this.viewer.updateGLVolume();
      });
    }
  }

  setupClipperControls() {
    const shadeCheck = document.getElementById("shadeVolumeCheck");
    const clipColorPicker = document.getElementById("clipColorPicker");
    const thicknessSlider = document.getElementById("thicknessSlider");
    const thicknessValue = document.getElementById("thicknessValue");
    const opacitySlider = document.getElementById("clipOpacitySlider");
    const opacityValue = document.getElementById("opacityValue");

    if (shadeCheck) {
      shadeCheck.addEventListener("change", (e) => {
        let clr = this.viewer.opts.clipPlaneColor;
        clr[3] = Math.abs(clr[3]);
        if (e.target.checked) clr[3] = -clr[3];
        this.viewer.setClipPlaneColor(clr);
      });
    }

    if (clipColorPicker) {
      clipColorPicker.addEventListener("input", (e) => {
        const color = this.hexToRgb(e.target.value);
        let clr = this.viewer.opts.clipPlaneColor;
        const alpha = clr[3]; // preserve alpha
        clr = [color.r / 255, color.g / 255, color.b / 255, alpha];
        this.viewer.setClipPlaneColor(clr);
      });
    }

    if (opacitySlider && opacityValue) {
      opacitySlider.addEventListener("input", (e) => {
        let clr = this.viewer.opts.clipPlaneColor;
        const value = e.target.value / 255;
        const sign = clr[3] < 0 ? -1 : 1;
        clr[3] = value * sign;
        this.viewer.setClipPlaneColor(clr);
        opacityValue.textContent = value.toFixed(2);
      });

      // Set initial opacity
      const initialOpacity = opacitySlider.value / 255;
      opacityValue.textContent = initialOpacity.toFixed(2);
    }

    if (thicknessSlider && thicknessValue) {
      thicknessSlider.addEventListener("input", (e) => {
        const value = e.target.value / 173;
        this.viewer.setClipPlaneThick(value);
        thicknessValue.textContent = value.toFixed(2);
      });

      // Set initial thickness
      const initialValue = thicknessSlider.value / 173;
      this.viewer.setClipPlaneThick(initialValue);
      thicknessValue.textContent = initialValue.toFixed(2);
    }
  }

  setupGammaControl() {
    const gammaSlider = document.getElementById("gammaSlider");
    const gammaValue = document.getElementById("gammaValue");

    if (gammaSlider && gammaValue) {
      gammaSlider.addEventListener("input", (e) => {
        const gamma = parseFloat(e.target.value) / 100;
        this.viewer.setGamma(gamma);
        gammaValue.textContent = gamma.toFixed(2);
      });

      // Set initial value
      gammaValue.textContent = (gammaSlider.value / 100).toFixed(2);
    }
  }

  setupSliceTypeControl() {
    const sliceTypeSelect = document.getElementById("sliceType");
    if (sliceTypeSelect) {
      sliceTypeSelect.addEventListener("change", (e) => {
        this.setSliceType(e.target.value);
      });
    }
  }

  setupColorControls() {
    const startColorPicker = document.getElementById("startColor");
    const endColorPicker = document.getElementById("endColor");

    const updateColormap = () => {
      const startColor = this.hexToRgb(startColorPicker.value);
      const endColor = this.hexToRgb(endColorPicker.value);
      this.setCustomColormap(startColor, endColor);
    };

    startColorPicker.addEventListener("input", updateColormap);
    endColorPicker.addEventListener("input", updateColormap);
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

  generateColorMap(color1, color2, steps = 256) {
    const cmap = {
      R: [],
      G: [],
      B: [],
      A: [],
      I: [],
    };

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1); // Calculate interpolation factor (0 to 1)

      // Interpolate RGB values
      const r = Math.round(color1.r + t * (color2.r - color1.r));
      const g = Math.round(color1.g + t * (color2.g - color1.g));
      const b = Math.round(color1.b + t * (color2.b - color1.b));

      // Add interpolated values to the color map
      cmap.R.push(r);
      cmap.G.push(g);
      cmap.B.push(b);

      // Set alpha channel (you can adjust this if needed)
      cmap.A.push(255);

      // Calculate intensity as average of RGB
      cmap.I.push(Math.round((r + g + b) / 3));
    }

    return cmap;
  }

  setCustomColormap(startColor, endColor) {
    if (!this.viewer.volumes || this.viewer.volumes.length === 0) return;

    // Generate color map with interpolation
    const cmap = this.generateColorMap(startColor, endColor);

    const key = "CustomGradient";
    this.viewer.addColormap(key, cmap);
    this.viewer.volumes[0].colormap = key;
    this.viewer.updateGLVolume();
  }

  setSliceType(type) {
    const viewControls = document.getElementById("viewControls");
    const clipperControls = document.getElementById("clipperControls");

    switch (type) {
      case "axial":
        this.viewer.setSliceType(this.viewer.sliceTypeAxial);
        viewControls.classList.remove("hidden");
        clipperControls.classList.add("hidden");
        break;
      case "coronal":
        this.viewer.setSliceType(this.viewer.sliceTypeCoronal);
        viewControls.classList.remove("hidden");
        clipperControls.classList.add("hidden");
        break;
      case "sagittal":
        this.viewer.setSliceType(this.viewer.sliceTypeSagittal);
        viewControls.classList.remove("hidden");
        clipperControls.classList.add("hidden");
        break;
      case "3d":
        this.viewer.setSliceType(this.viewer.sliceTypeRender);
        viewControls.classList.add("hidden");
        clipperControls.classList.remove("hidden");
        break;
      case "multi":
        this.viewer.setSliceType(this.viewer.sliceTypeMultiplanar);
        viewControls.classList.remove("hidden");
        clipperControls.classList.add("hidden");
        break;
    }
  }

  setupSliceTypeControl() {
    const sliceTypeSelect = document.getElementById("sliceType");
    if (sliceTypeSelect) {
      sliceTypeSelect.addEventListener("change", (e) => {
        this.setSliceType(e.target.value);
      });
    }
  }

  setupThresholdControl() {
    const thresholdSlider = document.getElementById("threshold");
    const thresholdValue = document.getElementById("thresholdValue");

    if (thresholdSlider) {
      thresholdSlider.addEventListener("input", (e) => {
        this.updateThreshold(Number(e.target.value));
      });
    }
  }

  updateThreshold(value) {
    if (!this.viewer.volumes || this.viewer.volumes.length === 0) return;

    const volume = this.viewer.volumes[0];
    volume.cal_min = value;
    document.getElementById("thresholdValue").textContent = value.toFixed(2);
    this.viewer.updateGLVolume();
  }

  updateThresholdRange() {
    if (!this.viewer.volumes || this.viewer.volumes.length === 0) return;

    const volume = this.viewer.volumes[0];
    const slider = document.getElementById("threshold");
    const value = document.getElementById("thresholdValue");

    // Get calibrated volume range
    this.volumeRange.min = volume.cal_min;
    this.volumeRange.max = volume.cal_max;

    console.log("Volume range:", this.volumeRange); // Debug log

    // Update slider attributes
    slider.min = this.volumeRange.min;
    slider.max = this.volumeRange.max;
    slider.step = 1;
    slider.value = volume.cal_min;

    // Update displayed value
    value.textContent = volume.cal_min.toFixed(2);
  }

  updateThreshold(value) {
    if (!this.viewer.volumes || this.viewer.volumes.length === 0) return;

    const volume = this.viewer.volumes[0];
    volume.cal_min = value;
    document.getElementById("thresholdValue").textContent = value.toFixed(2);
    this.viewer.updateGLVolume();
  }

  setupInterpolationControl() {
    const smoothCheck = document.getElementById("smoothCheck");
    if (smoothCheck) {
      // Set initial state
      smoothCheck.checked = true; // Default to smooth
      this.viewer.setInterpolation(true);

      smoothCheck.addEventListener("change", (e) => {
        // Note: setInterpolation(true) turns smoothing OFF in the demo
        // so we invert the checkbox value to match the demo's behavior
        this.viewer.setInterpolation(!e.target.checked);
      });
    }
  }

  setupMeshControls() {
    const opacitySlider = document.getElementById("meshOpacitySlider");
    const opacityValue = document.getElementById("meshOpacityValue");
    const reverseFacesCheck = document.getElementById("reverseFacesCheck");
    const colorPicker = document.getElementById("meshColorPicker");
    const saveBitmapBtn = document.getElementById("saveBitmapBtn");

    if (opacitySlider && opacityValue) {
      opacitySlider.addEventListener("input", (e) => {
        if (!this.viewer.meshes || this.viewer.meshes.length === 0) return;
        const compatibleMesh = this.getFirstCompatibleMesh();
        const value = e.target.value * 0.1;
        this.viewer.setMeshLayerProperty(
          compatibleMesh.mesh.id,
          0,
          "opacity",
          value
        );
        opacityValue.textContent = value.toFixed(1);
      });
    }

    if (reverseFacesCheck) {
      reverseFacesCheck.addEventListener("change", () => {
        if (!this.viewer.meshes || this.viewer.meshes.length === 0) return;
        const compatibleMesh = this.getFirstCompatibleMesh();
        this.viewer.reverseFaces(compatibleMesh.mesh.id);
      });
    }

    if (colorPicker) {
      colorPicker.addEventListener("input", (e) => {
        if (!this.viewer.meshes || this.viewer.meshes.length === 0) return;
        const compatibleMesh = this.getFirstCompatibleMesh();
        const color = this.hexToRgb(e.target.value);
        this.viewer.setMeshProperty(compatibleMesh.mesh.id, "rgba255", [
          color.r,
          color.g,
          color.b,
          255,
        ]);
      });
    }

    if (saveBitmapBtn) {
      saveBitmapBtn.addEventListener("click", () => {
        this.viewer.saveScene("Screenshot.png");
      });
    }
  }

  setupShaderControl() {
    const shaderSelect = document.getElementById("shaderSelect");

    if (shaderSelect) {
      // Get available shaders from NiiVue
      const shaders = this.viewer.meshShaderNames();

      // Populate dropdown with shaders
      shaders.forEach((shader) => {
        const option = document.createElement("option");
        option.value = shader;
        option.textContent = shader;
        shaderSelect.appendChild(option);
      });

      // Handle shader changes
      shaderSelect.addEventListener("change", (e) => {
        if (!this.viewer.meshes || this.viewer.meshes.length === 0) return;
        const compatibleMesh = this.getFirstCompatibleMesh();
        const selectedShader = e.target.value;
        if (selectedShader) {
          this.viewer.setMeshShader(compatibleMesh.mesh.id, selectedShader);
        }
      });
    }
  }

  setupMatcapControl() {
    const matcapSelect = document.getElementById("matcapSelect");

    if (matcapSelect) {
      matcapSelect.addEventListener("change", (e) => {
        if (!this.viewer.meshes || this.viewer.meshes.length === 0) return;
        const compatibleMesh = this.getFirstCompatibleMesh();
        const selectedMatcap = e.target.value;
        if (selectedMatcap) {
          // Set shader to Matcap and load the selected texture
          this.viewer.setMeshShader(compatibleMesh.mesh.id, "Matcap");
          this.viewer.loadMatCapTexture(
            "../reload/matcaps/" + selectedMatcap + ".jpg"
          );
        } else {
          // Reset to default shader when "None" is selected
          this.viewer.setMeshShader(compatibleMesh.mesh.id, "");
        }
      });
    }
  }

  setupFiberControls() {
    // Visibility Toggle
    const visibilityBtn = document.getElementById("fiberVisibilityBtn");
    if (visibilityBtn) {
      visibilityBtn.addEventListener("click", () => {
        const compatibleFiber = this.getFirstCompatibleFiber();
        if (!compatibleFiber) return;

        compatibleFiber.mesh.visible = !compatibleFiber.mesh.visible;

        const icon = visibilityBtn.querySelector("i");
        if (icon) {
          icon.className = compatibleFiber.mesh.visible
            ? "fa-solid fa-eye"
            : "fa-solid fa-eye-slash";
        }
        this.viewer.updateGLVolume();
      });
    }

    // Radius Slider
    const radiusSlider = document.getElementById("fiberRadius");
    const radiusValue = document.getElementById("radiusValue");
    if (radiusSlider && radiusValue) {
      radiusSlider.addEventListener("input", (e) => {
        const value = e.target.value * 0.1;
        const compatibleFiber = this.getFirstCompatibleFiber();
        if (compatibleFiber) {
          this.viewer.setMeshProperty(
            compatibleFiber.mesh.id,
            "fiberRadius",
            value
          );
          radiusValue.textContent = value.toFixed(1);
          this.viewer.updateGLVolume();
        }
      });
    }

    // Length Slider
    const lengthSlider = document.getElementById("fiberLengthSlider");
    const lengthValue = document.getElementById("lengthValue");
    if (lengthSlider && lengthValue) {
      lengthSlider.addEventListener("input", (e) => {
        const value = parseInt(e.target.value);
        const compatibleFiber = this.getFirstCompatibleFiber();
        if (compatibleFiber) {
          this.viewer.setMeshProperty(
            compatibleFiber.mesh.id,
            "fiberLength",
            value
          );
          lengthValue.textContent = value;
        }
      });
    }

    // Dither Slider
    const ditherSlider = document.getElementById("fiberDitherSlider");
    const ditherValue = document.getElementById("ditherValue");
    if (ditherSlider && ditherValue) {
      ditherSlider.addEventListener("input", (e) => {
        const value = e.target.value * 0.1;
        const compatibleFiber = this.getFirstCompatibleFiber();
        if (compatibleFiber) {
          this.viewer.setMeshProperty(
            compatibleFiber.mesh.id,
            "fiberDither",
            value
          );
          ditherValue.textContent = value.toFixed(1);
        }
      });
    }

    // Fiber Color Dropdown
    const colorSelect = document.getElementById("fiberColor");
    if (colorSelect) {
      colorSelect.addEventListener("change", (e) => {
        const compatibleFiber = this.getFirstCompatibleFiber();
        if (compatibleFiber) {
          this.viewer.setMeshProperty(
            compatibleFiber.mesh.id,
            "fiberColor",
            e.target.value
          );
        }
      });
    }

    // Fiber Decimation Dropdown
    const decimationSelect = document.getElementById("fiberDecimation");
    if (decimationSelect) {
      decimationSelect.addEventListener("change", (e) => {
        const compatibleFiber = this.getFirstCompatibleFiber();
        if (compatibleFiber) {
          this.viewer.setMeshProperty(
            compatibleFiber.mesh.id,
            "fiberDecimationStride",
            e.target.value
          );
        }
      });
    }
  }

  loadBoostlet = (url) => {
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

      // Load and execute PowerBoost
      this.loadBoostlet(baseurl + scriptName)
        .then(compileAndExecuteBoostlet)
        .catch((error) => console.error("Error loading PowerBoost:", error));

      return true;

    } catch (error) {
      console.error("Error loading file:", error);

      return false;
    }
  }
}

// Initialize viewer
const viewer = new NiiVueViewer("gl1");
export default viewer;
