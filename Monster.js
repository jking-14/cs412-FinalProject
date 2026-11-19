class Monster {
    constructor(sprite) {
        this.sprite = sprite;
        this.health = 0;
        this.damage = 0;
        this.speed = 0;
        this.position = { x: 0, y: 0, z: 0 }; // Placeholder for the monster's position
        this.makeMonster(sprite);
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
}