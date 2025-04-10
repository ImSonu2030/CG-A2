import { Config } from "../config.js";

export class Camera {
  constructor() {
    this.position = { x: 0, y: 2, z: 5 };
    this.rotation = { x: 0, y: 0 };
    this.distance = Config.camera.defaultDistance;
    this.viewMode = "3D";
    this.autoRotation = 0;
    this.modelViewMatrix = mat4.create();
    this.projectionMatrix = mat4.create();
  }

  setViewMode(mode) {
    this.viewMode = mode;
    document.getElementById("viewModeText").textContent = `${mode} View`;
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === "3D" ? "TOP" : "3D";
    document.getElementById(
      "viewModeText"
    ).textContent = `${this.viewMode} View`;
    return this.viewMode;
  }

  zoom(delta) {
    if (this.viewMode === "3D") {
      this.distance = Math.max(
        Config.camera.minDistance,
        Math.min(
          Config.camera.maxDistance,
          this.distance + Math.sign(delta) * Config.camera.zoomSpeed
        )
      );
    }
  } 

  rotate(deltaX, deltaY) {
    if (this.viewMode === "3D") {
      this.rotation.y += deltaX * Config.controls.rotationSpeed;
      this.rotation.x = Math.max(
        -Math.PI / 2,
        Math.min(
          Math.PI / 2,
          this.rotation.x + deltaY * Config.controls.rotationSpeed
        )
      );
    }
  }
  update(autoRotate) {
    mat4.identity(this.modelViewMatrix);
    mat4.identity(this.projectionMatrix);

    const canvas = document.getElementById("glCanvas");
    const aspect = canvas.clientWidth / canvas.clientHeight;

    if (this.viewMode === "TOP") {
      const orthoScale = Config.orthographic.scale;
      mat4.ortho(
        this.projectionMatrix,
        -orthoScale * aspect,
        orthoScale * aspect,
        -orthoScale,
        orthoScale,
        0.1,
        100
      );
      mat4.lookAt(this.modelViewMatrix, [0, 10, 0], [0, 0, 0], [0, 0, -1]);
    } else {
      mat4.perspective(
        this.projectionMatrix,
        Config.camera.fov,
        aspect,
        Config.camera.near,
        Config.camera.far
      );

      if (autoRotate) {
        this.autoRotation += 0.01;
        mat4.lookAt(
          this.modelViewMatrix,
          [
            this.distance * Math.sin(this.autoRotation),
            2,
            this.distance * Math.cos(this.autoRotation),
          ],
          [0, 0, 0],
          [0, 1, 0]
        );
      } else {
        const x =
          this.distance * Math.cos(this.rotation.x) * Math.sin(this.rotation.y);
        const y = this.distance * Math.sin(this.rotation.x);
        const z =
          this.distance * Math.cos(this.rotation.x) * Math.cos(this.rotation.y);
        mat4.lookAt(this.modelViewMatrix, [x, y, z], [0, 0, 0], [0, 1, 0]);
      }
    }
  }

  updateAutoRotation(deltaTime, isAutoRotate) {
    if (isAutoRotate) {
      this.autoRotation += deltaTime * 0.5;
    }
  }
}
