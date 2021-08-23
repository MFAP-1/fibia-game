// Fibia, the game: class file

// BASE CLASS: game
class Game {
    constructor() {
        this.frames = 0;
        this.animationId;
    }

    // Method: render the main menu screen
    menu () {
        context.font = '30px serif';
        context.fillStyle = 'black';
        context.fillText('PRESS ENTER TO PLAY.', 170, 350);
    }

    // Method: To clear the canvas
    clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Method: To terminate the game 
    gameOver() {
        this.clearCanvas();
        context.font = '30px serif';
        context.fillStyle = 'black';
        context.fillText('GAME OVER :(', 300, 350);
    }
}


// BASE CLASS: to define attributes and methods for a generic character (player or monster) 
class Character {
    constructor(coordX, coordY, width, height, health, image, strength) {
        this.coordX = coordX;
        this.coordY = coordY;
        this.width = width;
        this.height = height;
        this.health = health;
        this.image = image;
        this.strength = strength;
        this.velocity = 30;
        this.alive = true;
    }

    // Method to update the sprite of any given character
    updateSprite() {
        context.drawImage(this.image, this.coordX, this.coordY, this.width, this.height);
    }

    // Method to check if the character is dead 
    checkDeath() {
        if (this.health <= 0) {
            this.alive = false;
            return true;
        }
    }
    
    // Method to check if there is a collision
    collisionDetection() {
        console.log('Surrounding=',player.surroundingMonsters); // -----------------------DEBUGGER
        // first, checking collision with the wall
        let collision = (this.left() <= 0 || this.right() >= canvas.width || this.top() <= 0 || this.bottom() >= canvas.height);
        if (collision) return true; // if statement to check whether the collision has occurred
        
        // now checking collision with any given monster from the array of monsters
        for (let i = 0; i < monsters.length; i++) {
            console.log('Monster #', i, ':', monsters[i]); // -----------------------DEBUGGER
            if (clashIdentifier(player, monsters[i])) { // if statement to check whether the collision has occurred
                // For loop the check if the current colliding monster is already in the player's array of surrounding
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

    // auxiliary methods for collisionDetection() and clashIdentifier()
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


// SUB CLASS: to define attributes and methods for the player 
class Player extends Character {
    constructor(coordX, coordY) {
        // 'super-requirement-order': coordX, coordY, width, height, health, image, strength
        super(coordX, coordY, 70, 70, 150, playerImg, 15);

        this.level = 1;
        this.surroundingMonsters = [];
        this.experience = 0;
    }
    // 4 Methods to move the player arround. (Checking the collision every step)
    moveUp() {
        this.coordY -= this.velocity;
        if (this.collisionDetection()) { // if there was a collision with the intended movement
            this.coordY += this.velocity; // revert that movement
            console.log('COLISÃO 1'); // ------------------------------DEBUGGER
            this.surroundingMonsters.forEach(monster => { monster.causeDamage(); });
        } else { // if there was no collision
            this.surroundingMonsters = []; // clear the surrounding monsters array
        }
    }
    moveDown() {
        this.coordY += this.velocity;
        if (this.collisionDetection()) {
            this.coordY -= this.velocity;
            console.log('COLISÃO 2'); 
            this.surroundingMonsters.forEach(monster => { monster.causeDamage(); });
        } else { 
            this.surroundingMonsters = []; 
        }
    }
    moveLeft() {
        this.coordX -= this.velocity;
        if (this.collisionDetection()) {
            this.coordX += this.velocity;
            console.log('COLISÃO 3'); 
            this.surroundingMonsters.forEach(monster => { monster.causeDamage(); });
        } else { 
            this.surroundingMonsters = []; 
        }
    }
    moveRight() {
        this.coordX += this.velocity;
        if (this.collisionDetection()) {
            this.coordX -= this.velocity;
            console.log('COLISÃO 4'); 
            this.surroundingMonsters.forEach(monster => { monster.causeDamage(); });
        } else { 
            this.surroundingMonsters = []; 
        }
    }
    
    // 
    levelUp() {
        const experienceTable = [1000, 2050, 4200, 8600, 17600]; // pre-defined amounts of experience required for leveling up
        for (let i = 0; i < experienceTable.length; i++) {
            if (this.experience > experienceTable[i]){
                this.level = i + 2; // +2 cause in the 0 index is the level up from lvl 1 to 2. and so on.
            }
        }
        // updating the level on the screen
        const levelDisplayElement = document.querySelector('div span');
        levelDisplayElement.innerHTML = this.level;
    }

    // 
    attack(clickedX, clickedY) {
        console.log('player is attacking (!!). He clicked at x: ', clickedX, '/ y: ',clickedY);//---------------------DEBUGGER
        // for meele attack, check if the clicked monster is surrounding the player
        this.surroundingMonsters.forEach(monster => {
            if ((clickedX >= monster.coordX && clickedX <= monster.coordX + monster.width) &&
                (clickedY >= monster.coordY && clickedY <= monster.coordY + monster.height)) {
                    monster.health -= player.strength;
            }
        });
    }
}


// SUB CLASS (INTERMEDIATE CLASS): to define attributes and methods for a generic monster 
class Monster extends Character {
    constructor(coordX, coordY, width, height, health, image, strength, yieldExperience) {
        // 'super-requirement-order': coordX, coordY, width, height, health, image, strength
        super(coordX, coordY, width, height, health, image, strength);

        this.yieldExperience = yieldExperience;
        this.move = 0; // 0 - up, 1- down, 2- left and 3- right
    }

    randomMovement() {
        switch (this.move) {
            case 0: 
                this.coordY -= this.velocity;
                this.move = Math.floor(Math.random() * 4);
                break;
            case 1:
                this.coordY += this.velocity;
                this.move = Math.floor(Math.random() * 4);
                break;
            case 2: 
                this.coordX -= this.velocity;
                this.move = Math.floor(Math.random() * 4);
                break;
            case 3: 
                this.coordX += this.velocity;
                this.move = Math.floor(Math.random() * 4);
                break;
        }
    }

    // Method to cause damage to the player if it is colliding with one or plus monster(s)
    causeDamage() {
        console.log('COMBATE', player.health, this.health); //---------------------------DEBUGGER
        player.health -= this.strength; 
    }
}


// DERIVED CLASS: to instantiate a rat and its attributes
class Rat extends Monster {
    constructor(coordX, coordY) {
        // 'super-requirement-order': coordX, coordY, width, height, health, image, strength, yieldExperience
        super(coordX, coordY, 70, 70, 20, monster1Img, 3, 250); // (monster#Img comes from 'sprites.js')
    }
}

//  DERIVED CLASS: to instantiate a dragon and its attributes 
class Dragon extends Monster {
    constructor(coordX, coordY) {
        // 'super-requirement-order': coordX, coordY, width, height, health, image, strength, yieldExperience
        super(coordX, coordY, 70, 70, 50, monster2Img, 7, 500);
    }
}

//  DERIVED CLASS: to instantiate a demon and its attributes
class Demon extends Monster {
    constructor(coordX, coordY) {
        // 'super-requirement-order': coordX, coordY, width, height, health, image, strength, yieldExperience
        super(coordX, coordY, 70, 70, 100, monster3Img, 15, 1000);
    }
}


// BASE CLASS: for a generic health bar
class HealthBar {
    constructor(coordX, coordY, color, maxHealth) {
        this.coordX = coordX;
        this.coordY = coordY;
        this.color = color;
        this.maxHealth = maxHealth;
        
        this.width = 50;
        this.height = 10;
        this.currentHealth = this.width; // rep
    }
 
    // rendering the healthbar to the screen // printing the sprite of the health bar
    renderHealthBar() {
        context.lineWidth = 3;
        context.fillStyle = this.color;
        context.fillRect(this.coordX, this.coordY, this.currentHealth, this.height);
        context.strokeRect(this.coordX, this.coordY, this.width, this.height);
    }
    
    // updating the position and the value of the health bar
    updateHealthBar(characterCoordX, characterCoordY, characterHealth) {
        this.coordX = characterCoordX + 10; // esse +10 -5 devem sair depois de arrumar as sprites direitinho
        this.coordY = characterCoordY - 5;
        this.currentHealth = (characterHealth / this.maxHealth) * this.width; // as a percentage

        // to render/print on the screen
        this.renderHealthBar();
    }   
}