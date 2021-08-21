// Fibia, the game: class file


//
class Character {
    constructor(coordX, coordY, width, height, health, image, strength) {
        this.coordX = coordX;
        this.coordY = coordY;
        this.width = width;
        this.height = height;
        this.health = health;
        this.image = image;
        this.strength = strength;
        this.velocity = 20;
        this.alive = true;
    }

    // Updating the sprite
    update() {
        context.drawImage(this.image, this.coordX, this.coordY, this.width, this.height);
    }

    // checking if the character is dead 
    checkDeath() {
        if (this.health <= 0) {
            this.alive = false;
            return true;
        }
    }
    
    // Method to check if there is a collision
    collisionDetection() {
        console.log(player.surroundingMonsters); // ------------------------------DEBUGGER
        // first, checking collision with the wall
        let collision = (this.left() < 0 || this.right() > canvas.width || this.top() < 0 || this.bottom() > canvas.height);
        if (collision) return true; // if statement to check whether the collision has occurred
        
        // now checking collision with any given monster from the array of monsters
        for (let i = 0; i < monsters.length; i++) {
            console.log(monsters[i]);
            collision = (
                this.right() > monsters[i].left() && 
                this.left() < monsters[i].right() && 
                this.top() < monsters[i].bottom() && 
                this.bottom() > monsters[i].top());
            if (collision) { // if statement to check whether the collision has occurred
                // For loop the check if the current colliding element is already in the array
                for (let j = 0; j < player.surroundingMonsters.length; j++) {
                    if (player.surroundingMonsters[j] === monsters[i]) {
                        return true;
                    }
                }
                player.surroundingMonsters.push(monsters[i]); // if it doesn't exist, push it
                return true; 
            }
        }
        return false; // if none of the testings above were true, that means: no collision! Thus, return false.
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
}


//
class Player extends Character {
    constructor(coordX, coordY, health, image, level) {
        super(coordX, coordY, 70, 70, health, image, 15);
        this.level = level;
        this.surroundingMonsters = [];
    }
    moveUp() {
        this.coordY -= this.velocity;
        if (this.collisionDetection()){
            this.coordY += this.velocity; // if there was a collision with the movement, revert that movement
            console.log('COLISÃO 1');
            this.causeDamage();
        }
    }
    moveDown() {
        this.coordY += this.velocity;
        if (this.collisionDetection()){
            this.coordY -= this.velocity;
            console.log('COLISÃO 2');
            this.causeDamage();
        }
    }
    moveLeft() {
        this.coordX -= this.velocity;
        if (this.collisionDetection()){
            this.coordX += this.velocity;
            console.log('COLISÃO 3');
            this.causeDamage();
        }
    }
    moveRight() {
        this.coordX += this.velocity;
        if (this.collisionDetection()){
            this.coordX -= this.velocity;
            console.log('COLISÃO 4');
            this.causeDamage();
        }
    }
    causeDamage() {
        console.log('COMBATE', player.health, player.surroundingMonsters[0].health);
        player.health -= player.surroundingMonsters[0].strength;
        player.surroundingMonsters[0].health -= player.strength;
        setInterval(player.causeDamage, 2000); // every two second it will cause damage   
    }


    
}


//
class Monster extends Character {

}


//
class Rat extends Monster {

}


//
class Dragon extends Monster {
    
}


// Class for a generic health bar
class HealthBar {
    constructor(coordX, coordY, color) {
        this.coordX = coordX;
        this.coordY = coordY;
        this.color = color;
        this.width = 50;
        this.height = 10;
        this.maxHealth = player.health;
        this.currentHealth = this.width; // rep
    }
 
    // rendering the healthbar to the screen
    renderHealthBar() {
        this.updateHealthBar();
        // printing the sprite of the health bar
        context.lineWidth = 3;
        context.fillStyle = this.color;
        context.fillRect(this.coordX, this.coordY, this.currentHealth, this.height);
        context.strokeRect(this.coordX, this.coordY, this.width, this.height);
    }
    
    // updating the position and the value of the health bar
    updateHealthBar() {
        this.coordX = player.coordX + 10;
        this.coordY = player.coordY - 5;
        this.currentHealth = (player.health / this.maxHealth) * this.width; // as a percentage
    }   
}