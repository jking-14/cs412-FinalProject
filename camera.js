class Camera {
  constructor() {
    this.position = new Vector3(0, 1.7, 5);

    this.spin = 0;
    this.elevation = 0;

    this.viewMatrix = new Float32Array(16);
    this.projectionMatrix = new Float32Array(16);
  }

  getFront() {
    return new Vector3(Math.sin(this.spin) * Math.cos(this.elevation), Math.sin(this.elevation), -Math.cos(this.spin) * Math.cos(this.elevation)).normalize();
  }

  getFlatFront() {
    return new Vector3(Math.sin(this.spin), 0, -Math.cos(this.spin));
  }

  getRight() {
    return new Vector3(Math.cos(this.spin), 0, Math.sin(this.spin));
  }

  updateProjection(aspect) {
    const fov = 75 * Math.PI / 180;
    const near = 0.1;
    const far = 200;

    const f = 1.0 / Math.tan(fov / 2);
    const nf = 1.0 / (near - far);

    this.projectionMatrix.set([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, 2 * far * near * nf, 0
    ]);
}

  updateView() {
    const forward = this.getFront();
    const right = this.getRight();
    const up = Vector3.cross(right, forward);

    const p = this.position;

    this.viewMatrix.set([right.x, up.x, -forward.x, 0,
                         right.y, up.y, -forward.y, 0,
                         right.z, up.z, -forward.z, 0,

                         -right.dot(p),
                         -up.dot(p),
                         forward.dot(p),
                         1]);

      return this.viewMatrix;
  }
}
