import { Scene } from "./components/Scene.js";
import { Camera } from "./components/Camera.js";
import { Renderer } from "./components/Renderer.js";
import { Controls } from "./components/Controls.js";
import { ModelLoader } from "./utils/ModelLoader.js";

export class App {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.gl = this.canvas.getContext("webgl") || alert("WebGL not supported");
    if (!this.gl) return;

    this.scene = new Scene(this.gl);
    this.camera = new Camera();
    this.renderer = new Renderer(this.gl);
    this.controls = new Controls(this.canvas, this.camera, this.scene);
    this.modelLoader = new ModelLoader(this.gl);

    this.lastTime = 0;
    this.resizeCanvas();
    window.addEventListener("resize", this.resizeCanvas.bind(this));
  }

  async initialize() {
    if (!this.gl) return;

    await this.renderer.initShaderProgram();
    await Promise.all([
      this.modelLoader.loadOBJModel("models/3DModel1.obj", "model1"),
      this.modelLoader.loadOBJModel("models/3DModel2.obj", "model2"),
      this.modelLoader.loadOBJModel("models/3DModelAxis.obj", "xAxis"),
      this.modelLoader.loadOBJModel("models/3DModelAxis.obj", "yAxis"),
      this.modelLoader.loadOBJModel("models/3DModelAxis.obj", "zAxis"),
    ]);

    this.scene.initializeModels(this.modelLoader.getLoadedModels());
    this.scene.setControls(this.controls);
    this.controls.setupEventListeners();
    this.controls.updateSelectedModelInfo();

    requestAnimationFrame(this.render.bind(this)); 
  }

  resizeCanvas() {
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  render(currentTime) {
    currentTime *= 0.001;
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.scene.update(deltaTime, this.controls.autoRotate);
    this.camera.update(this.controls.autoRotate);
    this.controls.updateAnimation(deltaTime);
    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.render.bind(this));
  }
}