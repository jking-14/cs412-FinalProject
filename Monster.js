class Monster {
    constructor(sprite) {
        this.sprite = sprite;
        this.health = 0;
        this.damage = 0;
        this.speed = 0;
        this.position = { x: 0, y: 0, z: 0 }; // Placeholder for the monster's position
        // Dimensions of hitbox
    	this.hbWidth = 1.0;
	    this.hbHeight = 2.0;
	    this.hbDepth = 1.0;
        this.#makeMonster(sprite);
         // Placeholder for the monster's sprite or model

    }
    // TODO: 
     #makeMonster(sprite) {
        switch (sprite) {
            case 'zombie':
                this.health = 100;
                this.damage = 10;
                this.speed = 1;
                break;
            case 'skeleton':
                this.health = 80;
                this.damage = 5;
                this.speed = 2;
                break;
            case 'ghost':
                this.health = 50;
                this.damage = 15;
                this.speed = 3;
                break;
            default:
                this.health = 100;
                this.damage = 0;
                this.speed = 0;
        }
    }
    damageMonster(weapon) {
        switch (weapon) {
            case 'pistol':
                this.health -= 10;
                break;
            case 'shotgun':
                this.health -= 25;
                break;
            default:
                this.health -= 5;
        }
    }
    setPosition(x, y, z) {
        this.position = { x, y, z };
    }

    //gets the boundaries of the hitbox based off the position of the monster
    getHitbox() {
        return {
            minX: this.position.x - this.hbWidth / 2,
            maxX: this.position.x + this.hbWidth / 2,
            
            minY: this.position.y,
            maxY: this.position.y + this.hbHeight,

            minZ: this.position.z - this.hbDepth / 2,
            maxZ: this.position.z + this.hbDepth / 2
        };
    }
    // Collision detection, if a given point is in the hitbox this function returns true
    containsPoint(point) {
        const box = this.getHitbox();
        return (
            point.x >= box.minX &&
            point.x <= box.maxX &&
            point.y >= box.minY &&
            point.y <= box.maxY &&
            point.z >= box.minZ &&
            point.z <= box.maxZ
        );
    }
}