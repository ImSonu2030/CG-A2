import { Config } from "../config.js";
import { Shader } from "../utils/Shader.js";

export class Renderer {
  constructor(gl) {
    this.gl = gl;
    this.programInfo = null;
  }

  async initShaderProgram() { 
    try {
      const vertexShaderSource = `
            attribute vec4 aVertexPosition;
            attribute vec3 aVertexNormal;
            
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            
            void main() {
                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            }
        `;

      const fragmentShaderSource = `
            precision mediump float;
            
            uniform vec3 uColor;
            
            void main() {
                gl_FragColor = vec4(uColor, 1.0);
            }
        `;

      const vertexShader = Shader.loadShader(
        this.gl,
        this.gl.VERTEX_SHADER,
        vertexShaderSource
      );
      const fragmentShader = Shader.loadShader(
        this.gl,
        this.gl.FRAGMENT_SHADER,
        fragmentShaderSource
      );

      if (!vertexShader || !fragmentShader) {
        throw new Error("Shader compilation failed");
      }

      const shaderProgram = this.gl.createProgram();
      this.gl.attachShader(shaderProgram, vertexShader);
      this.gl.attachShader(shaderProgram, fragmentShader);
      this.gl.linkProgram(shaderProgram);

      if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
        throw new Error(
          `Shader linking error: ${this.gl.getProgramInfoLog(shaderProgram)}`
        );
      }

      this.programInfo = {
        program: shaderProgram,
        attribLocations: {
          vertexPosition: this.gl.getAttribLocation(
            shaderProgram,
            "aVertexPosition"
          ),
          vertexNormal: this.gl.getAttribLocation(
            shaderProgram,
            "aVertexNormal"
          ),
        },
        uniformLocations: {
          projectionMatrix: this.gl.getUniformLocation(
            shaderProgram,
            "uProjectionMatrix"
          ),
          modelViewMatrix: this.gl.getUniformLocation(
            shaderProgram,
            "uModelViewMatrix"
          ),
          color: this.gl.getUniformLocation(
            shaderProgram,
            "uColor"
          ),
        },
      };
    } catch (error) {
      console.error("Error initializing shader program:", error);
      alert(`Shader error: ${error.message}`);
    }
  }

  render(scene, camera) {
    const gl = this.gl;

    gl.clearColor(...Config.render.clearColor);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(this.programInfo.program);

    gl.uniformMatrix4fv(
        this.programInfo.uniformLocations.projectionMatrix,
        false,
        camera.projectionMatrix
    );

    const axisConfigs = [
      { model: scene.models.xAxis, rotation: [0, 0, 0], color: Config.render.modelColors.default.xAxis },
      { model: scene.models.yAxis, rotation: [0, 0, Math.PI / 2], color: Config.render.modelColors.default.yAxis },
      { model: scene.models.zAxis, rotation: [Math.PI / 2, 0, 0], color: Config.render.modelColors.default.zAxis }
    ];

    axisConfigs.forEach(config => {
      this.renderAxis(
        config.model,
        [0, 0, 0],
        config.rotation,
        config.color,
        camera.modelViewMatrix
      );
    });

    const selectedModel = scene.controls ? scene.controls.selectedModel : null;

    Object.keys(scene.models).forEach((modelName) => {
        if (["xAxis", "yAxis", "zAxis"].includes(modelName)) return;

        const model = scene.models[modelName];
        if (!model || !model.buffers) return;

        const isSelected = modelName === selectedModel;
        const color = isSelected
            ? Config.render.modelColors.selected
            : Config.render.modelColors.default[modelName];

        this.renderModel(model, color, camera.modelViewMatrix);
    });
  }

  renderAxis(model, position, rotation, color, viewMatrix) {
    if (!model || !model.buffers) return;

    const modelMatrix = mat4.create();
    mat4.copy(modelMatrix, viewMatrix);
    mat4.translate(modelMatrix, modelMatrix, position);

    if (rotation[0] !== 0) mat4.rotateX(modelMatrix, modelMatrix, rotation[0]);
    if (rotation[1] !== 0) mat4.rotateY(modelMatrix, modelMatrix, rotation[1]);
    if (rotation[2] !== 0) mat4.rotateZ(modelMatrix, modelMatrix, rotation[2]);

    this.gl.uniformMatrix4fv(
      this.programInfo.uniformLocations.modelViewMatrix,
      false,
      modelMatrix
    );
    this.gl.uniform3fv(this.programInfo.uniformLocations.color, color);

    this.bindAndDrawModel(model);
  }

  renderModel(model, color, viewMatrix) {
    if (!model || !model.buffers) return;

    model.updateModelMatrix(viewMatrix);

    this.gl.uniformMatrix4fv(
        this.programInfo.uniformLocations.modelViewMatrix,
        false,
        model.modelMatrix
    );

    let finalColor = Array.isArray(color) 
        ? new Float32Array(color) 
        : color instanceof Float32Array 
            ? color 
            : new Float32Array([1.0, 1.0, 1.0]);

    this.gl.uniform3fv(this.programInfo.uniformLocations.color, finalColor);

    this.bindAndDrawModel(model);
  }

  bindAndDrawModel(model) {
    const gl = this.gl;
    const programInfo = this.programInfo;
    
    gl.bindBuffer(gl.ARRAY_BUFFER, model.buffers.position);
    gl.vertexAttribPointer(
      programInfo.attribLocations.vertexPosition,
      3,
      gl.FLOAT,
      false,
      0,
      0
    );
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    if (programInfo.attribLocations.vertexNormal !== -1) {
      gl.bindBuffer(gl.ARRAY_BUFFER, model.buffers.normal);
      gl.vertexAttribPointer(
        programInfo.attribLocations.vertexNormal,
        3,
        gl.FLOAT,
        false,
        0,
        0
      );
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexNormal);
    }

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.buffers.indices);
    gl.drawElements(
      gl.TRIANGLES,
      model.buffers.count,
      gl.UNSIGNED_SHORT,
      0
    );
  }
}