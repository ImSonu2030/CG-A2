import { Model } from "./Model.js";

export class Scene {
  constructor(gl) {
    this.models = {};
    this.rotation = 0;
    this.controls = null;
    this.gl = gl;
  }
  setControls(controls) {
    this.controls = controls;
  }
  initializeModels(loadedModelData) {
    Object.keys(loadedModelData).forEach((modelName) => {
      const modelData = loadedModelData[modelName];
      const model = new Model(
        modelName,
        modelData.vertices,
        modelData.normals,
        modelData.indices,
        modelData.transform
      );
      if (model.vertices.length > 0) {
        model.initBuffers(this.gl);
      }
      this.models[modelName] = model;
    });
  }
  update(deltaTime, autoRotate) {
    if (autoRotate) {
      this.rotation += deltaTime * 0.5;
    }
  }
  getModel(name) {
    return this.models[name] || null;
  }
}
