export const Config = {
  camera: {
    fov: (45 * Math.PI) / 180,
    near: 0.1,
    far: 100,
    defaultDistance: 5.0,
    minDistance: 2.0,
    maxDistance: 20.0,
    zoomSpeed: 0.5,
  },

  controls: {
    rotationSpeed: 0.01,
    transformation: {
      rotation: 0.1,
      translation: 0.1, 
      scale: 0.1,
    },
    animation: {
      defaultSpeed: 0.01,
      minSpeed: 0.001,
      maxSpeed: 0.05,
    },
  },

  render: {
    clearColor: [0.1, 0.1, 0.1, 1],
    modelColors: {
      default: {
        model1: [0.8, 0.2, 0.2],
        model2: [0.2, 0.4, 0.8],
        xAxis: [1, 0, 0],
        yAxis: [0, 1, 0],
        zAxis: [0, 0, 1],
      },
      selected: [1.0, 1.0, 0.0],
      animating: [0.0, 1.0, 0.5],
    },
  },

  orthographic: { scale: 3 },
};