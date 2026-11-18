class Environment {
  static createFloor(gl, size = 100) {
    const half = size / 2;

    const vertices = [
      -half, 0, -half,
      -half, 0, half,
      half, 0, half,
      half, 0, -half];

    const indices = [
      0, 1, 2,
      0, 2, 3];

    const normals = [
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,
      0, 1, 0,];

    const mesh = gl.fCreateMeshVAO("floor", indices, vertices, normals, null);

    return new Model(mesh).setColor(0.5, 0.5, 0.5);
  }
}
