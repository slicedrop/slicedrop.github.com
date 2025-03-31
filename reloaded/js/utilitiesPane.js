import * as EssentialsPlugin from "https://cdn.jsdelivr.net/npm/@tweakpane/plugin-essentials@0.2.1/dist/tweakpane-plugin-essentials.min.js"

import * as TweakpaneProfilerBladePlugin from "https://cdn.jsdelivr.net/npm/@0b5vr/tweakpane-plugin-profiler@0.4.1/dist/tweakpane-plugin-profiler.min.js";


export class UtilitiesPane {
  constructor(viewer) {
    this.viewer = viewer;
    this.state = {
      json: '', // This will store the JSON representation of all pane states
      wave: 0,
    };

    this.pane = new Pane({
      expanded: true,
      container: document.body

    });

    // Add the essentials plugin
    this.pane.registerPlugin(EssentialsPlugin);

    // Add the profiler blade plugin
    this.pane.registerPlugin(TweakpaneProfilerBladePlugin);

    this.pane.element.classList.add('utilities-pane');

    this.pane.element.style.position = 'fixed';
    this.pane.element.style.top = '20px';
    this.pane.element.style.right = '20px';
    this.pane.element.style.zIndex = '1000000000000';
    this.pane.element.style.width = '300px';
    this.pane.element.style.backdropFilter = 'blur(8px)';

    this.pane.element.style.display = 'none';

    this.setupControls();
    this.setupKeyboardToggle();
  }

  setupKeyboardToggle() {
    document.addEventListener('keydown', (event) => {
      // Check if 'U' or 'u' was pressed
      if (event.key.toLowerCase() === 'u') {
        // Toggle the pane visibility
        this.togglePane();
        this.startPerformanceMonitoring();
      }
    });
  }

  togglePane() {
    const isVisible = this.pane.element.style.display !== 'none';
    
    this.pane.element.style.transition = 'opacity 0.2s ease-in-out';
    
    if (isVisible) {
      // Fade out
      this.pane.element.style.opacity = '0';
      setTimeout(() => {
        this.pane.element.style.display = 'none';
      }, 200);
    } else {
      // Fade in
      this.pane.element.style.opacity = '0';
      this.pane.element.style.display = 'block';
      // Force a reflow
      this.pane.element.offsetHeight;
      this.pane.element.style.opacity = '1';
    }
  }

  setupControls() {
    const performanceFolder = this.pane.addFolder({
      title: 'Performance',
      expanded: true,
    });

    this.memoryGraph = performanceFolder.addBinding(this.state, "wave",{
      readonly: true,
      view: 'graph',  
      label: 'Memory (%)',
      rows: 2,
    })

    this.profiler = performanceFolder.addBlade({
      view: 'profiler',
      label: 'Profiler',
      targetDelta: 1, // Target 1ms per frame
    });

    this.fpsGraph = performanceFolder.addBlade({
      view: 'fpsgraph',
      label: 'FPS',
      rows: 3,
    }).on('tick', () => {
      const max = Math.round(this.fpsGraph.fps) * 1.5;
      if (this.fpsGraph.max < max) {
        this.fpsGraph.max = max;
      }
    });


    const sceneFolder = this.pane.addFolder({
      title: 'Scene Configuration',
      expanded: true
    });

    // Add JSON monitor
    sceneFolder.addBinding(this.state, 'json', {
      readonly: true,
      multiline: true,
      rows: 10,
    });

    // Add export button
    sceneFolder.addButton({
      title: 'Export Scene State'
    }).on('click', () => {
      this.exportConfig();
    });

    sceneFolder.addButton({
      title: 'Save Scene (PNG)'
    }).on('click', () => {
      this.viewer.viewer.saveScene('Screenshot.png');
    });

  }


  startPerformanceMonitoring() {
    let lastTime = performance.now();
    let frames = 0;

    const measure = () => {
      const usedHeap = performance.memory.usedJSHeapSize;
      const totalHeap = performance.memory.jsHeapSizeLimit;
      const memoryPercentage = (usedHeap / totalHeap) * 100;
      this.state.wave = memoryPercentage;

      // Measure overall frame time
      this.profiler.measure('Frame', () => {
        const now = performance.now();
        frames++;

        // Update FPS graph
        if (this.fpsGraph) {
          this.profiler.measure('FPS Update', () => {
            this.fpsGraph.begin();
            performance.now() - now;
            this.fpsGraph.end();
          });
        }

        // Measure viewer rendering if available
        if (this.viewer?.viewer) {
          this.profiler.measure('Render', () => {
            // Measure volume updates
            this.profiler.measure('Volumes', () => {
              if (this.viewer.viewer.volumes?.length > 0) {
                this.viewer.viewer.updateGLVolume();
              }
            });

            // Measure mesh updates
            this.profiler.measure('Meshes', () => {
              if (this.viewer.viewer.meshes?.length > 0) {
                this.viewer.viewer.drawScene?.();
              }
            });

          });
        }

        // Request next frame
        requestAnimationFrame(measure);
      });
    };

    // Start the measurement loop
    requestAnimationFrame(measure);
  }

  // Helper method to wrap profiler measurements
  measureOperation(label, operation) {
    if (this.profiler) {
      return this.profiler.measure(label, operation);
    }
    return operation();
  }

  // Update JSON state with all pane configurations
  updateJSON() {
    this.measureOperation('Update Config', () => {
    const config = {
      volumes: [],
      meshes: [],
      fibers: []
    };

    
    // Get preset from each volume pane
    this.viewer.loadedVolumes?.forEach(({pane}, index) => {
      if (pane && pane.pane) {
        config.volumes.push({
          index,
          preset: pane.pane.exportState()
        });
      }
    });

    // Get preset from each mesh pane
    this.viewer.loadedMeshes?.forEach(({pane}, index) => {
      if (pane && pane.pane) {
        config.meshes.push({
          index,
          preset: pane.pane.exportState()
        });
      }
    });
  
    // Get preset from each fiber pane
    this.viewer.loadedFibers?.forEach(({pane}, index) => {
      if (pane && pane.pane) {
        config.fibers.push({
          index,
          preset: pane.pane.exportState()
        });
      }
    });

    // Update the JSON display
    this.state.json = JSON.stringify(config, null, 2);
  });
  }

  exportConfig() {
    const blob = new Blob([this.state.json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scene-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
