// Fibia, the game: class file


class Character {
    constructor(coordX, coordY, width, height, health, image) {
        this.coordX = coordX;
        this.coordY = coordY;
        this.width = width;
        this.height = height;
        this.health = health;
        this.image = image;
        this.velocity = 20;
    }
    // Updating the sprite
    update() {
        context.drawImage(this.image, this.coordX, this.coordY, this.width, this.height);
    }
    // auxiliary methods for collisionDetection
    left() {
        return this.coordX;
    }
    right() {
        return this.coordX + this.width;
    } 
    top() {
        return this.coordY;
    }
    bottom() {
        return this.coordY + this.height;
    }
    //
    collisionDetection() {
        // first, checking collision with the wall
        let collision = (this.left() < 0 || this.right() > canvas.width || this.top() < 0 || this.bottom() > canvas.height);
        if (collision) return true; // if statement to check whether the collision has occurred
        
        // now checking collision with any given monster from the array of monsters
        for (let i = 0; i < monsters.length; i++) {
            collision = (
                this.right() > monsters[i].left() && 
                this.left() < monsters[i].right() && 
                this.top() < monsters[i].bottom() && 
                this.bottom() > monsters[i].top());
            if (collision) return true; // if statement to check whether the collision has occurred
        }
        return false; // if none of the testings above were true, that means: no collision! Thus, return false.
    }
}


class Player extends Character {
    constructor(coordX, coordY, health, image, level) {
        super(coordX, coordY, 70, 70, health, image);
        this.level = level;
    }
    moveUp() {
        this.coordY -= this.velocity;
        if (this.collisionDetection()){
            this.coordY += this.velocity; // if there was a collision with the movement, revert that movement
            console.log('COLISÃO 1');
        }
    }
    moveDown() {
        this.coordY += this.velocity;
        if (this.collisionDetection()){
            this.coordY -= this.velocity;
            console.log('COLISÃO 2');
        }
    }
    moveLeft() {
        this.coordX -= this.velocity;
        if (this.collisionDetection()){
            this.coordX += this.velocity;
            console.log('COLISÃO 3');
        }
    }
    moveRight() {
        this.coordX += this.velocity;
        if (this.collisionDetection()){
            this.coordX -= this.velocity;
            console.log('COLISÃO 4');
        }
    }
}


class Monster extends Character {

}


class Rat extends Monster {

}


class Dragon extends Monster {
    
}