export class VolumePane {
  constructor(viewer) {
    this.mainViewer = viewer;
    this.viewer = viewer.viewer;
    this.pane = new Pane({
      expanded: true,
      container: document.querySelector(".drawer:first-child .drawer-content"),
    });

    // Initialize state object
    this.state = {
      sliceType: "multi",
      startColor: "#000000",
      opacity: 1,
      xray: 0,
      endColor: "#FFFFFF",
      viewControls: {
        smooth: true,
        invert: false,
        slices: false,
      },
      denoise: {
        otsuLevel: 4, // Very Light 1:4
        doDenoise: false,
        doDilate: true,
      },
      segmentation: {
        clickToSegment: false,
      },
      gamma: 1.0,
      threshold: 0,
      clipper: {
        shadeVolume: false,
        clipColor: "#FFFFFF",
        opacity: 0.5,
        thickness: 1.0,
      },
    };

    this.setupControls();
  }

  setupControls() {
    const updateUtilities = () => {
      this.mainViewer.updateSceneState();
    };

    const mainTab = this.pane.addTab({
      pages: [
        { title: "Slice Type" },
        { title: "Segmentation" },
        { title: "Denoise" },
      ],
    });

    mainTab.pages[0]
      .addBinding(this.state, "sliceType", {
        options: {
          Axial: "axial",
          Coronal: "coronal",
          Sagittal: "sagittal",
          "3D": "3d",
          Multi: "multi",
        },
      })
      .on("change", (ev) => {
        switch (ev.value) {
          case "axial":
            this.viewer.setSliceType(this.viewer.sliceTypeAxial);
            this.toggleClipperControls(false);
            break;
          case "coronal":
            this.viewer.setSliceType(this.viewer.sliceTypeCoronal);
            this.toggleClipperControls(false);
            break;
          case "sagittal":
            this.viewer.setSliceType(this.viewer.sliceTypeSagittal);
            this.toggleClipperControls(false);
            break;
          case "3d":
            this.viewer.setSliceType(this.viewer.sliceTypeRender);
            this.toggleClipperControls(true);
            break;
          case "multi":
            this.viewer.setSliceType(this.viewer.sliceTypeMultiplanar);
            this.toggleClipperControls(false);
            break;
        }

        updateUtilities();
      });

    mainTab.pages[1]
      .addBinding(this.state.segmentation, "clickToSegment", {
        label: "Click to Segment",
      })
      .on("change", (ev) => {
        this.viewer.setDrawingEnabled(ev.value);
        this.viewer.opts.clickToSegment = ev.value;

        if (ev.value) {
          if (this.viewer.opts.penValue < 1 || this.viewer.opts.penValue > 6) {
            this.viewer.setPenValue(1, true);
          }
        }
      });

    mainTab.pages[1]
      .addButton({
        title: "Undo Segmentation",
      })
      .on("click", () => {
        this.viewer.drawUndo();
      });

    mainTab.pages[2]
      .addBinding(this.state.denoise, "otsuLevel", {
        label: "Dark Noise Reduction",
        options: {
          "Very Heavy 3:4": "Very Heavy 3:4",
          "Heavy 2:3": "Heavy 2:3",
          "Medium 1:2": "Medium 1:2",
          "Light 1:3": "Light 1:3",
          "Very Light 1:4": "Very Light 1:4",
          None: "None",
        },
      })
      .on("change", (ev) => {
        if (ev.value === "None") {
          this.restoreOriginal();
        } else {
          this.applyDenoise();
        }
      });

    // Dilate checkbox
    mainTab.pages[2].addBinding(this.state.denoise, "doDilate", {
      label: "Dilate Dark",
    });

    // Denoise checkbox
    mainTab.pages[2].addBinding(this.state.denoise, "doDenoise", {
      label: "Denoise",
    });

    // Apply button
    mainTab.pages[2]
      .addButton({
        title: "Apply",
      })
      .on("click", () => {
        this.applyDenoise();
      });

    // Color Controls
    const colorFolder = this.pane.addFolder({
      title: "Color Range",
    });

    colorFolder
      .addBinding(this.state, "startColor", {
        label: "Start",
        view: "color",
      })
      .on("change", (ev) => {
        this.updateColormap();

        updateUtilities();
      });

    colorFolder
      .addBinding(this.state, "endColor", {
        label: "End",
        view: "color",
      })
      .on("change", (ev) => {
        this.updateColormap();

        updateUtilities();
      });

    colorFolder
      .addBinding(this.state, "opacity", {
        min: 0,
        max: 1,
        step: 0.01,
      })
      .on("change", (ev) => {
        if (!this.viewer.volumes || this.viewer.volumes.length === 0) return;
        this.viewer.setOpacity(0, ev.value);
        this.viewer.updateGLVolume();

        updateUtilities();
      });

    colorFolder
      .addBinding(this.state, "xray", {
        min: 0,
        max: 5,
        step: 0.01,
      })
      .on("change", (ev) => {
        if (!this.viewer.volumes || this.viewer.volumes.length === 0) return;
        this.viewer.opts.meshXRay = ev.value / 10;
        this.viewer.drawScene();

        updateUtilities();
      });

    // View Controls
    const viewFolder = this.pane.addFolder({
      title: "View Controls",
    });

    viewFolder
      .addBinding(this.state.viewControls, "slices")
      .on("change", (ev) => {
        if (ev.value) {
          this.viewer.setVolumeRenderIllumination(-1);
        } else {
          this.viewer.setVolumeRenderIllumination(0);
        }
        updateUtilities();
      });

    viewFolder
      .addBinding(this.state.viewControls, "smooth")
      .on("change", (ev) => {
        this.viewer.setInterpolation(!ev.value);

        updateUtilities();
      });

    viewFolder
      .addBinding(this.state.viewControls, "invert")
      .on("change", (ev) => {
        if (!this.viewer.volumes || this.viewer.volumes.length === 0) return;
        this.viewer.volumes[0].colormapInvert = ev.value;
        this.viewer.updateGLVolume();

        updateUtilities();
      });

    // Gamma Control
    this.pane
      .addBinding(this.state, "gamma", {
        min: 0,
        max: 2,
        step: 0.01,
      })
      .on("change", (ev) => {
        this.viewer.setGamma(ev.value);

        updateUtilities();
      });

    // Threshold Control
    this.pane
      .addBinding(this.state, "threshold", {
        min: 0,
        step: 1,
      })
      .on("change", (ev) => {
        if (!this.viewer.volumes || this.viewer.volumes.length === 0) return;
        const volume = this.viewer.volumes[0];
        volume.cal_min = ev.value;
        this.viewer.updateGLVolume();

        updateUtilities();
      });

    // Clipper Controls (hidden by default)
    this.clipperFolder = this.pane.addFolder({
      title: "Clipper",
      expanded: true,
      hidden: true,
    });

    this.clipperFolder
      .addBinding(this.state.clipper, "shadeVolume")
      .on("change", (ev) => {
        this.isShaded = ev.value;
        let clr = this.viewer.opts.clipPlaneColor;
        const currentOpacity = Math.abs(clr[3]);
        clr[3] = currentOpacity * (this.isShaded ? -1 : 1);
        this.viewer.setClipPlaneColor(clr);

        updateUtilities();
      });

    this.clipperFolder
      .addBinding(this.state.clipper, "clipColor", {
        picker: "inline",
        expanded: true,
      })
      .on("change", (ev) => {
        const color = this.hexToRgb(ev.value);
        let clr = this.viewer.opts.clipPlaneColor;
        const currentOpacity = Math.abs(clr[3]);
        clr = [
          color.r / 255,
          color.g / 255,
          color.b / 255,
          currentOpacity * (this.isShaded ? -1 : 1),
        ];
        this.viewer.setClipPlaneColor(clr);

        updateUtilities();
      });

    this.clipperFolder
      .addBinding(this.state.clipper, "opacity", {
        min: 0,
        max: 1,
        step: 0.01,
      })
      .on("change", (ev) => {
        let clr = this.viewer.opts.clipPlaneColor;
        // Preserve RGB values
        const rgb = [clr[0], clr[1], clr[2]];
        // Set new opacity with correct sign based on shade state
        const newOpacity = ev.value * (this.isShaded ? -1 : 1);
        clr = [...rgb, newOpacity];
        this.viewer.setClipPlaneColor(clr);

        updateUtilities();
      });

    this.clipperFolder
      .addBinding(this.state.clipper, "thickness", {
        min: 0.01,
        max: 1,
        step: 0.01,
      })
      .on("change", (ev) => {
        this.viewer.setClipPlaneThick(ev.value);

        updateUtilities();
      });
  }

  restoreOriginal() {
    if (this.mainViewer.originalImage && this.viewer.volumes?.[0]) {
      this.viewer.volumes[0].img = this.mainViewer.originalImage.slice();
      this.viewer.updateGLVolume();
    }
  }

  applyDenoise() {
    // Skip if 'None' is selected
    if (this.state.denoise.otsuLevel === "None") {
      this.restoreOriginal();
      return;
    }

    const imgRaw = this.mainViewer.originalImage.slice();
    let img = this.viewer.volumes[0].img;

    // Get volume dimensions
    const nx = this.viewer.volumes[0].dims[1];
    const ny = this.viewer.volumes[0].dims[2];
    const nz = this.viewer.volumes[0].dims[3];

    // Calculate Otsu threshold based on level
    let otsu = 2;
    const level =
      [
        "Very Heavy 3:4",
        "Heavy 2:3",
        "Medium 1:2",
        "Light 1:3",
        "Very Light 1:4",
        "None",
      ].indexOf(this.state.denoise.otsuLevel) + 1;

    if (level === 5 || level === 1) {
      otsu = 4;
    }
    if (level === 4 || level === 2) {
      otsu = 3;
    }

    const thresholds = this.viewer.findOtsu(otsu);
    if (thresholds.length < 3) {
      return;
    }

    let threshold = thresholds[0];
    if (level === 1) {
      threshold = thresholds[2];
    }
    if (level === 2) {
      threshold = thresholds[1];
    }

    const mn = this.viewer.volumes[0].global_min;
    if (level > 5) {
      // no Otsu
      threshold = mn;
    }

    // Apply denoising if selected
    if (this.state.denoise.doDenoise) {
      const xInc = 1;
      const yInc = nx;
      const zInc = nx * ny;
      let i = 0;

      for (let z = 0; z < nz; z++) {
        for (let y = 0; y < ny; y++) {
          for (let x = 0; x < nx; x++) {
            let val = imgRaw[i];
            if (
              x > 0 &&
              y > 0 &&
              z > 0 &&
              x < nx - 1 &&
              y < ny - 1 &&
              z < nz - 1
            ) {
              // Get 6-neighbor values
              const vals = [
                val,
                imgRaw[i - xInc],
                imgRaw[i + xInc],
                imgRaw[i - yInc],
                imgRaw[i + yInc],
                imgRaw[i - zInc],
                imgRaw[i + zInc],
              ];

              // Calculate weighted average
              const centerWeight = 4;
              let vsum = val * centerWeight;
              let vmin = val;
              let vmax = val;

              for (let v = 1; v < vals.length; v++) {
                vmin = Math.min(vmin, vals[v]);
                vmax = Math.max(vmax, vals[v]);
                vsum += vals[v];
              }

              val = (vsum - vmin - vmax) / (4 + centerWeight);
            }
            img[i] = val;
            i++;
          }
        }
      }
    }

    // Apply dilation if selected
    if (this.state.denoise.doDilate && level < 6) {
      let imgMx = imgRaw.slice();
      let i = 0;
      const xInc = 1;
      const yInc = nx;
      const zInc = nx * ny;

      for (let z = 0; z < nz; z++) {
        for (let y = 0; y < ny; y++) {
          for (let x = 0; x < nx; x++) {
            let mx = imgRaw[i];
            if (
              x > 0 &&
              y > 0 &&
              z > 0 &&
              x < nx - 1 &&
              y < ny - 1 &&
              z < nz - 1
            ) {
              // Check all 26 neighbors
              // Face neighbors (6)
              mx = Math.max(
                mx,
                imgRaw[i - xInc],
                imgRaw[i + xInc],
                imgRaw[i - yInc],
                imgRaw[i + yInc],
                imgRaw[i - zInc],
                imgRaw[i + zInc]
              );
            }
            imgMx[i] = mx;
            i++;
          }
        }
      }

      // Apply threshold
      for (let v = 0; v < img.length; v++) {
        if (imgMx[v] < threshold) {
          img[v] = mn;
        }
      }
    }

    // Update the volume
    this.viewer.updateGLVolume();
  }

  toggleClipperControls(show) {
    this.clipperFolder.hidden = !show;
  }

  updateColormap() {
    const startColor = this.hexToRgb(this.state.startColor);
    const endColor = this.hexToRgb(this.state.endColor);

    // Generate color map with interpolation
    const cmap = this.generateColorMap(startColor, endColor);

    const key = "CustomGradient";
    this.viewer.addColormap(key, cmap);
    this.viewer.volumes[0].colormap = key;
    this.viewer.updateGLVolume();
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

  updateThresholdRange() {
    if (!this.viewer.volumes || this.viewer.volumes.length === 0) return;

    const volume = this.viewer.volumes[0];

    // Update the threshold input constraints
    const thresholdInput = this.pane.children.find(
      (child) => child.label === "threshold"
    );

    if (thresholdInput) {
      thresholdInput.min = volume.cal_min;
      thresholdInput.max = volume.cal_max;
      this.state.threshold = volume.cal_min;
      thresholdInput.refresh();
    }
  }
}

export default VolumePane;
