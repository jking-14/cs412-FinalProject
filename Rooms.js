
class Room {
    constructor (difficulty, roomNumber){
        this.difficulty = difficulty;
        this.roomType = setRoomType(roomNumber);
        this.numMosnters = 0;
        this.chest = null;
        this.monsters = [];


    }
    #library() {
        return room;
    }
    #kitchen() {
    }
    #hallway() {
    }
    #graveYard() {
    }
    #bedroom() {
    }
    #dinningRoom() {
    }

    #setRoomType(roomNumber){
        switch (roomNumber) {
            case 1:
                this.roomType = library();
                break;
            case 2:
                this.roomType = kitchen();
                break;
            case 3:
                this.roomType = hallway();
                break;
            case 4:
                this.roomType = graveYard();
                break;
            case 5:
                this.roomType = bedroom();
                break;
            case 6:
                this.roomType = dinningRoom();
                break;
            default:
                this.roomType = library();
        }
    }
    #setNumMonsters(difficulty) {
        switch (difficulty) {
            case 'easy':
                this.numMosnters = math.floor(Math.random() * 3); // Randomly 0 or 2 monsters
                break;
            case 'medium':
                this.numMosnters = math.floor(Math.random() * 4); // Randomly 0 to 3 monsters
                break;
            case 'hard':
                this.numMosnters = math.floor(Math.random() * 5); // Randomly 0 to 4 monsters
                break;
            default:
                this.numMosnters = 1;
        }
    
    }
}