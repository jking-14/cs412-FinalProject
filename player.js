class Player {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;

    this.speed = 5.0;
    this.sensitivity = 0.002;
    this.keys = {};

    this.initControls();
  }

  initControls() {
    this.canvas.addEventListener("click", () => {
      this.canvas.requestPointerLock();
    });

    document.addEventListener("keydown", (e) => {
      this.keys[e.code] = true;
    });

    document.addEventListener("keyup", (e) => {
      this.keys[e.code] = false;
    });

    window.addEventListener("blur", () => {
      this.keys = {};
    });

    document.addEventListener("pointerlockchange", () => {
      this.keys = {};
    });

    document.addEventListener("mousemove", (e) => {
      if (document.pointerLockElement !== this.canvas) {
        return;
      }

      this.camera.spin += e.movementX * this.sensitivity;

      this.camera.elevation -= e.movementY * this.sensitivity;

      const limit = 89 * Math.PI / 180;

      this.camera.elevation = Math.max( -limit, Math.min(limit, this.camera.elevation));
    });
  }

  update(dt) {
    if (document.pointerLockElement !== this.canvas) {
      return;
    }

    const forward = this.camera.getFlatFront();
    const right = this.camera.getRight();

    const movement = new Vector3();

    if (this.keys["KeyW"]) {
      movement.x += forward.x;
      movement.z += forward.z;
    }

    if (this.keys["KeyS"]) {
      movement.x -= forward.x;
      movement.z -= forward.z;
    }

    if (this.keys["KeyD"]) {
      movement.x += right.x;
      movement.z += right.z;
    }

    if (this.keys["KeyA"]) {
      movement.x -= right.x;
      movement.z -= right.z;
    }

    if (movement.magnitude() > 0) {
      movement.normalize();

      this.camera.position.x += movement.x * this.speed * dt;

      this.camera.position.z += movement.z * this.speed * dt;
    }
  }
}
