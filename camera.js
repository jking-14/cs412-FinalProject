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
    Matrix4.perpective(this.projectionMatrix, 75 * Math.PI / 180, aspect, 0.1, 200);
  }

  updateView() {
    const forward = this.getFront();
    const right = this.getRight();
    const up = Vector3.cross(right, forward);

    const pos = this.position;

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
