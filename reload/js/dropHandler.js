import viewer from "./viewer.js";

export class DropZoneHandler {
  constructor(viewer) {
    this.dropZone = document.getElementById("dropZone");
    this.dropText = document.getElementById("dropText");
    this.fileInput = document.getElementById("fileInput");
    this.drawerContainer = document.querySelector(".drawer-container");
    this.landingContainer = document.getElementById("landingContainer");
    this.viewerContainer = document.getElementById("viewerContainer");
    this.viewer = viewer;
    this.initialize();
  }

  initialize() {
    this.dropZone.addEventListener("dragenter", this.handleDragEnter.bind(this));
    this.dropZone.addEventListener("dragleave", this.handleDragLeave.bind(this));
    this.dropZone.addEventListener("dragover", this.handleDragOver.bind(this));
    this.dropZone.addEventListener("drop", this.handleDrop.bind(this));
    this.fileInput.addEventListener("change", this.handleFileSelect.bind(this));
  }

  showViewer() {
    this.landingContainer.classList.add("hidden");
    this.viewerContainer.classList.remove("hidden");
    this.drawerContainer.classList.add("visible");
  }

  handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dropZone.classList.add("dragging");
    this.dropText.textContent = "Drop to load files";
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dropZone.classList.remove("dragging");
    this.dropText.textContent = "Drag & drop your files here";
  }

  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  async handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dropZone.classList.remove("dragging");

    const files = Array.from(e.dataTransfer.files);
    const jsonFiles = files.filter(file => file.name.toLowerCase().endsWith('.json'));
    const dataFiles = files.filter(file => !file.name.toLowerCase().endsWith('.json'));

    const loadPromises = dataFiles.map(file => this.viewer.loadFile(file));
    await Promise.all(loadPromises);


    for (const jsonFile of jsonFiles) {
      try {
        const content = await this.readJSONFile(jsonFile);
        await this.applyConfiguration(content);
      } catch (error) {
        console.error('Error applying JSON configuration:', error);
      }
    }

    if (dataFiles.length > 0 || jsonFiles.length > 0) {
      this.dropZone.classList.add("hidden");
      this.showViewer();
    }
  }

  async handleFileSelect(e) {
    const files = Array.from(e.target.files);
    
    const jsonFiles = files.filter(file => file.name.toLowerCase().endsWith('.json'));
    const dataFiles = files.filter(file => !file.name.toLowerCase().endsWith('.json'));
    
    const loadPromises = dataFiles.map(file => this.viewer.loadFile(file));
    await Promise.all(loadPromises);

    for (const jsonFile of jsonFiles) {
      try {
        const content = await this.readJSONFile(jsonFile);
        await this.applyConfiguration(content);
      } catch (error) {
        console.error('Error applying JSON configuration:', error);
      }
    }

    if (dataFiles.length > 0 || jsonFiles.length > 0) {
      this.dropZone.classList.add("hidden");
      this.showViewer();
    }
  }

  async readJSONFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = JSON.parse(e.target.result);
          resolve(content);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }

  async applyConfiguration(config) {
    // Apply volume configurations
    if (config.volumes) {
      config.volumes.forEach((volumeConfig, index) => {
        if (this.viewer.loadedVolumes[index]?.pane?.pane) {
          this.viewer.loadedVolumes[index].pane.pane.importState(volumeConfig.preset);
          
          // Update any additional state properties
          if (this.viewer.loadedVolumes[index].pane.state) {
            Object.assign(this.viewer.loadedVolumes[index].pane.state, volumeConfig.preset);
          }
        }
      });
    }

    // Apply mesh configurations
    if (config.meshes) {
      config.meshes.forEach((meshConfig, index) => {
        if (this.viewer.loadedMeshes[index]?.pane?.pane) {
          this.viewer.loadedMeshes[index].pane.pane.importState(meshConfig.preset);
          
          if (this.viewer.loadedMeshes[index].pane.state) {
            Object.assign(this.viewer.loadedMeshes[index].pane.state, meshConfig.preset);
          }
        }
      });
    }

    // Apply fiber configurations
    if (config.fibers) {
      config.fibers.forEach((fiberConfig, index) => {
        if (this.viewer.loadedFibers[index]?.pane?.pane) {
          this.viewer.loadedFibers[index].pane.pane.importState(fiberConfig.preset);
          
          if (this.viewer.loadedFibers[index].pane.state) {
            Object.assign(this.viewer.loadedFibers[index].pane.state, fiberConfig.preset);
          }
        }
      });
    }

    // Update the scene state after applying all configurations
    this.viewer.updateSceneState();
    

  }
}

export default DropZoneHandler;