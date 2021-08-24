// Fibia, the game: class file

// BASE CLASS: game
class Game {
    constructor() {
        this.frames = 0;
        this.animationId;
    }

    // Method to render the main menu screen
    menu () {
        context.font = '30px serif';
        context.fillStyle = 'black';
        context.fillText('PRESS ENTER TO PLAY.', 170, 350);
    }

    // Method to To clear the canvas
    clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Method to render the game over screen
    gameOver() {
        this.clearCanvas();
        backgroundSound.pause();
        gameOverSound.play();
        context.font = '30px serif';
        context.fillStyle = 'black';
        context.fillText('GAME OVER :(', 300, 350);
    }

    // Method To manage the combat actions and
    combatManager() {
        if (game.frames % 60 === 0) { // every 60 frames (1 seconds if 60fps)
            // player receiving dmg every iteration for every monsters in its surroundings
            player.surroundingMonsters.forEach(monster => { monster.causeDamage(); });
        }   
    }
}


// BASE CLASS: to define attributes and methods for a generic character (player or monster) 
class Character {
    constructor(coordX, coordY, width, height, image, health, strength, velocity) {
        this.coordX = coordX;
        this.coordY = coordY;
        this.width = width;
        this.height = height;
        this.image = image;
        this.health = health;
        this.strength = strength;
        this.velocity = velocity;
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
        // 'super-requirement-order': coordX, coordY, width, height, image, health, strength, velocity
        super(coordX, coordY, 70, 70, playerImg, 10, 150, 30);

        this.level = 1;
        this.surroundingMonsters = [];
        this.experience = 0;
    }
    // 4 Methods to move the player arround. (Checking the collision every step)
    moveUp() {
        this.coordY -= this.velocity;
        if (this.playerCollisionDetection()) { // if there was a collision with the intended movement
            this.coordY += this.velocity; // revert that movement
        } else { // if there was no collision
            this.surroundingMonsters.forEach(monster => { monster.combat = false; }); // if there was a surrounding monster, set its combat to false
            this.surroundingMonsters = []; // clear the surrounding monsters array
        }
    }
    moveDown() {
        this.coordY += this.velocity;
        if (this.playerCollisionDetection()) {
            this.coordY -= this.velocity;
        } else { 
            this.surroundingMonsters.forEach(monster => { monster.combat = false; });
            this.surroundingMonsters = []; 
        }
    }
    moveLeft() {
        this.coordX -= this.velocity;
        if (this.playerCollisionDetection()) {
            this.coordX += this.velocity;
        } else { 
            this.surroundingMonsters.forEach(monster => { monster.combat = false; });
            this.surroundingMonsters = []; 
        }
    }
    moveRight() {
        this.coordX += this.velocity;
        if (this.playerCollisionDetection()) {
            this.coordX -= this.velocity;
        } else { 
            this.surroundingMonsters.forEach(monster => { monster.combat = false; });
            this.surroundingMonsters = []; 
        }
    }

    // Method to check if there is a collision (triggered by the player)
    playerCollisionDetection() {
        console.log('Surrounding (triggered by player)=',player.surroundingMonsters); // -----------------------DEBUGGER
        // first, checking collision with the wall
        let collision = (this.left() <= 0 || this.right() >= canvas.width || this.top() <= 0 || this.bottom() >= canvas.height);
        if (collision) return true; // if statement to check whether the collision has occurred
        
        // now checking collision with any given monster from the array of monsters
        for (let i = 0; i < monsters.length; i++) {
            //console.log('Monster #', i, ':', monsters[i]); // -----------------------DEBUGGER
            if (clashIdentifier(player, monsters[i])) { // if statement to check whether the collision has occurred
                // For loop the check if the current colliding monster is already in the player's array of surrounding
                for (let j = 0; j < player.surroundingMonsters.length; j++) {
                    if (player.surroundingMonsters[j] === monsters[i]) {
                        return true;
                    }
                }
                player.surroundingMonsters.push(monsters[i]); // if it doesn't exist, push it
                monsters[i].combat = true; // updating the status of the monster to true for the combat
                return true; 
            }
        }
        return false; // if none of the testings above were true, that means: no collision! Thus, return false.
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
                    engageCombatSound.play();
                    monster.health -= player.strength;
                    console.log('COMBATE (player atacando):', player.health, monster.health); //------------------------DEBUGGER
            }
        });
    }
}


// SUB CLASS (INTERMEDIATE CLASS): to define attributes and methods for a generic monster 
class Monster extends Character {
    constructor(coordX, coordY, width, height, image, health, strength, velocity, yieldExperience) {
        // 'super-requirement-order': coordX, coordY, width, height, image, health, strength, velocity
        super(coordX, coordY, width, height, image, health, strength, velocity);

        this.yieldExperience = yieldExperience; // amount of experience that it will yield to the player after
        this.combat = false; // not in combat
        this.moveDirection = 0; // 0 - up, 1- down, 2- left and 3- right
    }

    // Method to randomize 
    randomMovement() {
        // This will happend every 120 frames (2 seconds if 60fps) and if the monster isn't in combat
        if (game.frames % 120 === 0 && this.combat === false) { 
            // Generating a new random move direciton for this iteration
            this.moveDirection = Math.floor(Math.random() * 5);
            switch (this.moveDirection) {  // switch statement to check the move direction and then move it
                case 0: // up
                    this.coordY -= this.velocity;
                    if (this.monsterCollisionDetection()) { // if there was a collision with the intended movement
                        this.coordY += this.velocity; // revert that movement
                    }
                    break;
                case 1: // down
                    this.coordY += this.velocity;
                    if (this.monsterCollisionDetection()) { 
                        this.coordY -= this.velocity; 
                    }
                    break;
                case 2: // left
                    this.coordX -= this.velocity;
                    if (this.monsterCollisionDetection()) { 
                        this.coordX += this.velocity; 
                    }
                    break;
                case 3: // right
                    this.coordX += this.velocity;
                    if (this.monsterCollisionDetection()) { 
                        this.coordX -= this.velocity;
                    }
                    break;
            }
        } 
    }

    // Method to cause damage to the player if it is colliding with one or plus monster(s)
    causeDamage() {
        player.health -= this.strength; 
        this.sound.play();
        console.log('COMBATE (monstro atacando):', player.health, this.health); //---------------------------DEBUGGER
    }

    // Method to check if there is a collision (triggered by a monster)
    monsterCollisionDetection() {
        console.log('Surrounding (triggered by monster)=',player.surroundingMonsters); // -----------------------DEBUGGER
        // first, checking collision with the wall
        let collision = (this.left() <= 0 || this.right() >= canvas.width || this.top() <= 0 || this.bottom() >= canvas.height);
        if (collision) return true; // if statement to check whether the collision has occurred
        
        // checking against the player sprite
        if (clashIdentifier(this, player)) {
            player.surroundingMonsters.push(this); // if it doesn't exist, push it
            this.combat = true; // updating the status of the monster to true for the combat
            return true; // stops function and return true 
        }

        // now checking collision with other monsters from the array of monsters
        for (let i = 0; i < monsters.length; i++) {
            for (let j = i + 1; j < monsters.length; j++) {
                if (clashIdentifier(monsters[i], monsters[j])) { // if statement to check whether the collision has occurred
                    return true;
                }
            }
        }
        return false; // if none of the testings above were true, that means: no collision! Thus, return false.
    }
}


// DERIVED CLASS: to instantiate a rat and its attributes
class Rat extends Monster {
    constructor(coordX, coordY) {
        // 'super-requirement-order': coordX, coordY, width, height, image, health, strength, velocity, yieldExperience
        super(coordX, coordY, 70, 70, monster1Img, 20, 3, 30, 250); // (monster#Img comes from 'sprites.js')
        this.sound = ratAttackSound;
    }
}

// DERIVED CLASS: to instantiate a dragon and its attributes 
class Dragon extends Monster {
    constructor(coordX, coordY) {
        // 'super-requirement-order': coordX, coordY, width, height, image, health, strength, velocity, yieldExperience
        super(coordX, coordY, 70, 70, monster2Img, 50, 7, 40, 500);
        this.sound = dragonAttackSound;
    }
}

// DERIVED CLASS: to instantiate a demon and its attributes
class Demon extends Monster {
    constructor(coordX, coordY) {
        // 'super-requirement-order': coordX, coordY, width, height, image, health, strength, velocity, yieldExperience
        super(coordX, coordY, 70, 70,  monster3Img, 100, 15, 60, 1000);
        this.sound = demonAttackSound;
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