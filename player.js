class Player {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;

    this.speed = 5.0;
    this.sensitivity = 0.002;
    this.keys = {};

    // Player hitbox
    this.hbWidth = 0.6;
    this.hbHeight = 1.8;
    this.hbDepth = 0.6;

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

      this.camera.elevation = Math.max(-limit, Math.min(limit, this.camera.elevation));
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

      // Calculate the proposed position
      const newPosition = new Vector3(
        this.camera.position.x + movement.x * this.speed * dt,
        this.camera.position.y,
        this.camera.position.z + movement.z * this.speed * dt
      );

      // Only move if hitboxes dont overlap
      if (!this.checkCollision(newPosition)) {
        this.camera.position.x = newPosition.x;
        this.camera.position.z = newPosition.z;
      }
    }
  }

  // Gets hitbox position based off camera position
  getHitbox(position = this.camera.position) {
    return {
      minX: position.x - this.hbWidth / 2,
      maxX: position.x + this.hbWidth / 2,

      minY: position.y - 1.7,
      maxY: position.y - 1.7 + this.hbHeight,

      minZ: position.z - this.hbDepth / 2,
      maxZ: position.z + this.hbDepth / 2
    };
  }

  checkCollision(position) {
    const playerBox = this.getHitbox(position);
    for (const monster of gMonsters) {
      const monsterBox = monster.getHitbox();
      // Check for overlap on all three axes
      if (playerBox.minX < monsterBox.maxX &&
        playerBox.maxX > monsterBox.minX &&

        playerBox.minY < monsterBox.maxY &&
        playerBox.maxY > monsterBox.minY &&

        playerBox.minZ < monsterBox.maxZ &&
        playerBox.maxZ > monsterBox.minZ) {
        return true;
      }
    }
    return false;
  }

}
