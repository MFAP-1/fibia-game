// Fibia, the game: class file


class Character {
    constructor(coordX, coordY, health) {
        this.coordX = coordX;
        this.coordY = coordY;
        this.health = health;
        this.velocity = 10;
    }
}


class Player extends Character {
    constructor(coordX, coordY, health, level) {
        super(coordX, coordY, health);
        this.level = level;
    }
    moveUp() {
        this.coordY -= this.velocity;
    }
    moveDown() {
        this.coordY += this.velocity;
    }
    moveLeft() {
        this.coordX -= this.velocity;
    }
    moveRight() {
        this.coordX += this.velocity;
    }
}


class Monster extends Character {
    constructor(coordX, coordY, health) {
        super(coordX, coordY, health);
    }
}


class Rat extends Monster {

}