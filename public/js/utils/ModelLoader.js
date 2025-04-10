export class ModelLoader {
  constructor(gl) {
    this.gl = gl;
    this.loadedModels = {
      model1: {
        vertices: [],
        normals: [],
        indices: [],
        transform: {
          position: [-1, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
        },
      },
      model2: {
        vertices: [],
        normals: [],
        indices: [],
        transform: {
          position: [1, 0, 0],
          rotation: [0, 0, 0],
          scale: [1, 1, 1],
        },
      },
      xAxis: { vertices: [], normals: [], indices: [] },
      yAxis: { vertices: [], normals: [], indices: [] },
      zAxis: { vertices: [], normals: [], indices: [] },
    };
  }
  getLoadedModels() {
    return this.loadedModels;
  }
  async loadOBJModel(url, modelName) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to load: ${url}`);

      const objText = await response.text();
      this.parseOBJ(objText, modelName);

      return this.loadedModels[modelName];
    } catch (error) {
      console.error(`Error loading ${modelName}:`, error);
    }
  }
  parseOBJ(objText, modelName) {
    const positions = [],
      normalVectors = [],
      vertices = [],
      normals = [],
      indices = [];

    objText.split("\n").forEach((line) => {
      line = line.trim();
      if (!line || line.startsWith("#")) return;

      const parts = line.split(/\s+/);
      const prefix = parts[0];

      if (prefix === "v") {
        positions.push(...parts.slice(1, 4).map(parseFloat));
      } else if (prefix === "vn") {
        normalVectors.push(...parts.slice(1, 4).map(parseFloat));
      } else if (prefix === "f") {
        const faceIndices = [];
        parts.slice(1).forEach((part) => {
          const subparts = part.split("/");
          const vertexIndex = parseInt(subparts[0]) - 1;

          vertices.push(
            positions[vertexIndex * 3],
            positions[vertexIndex * 3 + 1],
            positions[vertexIndex * 3 + 2]
          );

          if (subparts.length > 2 && subparts[2]) {
            const normalIndex = parseInt(subparts[2]) - 1;
            normals.push(
              normalVectors[normalIndex * 3],
              normalVectors[normalIndex * 3 + 1],
              normalVectors[normalIndex * 3 + 2]
            );
          }

          faceIndices.push(vertices.length / 3 - 1);
        });

        for (let j = 1; j < faceIndices.length - 1; j++) {
          indices.push(faceIndices[0], faceIndices[j], faceIndices[j + 1]);
        }
      }
    });

    this.loadedModels[modelName].vertices = new Float32Array(vertices);
    this.loadedModels[modelName].normals = new Float32Array(normals);
    this.loadedModels[modelName].indices = new Uint16Array(indices);
  }
}
