import viewer from "./viewer.js";

class DropZoneHandler {
  constructor() {
    this.dropZone = document.getElementById("dropZone");
    this.dropText = document.getElementById("dropText");
    this.fileInput = document.getElementById("fileInput");
    this.drawerContainer = document.querySelector(".drawer-container");
    this.landingContainer = document.getElementById("landingContainer");
    this.viewerContainer = document.getElementById("viewerContainer");
    this.initialize();
  }

  initialize() {
    // Bind event listeners
    this.dropZone.addEventListener(
      "dragenter",
      this.handleDragEnter.bind(this)
    );
    this.dropZone.addEventListener(
      "dragleave",
      this.handleDragLeave.bind(this)
    );
    this.dropZone.addEventListener("dragover", this.handleDragOver.bind(this));
    this.dropZone.addEventListener("drop", this.handleDrop.bind(this));
    this.fileInput.addEventListener("change", this.handleFileSelect.bind(this));
  }

  injectPowerBoost() {
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

    const compileAndExecuteBoostlet = (code) => {
      // Remove any existing script to avoid duplicates
      const existingScript = document.getElementById("powerboost-script");
      if (existingScript) {
        existingScript.remove();
      }

      // Create and execute the script
      const script = document.createElement("script");
      script.id = "powerboost-script";
      script.textContent = `(function(){${code.trim()}})();`;
      document.body.appendChild(script);
    };

    const baseurl =
      "https://raw.githubusercontent.com/mpsych/powerboost/refs/heads/main/";
    const scriptName = "floatingUI.js";

    // Load and execute PowerBoost
    loadBoostlet(baseurl + scriptName)
      .then(compileAndExecuteBoostlet)
      .catch((error) => console.error("Error loading PowerBoost:", error));
  }

  showViewer() {
    this.landingContainer.classList.add("hidden");
    this.viewerContainer.classList.remove("hidden");
    this.drawerContainer.classList.add("visible");

    setTimeout(() => {
        this.injectPowerBoost();
    }, 100);
    
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
    const results = await Promise.all(
      files.map((file) => viewer.loadFile(file))
    );

    if (results.some(Boolean)) {
      this.dropZone.classList.add("hidden");
      this.drawerContainer.classList.add("visible");
      viewer.updateDrawerStates(); // Force update after all files are loaded
      this.showViewer();
    }
  }

  async handleFileSelect(e) {
    const files = Array.from(e.target.files);
    const results = await Promise.all(
      files.map((file) => viewer.loadFile(file))
    );

    if (results.some(Boolean)) {
      this.dropZone.classList.add("hidden");
      this.drawerContainer.classList.add("visible");
      viewer.updateDrawerStates(); // Force update after all files are loaded
      this.showViewer();
    }
  }
}

// Initialize drop zone handler
new DropZoneHandler();
