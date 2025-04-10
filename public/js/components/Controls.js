import { Config } from "../config.js";
import { MathUtils } from "../utils/MathUtils.js";

export class Controls {
  constructor(canvas, camera, scene) {
    this.canvas = canvas;
    this.camera = camera;
    this.scene = scene;

    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.autoRotate = true;
    this.selectedModel = null;
    
    this.pathPoints = [];
    this.isPathSelectionMode = false; 
    this.isAnimating = false;
    this.animationProgress = 0;
    this.animationSpeed = 0.01;
  }

  setupEventListeners() {
    this.canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));
    document.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.canvas.addEventListener("wheel", this.handleMouseWheel.bind(this));
    this.canvas.addEventListener("click", this.handleCanvasClick.bind(this));

    document.addEventListener("keydown", this.handleKeyDown.bind(this));

    const modelSelect = document.getElementById("modelSelect");
    if (modelSelect) {
      modelSelect.addEventListener("change", (e) => {
        this.selectedModel = e.target.value === "both" ? null : e.target.value;
        this.updateSelectedModelInfo();
      });
    }
  }

  handleMouseDown(event) {
    if (this.camera.viewMode === "3D") {
      this.isDragging = true;
      this.previousMousePosition = { x: event.clientX, y: event.clientY };
      this.autoRotate = false;
    }
  }

  handleMouseUp() {
    this.isDragging = false;
  }

  handleMouseMove(event) {
    if (!this.isDragging || this.camera.viewMode !== "3D") return;

    const deltaX = event.clientX - this.previousMousePosition.x;
    const deltaY = event.clientY - this.previousMousePosition.y;

    this.camera.rotate(deltaX, deltaY);

    this.previousMousePosition = { x: event.clientX, y: event.clientY };
  }

  handleMouseWheel(event) {
    this.camera.zoom(event.deltaY);
    event.preventDefault();
  }

  getWebGLCoordinates(event) {
    const rect = this.canvas.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clipX = (x / this.canvas.width) * 2 - 1;
    const clipY = -((y / this.canvas.height) * 2 - 1);

    return { clipX, clipY };
  }

  handleCanvasClick(event) {
    if (this.camera.viewMode !== "TOP") return;
    
    const { clipX, clipY } = this.getWebGLCoordinates(event);
    
    if (this.isPathSelectionMode) {
      const worldPos = MathUtils.screenToWorldCoordinates(
        clipX, 
        clipY, 
        this.canvas, 
        Config.orthographic.scale
      );
      if (this.pathPoints.length > 0) {
        worldPos[1] = this.pathPoints[0][1];
    }
      this.pathPoints.push(worldPos);
      
      return;
    }

    const modelNames = ["model1", "model2"];
    let closestModel = null;
    let closestDistance = Infinity;

    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;

    const orthoWidth = Config.orthographic.scale * aspect;

    modelNames.forEach((modelName) => {
      const model = this.scene.models[modelName];
      if (!model || !model.buffers) return;

      const modelPos = model.transform.position;

      const modelClipX = modelPos[0] / orthoWidth;
      const modelClipY = modelPos[1] / Config.orthographic.scale;

      const dx = clipX - modelClipX;
      const dy = clipY - modelClipY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const scaleFactor = Math.max(...model.transform.scale);
      const selectionRadius = 0.3 * scaleFactor;

      if (distance < selectionRadius && distance < closestDistance) {
        closestDistance = distance;
        closestModel = modelName;
      }
    });

    if (closestModel) {
      this.selectedModel = closestModel;

      const selectElement = document.getElementById("modelSelect");
      if (selectElement) selectElement.value = this.selectedModel;
    }

    this.updateSelectedModelInfo();
  }

  handleKeyDown(event) {
    const key = event.key.toLowerCase();
    
    if (key === 'v') {
        const newViewMode = this.camera.toggleViewMode();
        
        if (newViewMode === "TOP") {
            this.autoRotate = false;
        }
    } 
    else if (key === 'r') {
        this.autoRotate = !this.autoRotate;
    }
    else if (key === 'i' && this.camera.viewMode === "TOP" && this.selectedModel) {
      this.isPathSelectionMode = true;
      this.pathPoints = [];
      
      const model = this.scene.models[this.selectedModel];
      const startPoint = [...model.transform.position];
      this.pathPoints.push(startPoint);
    }
    else if (key === 'enter' && this.pathPoints.length === 3) {
        this.startAnimation();
    }
    else if (key === 's' && this.isAnimating) {
        this.animationSpeed = Math.min(0.05, this.animationSpeed * 1.5);
    }
    else if (key === 'd' && this.isAnimating) {
        this.animationSpeed = Math.max(0.001, this.animationSpeed * 0.7);
    }

    if (
      this.selectedModel &&
      this.scene.models[this.selectedModel] &&
      this.camera.viewMode === "TOP" &&
      !this.isAnimating
    ) {
      const model = this.scene.models[this.selectedModel];

      if (key === "x" || key === "y" || key === "z") {
        const axisIndex = key === "x" ? 0 : key === "y" ? 1 : 2;
        model.transform.rotation[axisIndex] +=
          Config.controls.transformation.rotation;
        this.updateSelectedModelInfo();
      }

      if (key === "arrowup") {
        if (this.camera.viewMode === "TOP") {
          model.transform.position[2] -=
            Config.controls.transformation.translation;
        } else {
          model.transform.position[1] +=
            Config.controls.transformation.translation;
        }
        this.updateSelectedModelInfo();
        event.preventDefault();
      } else if (key === "arrowdown") {
        if (this.camera.viewMode === "TOP") {
          model.transform.position[2] +=
            Config.controls.transformation.translation;
        } else {
          model.transform.position[1] -=
            Config.controls.transformation.translation;
        }
        this.updateSelectedModelInfo();
        event.preventDefault();
      } else if (key === "arrowleft") {
        model.transform.position[0] -=
          Config.controls.transformation.translation;
        this.updateSelectedModelInfo();
        event.preventDefault();
      } else if (key === "arrowright") {
        model.transform.position[0] +=
          Config.controls.transformation.translation;
        this.updateSelectedModelInfo();
        event.preventDefault();
      }

      if (key === "+" || key === "=") {
        model.transform.scale = model.transform.scale.map(
          (s) => s * (1 + Config.controls.transformation.scale)
        );
        this.updateSelectedModelInfo();
      } else if (key === "-" || key === "_") {
        model.transform.scale = model.transform.scale.map(
          (s) => s * (1 - Config.controls.transformation.scale)
        );
        this.updateSelectedModelInfo();
      }
    }
  }

  startAnimation() {
    if (this.pathPoints.length !== 3 || !this.selectedModel) {
      return;
    }
    
    this.isAnimating = true;
    this.animationProgress = 0;
    this.isPathSelectionMode = false;
  }

  updateAnimation(deltaTime) {
    if (!this.isAnimating || !this.selectedModel) return;
    
    this.animationProgress += this.animationSpeed;
    
    const model = this.scene.models[this.selectedModel];
    
    if (this.animationProgress >= 1.0) {
      this.isAnimating = false;
      model.transform.position = [...this.pathPoints[2]];
      this.selectedModel = null;
      this.updateSelectedModelInfo();
      return;
    }
    
    const newPosition = MathUtils.quadraticInterpolation(
      this.pathPoints[0],
      this.pathPoints[1],
      this.pathPoints[2],
      this.animationProgress
    );
    
    model.transform.position = newPosition;
    this.updateSelectedModelInfo();
  }

  updateSelectedModelInfo() {
    const infoElement = document.getElementById("selectedObject");
    if (!infoElement) return;

    if (this.selectedModel && this.scene.models[this.selectedModel]) {
      const model = this.scene.models[this.selectedModel];
      const position = model.transform.position
        .map((p) => p.toFixed(2))
        .join(", ");
      const rotation = model.transform.rotation
        .map((r) => ((r * 180) / Math.PI).toFixed(0) + "°")
        .join(", ");
      const scale = model.transform.scale.map((s) => s.toFixed(2)).join(", ");

      let infoText = `
        <strong>Selected:</strong> ${this.selectedModel}<br>
        <strong>Position:</strong> [${position}]<br>
        <strong>Rotation:</strong> [${rotation}]<br>
        <strong>Scale:</strong> [${scale}]
      `;
      
      if (this.isPathSelectionMode) {
        infoText += `<br><strong>Path Points:</strong> ${this.pathPoints.length}/3`;
      }
      
      if (this.isAnimating) {
        infoText += `<br><strong>Animation:</strong> ${(this.animationProgress * 100).toFixed(0)}%`;
        infoText += `<br><strong>Speed:</strong> ${this.animationSpeed.toFixed(3)}`;
      }

      infoElement.innerHTML = infoText;
    } else {
      infoElement.innerHTML = "No object selected";
    }
  }
}