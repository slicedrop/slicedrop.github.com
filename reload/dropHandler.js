import viewer from "./viewer.js";

class DropZoneHandler {
  constructor() {
    this.dropZone = document.getElementById("dropZone");
    this.dropText = document.getElementById("dropText");
    this.fileInput = document.getElementById("fileInput");
    this.drawerContainer = document.querySelector(".drawer-container");
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

  handleDragEnter(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dropZone.classList.add("dragging");
    this.dropText.textContent = "Drop to load file";
  }

  handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dropZone.classList.remove("dragging");
    this.dropText.textContent = "Drag & drop your file here";
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
    }
  }
}

// Initialize drop zone handler
new DropZoneHandler();
