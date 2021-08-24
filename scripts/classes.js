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
        context.fillStyle = 'bisque';
        context.fillText('PRESS ENTER TO PLAY.', 160, 340);
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
        context.fillStyle = 'bisque';
        context.fillText('GAME OVER :(', 250, 350);
    }

    // Method To manage the combat actions and
    combatManager() {
        if (game.frames % 60 === 0) { // every 60 frames (1 seconds)
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
        if (this.monsterId !== 4){  // ------------- IF ELSE TO DEBUG THE ANT
            if (game.frames % 30 === 0) { // every 30 frames (0.5 seconds)
                this.generateAnimationType(); // to change the animation
            }
            this.animateSprite();
        } else { 
            context.drawImage(this.image, this.coordX, this.coordY, this.width, this.height);
        }
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
        super(coordX, coordY, 65, 65, playerImg, 150, 15, 32.5);

        this.level = 1;
        this.surroundingMonsters = [];
        this.experience = 0;
        this.sx = 15;
        this.sy = 20;
        this.animationtype = 1;  // either 1 or 2. only 2 sprits for every diretcion
    }
    // 4 Methods to move the player arround. (Checking the collision every step)
    moveUp() {
        this.coordY -= this.velocity;
        this.sx = 80;
        this.yAnimationType();
        footstepSound.play();
        if (this.playerCollisionDetection()) { // if there was a collision with the intended movement
            this.coordY += this.velocity; // revert that movement
        } else { // if there was no collision
            this.surroundingMonsters.forEach(monster => { monster.combat = false; }); // if there was a surrounding monster, set its combat to false
            this.surroundingMonsters = []; // clear the surrounding monsters array
        }
    }
    moveDown() {
        this.coordY += this.velocity;
        this.sx = 15;
        this.yAnimationType();
        footstepSound.play();
        if (this.playerCollisionDetection()) {
            this.coordY -= this.velocity;
        } else { 
            this.surroundingMonsters.forEach(monster => { monster.combat = false; });
            this.surroundingMonsters = []; 
        }
    }
    moveLeft() {
        this.coordX -= this.velocity;
        this.sx = 212;
        this.yAnimationType();
        footstepSound.play();
        if (this.playerCollisionDetection()) {
            this.coordX += this.velocity;
        } else { 
            this.surroundingMonsters.forEach(monster => { monster.combat = false; });
            this.surroundingMonsters = []; 
        }
    }
    moveRight() {
        this.coordX += this.velocity;
        this.sx = 145;
        this.yAnimationType();
        footstepSound.play();
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

    // Method to update and animate the sprite of the player
    animateSprite() {
        context.drawImage(this.image, this.sx, this.sy, 45, 45, this.coordX, this.coordY, this.width, this.height);
    }

    // auxiliary method
    yAnimationType() {
        if (this.animationtype === 1) { 
            this.sy = 83;
            this.animationtype = 2;
        } else {
            this.sy = 20;
            this.animationtype = 1;
        }
    }
}


// SUB CLASS (INTERMEDIATE CLASS): to define attributes and methods for a generic monster 
class Monster extends Character {
    constructor(coordX, coordY, width, height, image, health, strength, velocity, yieldExperience, moveCooldown) {
        // 'super-requirement-order': coordX, coordY, width, height, image, health, strength, velocity
        super(coordX, coordY, width, height, image, health, strength, velocity);

        this.yieldExperience = yieldExperience; // amount of experience that it will yield to the player after
        this.combat = false; // not in combat
        this.moveDirection = 0; // 0 - up, 1- down, 2- left and 3- right
        this.moveCooldown = moveCooldown;
    }

    // Method to randomize the movement for a monster
    randomMovement() {
        // This will happend if the monster isn't in combat, and every interval of time defined by the "moveCooldown" attribuite. Example: 120 frames (2 seconds) for the Rat class. 
        if (game.frames % this.moveCooldown === 0 && this.combat === false) { 
            // Generating a new random move direciton for this iteration
            this.moveDirection = Math.floor(Math.random() * 4);
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
        console.log('COMBATE (monstro atacando):', player.health, this.health); //-----------------------DEBUGGER
    }

    // Method to check if there is a collision (triggered by a monster)
    monsterCollisionDetection() {
        console.log('Surrounding (triggered by monster)=',player.surroundingMonsters); // ----------------DEBUGGER
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
        return false; // if none of the testings above were true, that means: no collision!  Thus, return false.
    }
}


// DERIVED CLASS: to instantiate a Giant-Ant and its attributes 
class GiantAnt extends Monster {
    constructor(coordX, coordY) {
        // 'super-requirement-order': coordX, coordY, width, height, image, health, strength, velocity, yieldExperience, moveCooldown
        super(coordX, coordY, 65, 65, monster1Img, 20, 3, 32.5, 250, 120);
        this.sound = giantAntAttackSound;
        this.monsterId = 1;
        this.sx = 780;
        this.sy = 10;
        this.animationtype = 1;  // either 1, 2 or 3. only 3 sprits for every diretcion
    }
    
    // auxiliary method to generate the correct animation type
    generateAnimationType() {
        switch (this.moveDirection) { 
            case 0: // up
                if (this.animationtype === 1) { 
                    this.sx = 906;
                    this.sy = 10;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 652;
                    this.sy = 10;
                    this.animationtype = 3;
                } else {
                    this.sx = 140;
                    this.sy = 81;
                    this.animationtype = 1;
                }
                break;
            case 1: // down
                if (this.animationtype === 1) { 
                    this.sx = 780;
                    this.sy = 10;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 12;
                    this.sy = 81;
                    this.animationtype = 3;
                } else {
                    this.sx = 262;
                    this.sy = 70;
                    this.animationtype = 1;
                }
                break;
            case 2: // left
                if (this.animationtype === 1) { 
                    this.sx = 844;
                    this.sy = 10;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 76;
                    this.sy = 81;
                    this.animationtype = 3;
                } else {
                    this.sx = 332;
                    this.sy = 81;
                    this.animationtype = 1;
                }
                break;
            case 3: // right
                if (this.animationtype === 1) { 
                    this.sx = 716;
                    this.sy = 10;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 972;
                    this.sy = 10;
                    this.animationtype = 3;
                } else {
                    this.sx = 204;
                    this.sy = 81;
                    this.animationtype = 1;
                }
                break;
        }
    }

    // Method to update and animate the sprite of the giantAnt
    animateSprite() {
        context.drawImage(this.image, this.sx, this.sy, 60, 60, this.coordX, this.coordY, this.width, this.height);
    }
}

// DERIVED CLASS: to instantiate a spider and its attributes 
class GiantWasp extends Monster {
    constructor(coordX, coordY) {
        // 'super-requirement-order': coordX, coordY, width, height, image, health, strength, velocity, yieldExperience, moveCooldown
        super(coordX, coordY, 65, 65, monster2Img, 35, 5, 48.75, 500, 105);
        this.monsterId = 2;
        this.sound = giantWaspAttackSound;
        this.sx = 120;
        this.sy = 5;
        this.animationtype = 1;  // either 1, 2 or 3. only 3 sprits for every diretcion
    }

    generateAnimationType() {
        switch (this.moveDirection) { 
            case 0: // up
                if (this.animationtype === 1) { 
                    this.sx = 0;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 256;
                    this.animationtype = 3;
                } else {
                    this.sx = 512;
                    this.animationtype = 1;
                }
                break;
            case 1: // down
                if (this.animationtype === 1) { 
                    this.sx = 128;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 384;
                    this.animationtype = 3;
                } else {
                    this.sx = 640;
                    this.animationtype = 1;
                }
                break;
            case 2: // left
                if (this.animationtype === 1) { 
                    this.sx = 194;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 450;
                    this.animationtype = 3;
                } else {
                    this.sx = 706;
                    this.animationtype = 1;
                }
                break;
            case 3: // right
                if (this.animationtype === 1) { 
                    this.sx = 64;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 320;
                    this.animationtype = 3;
                } else {
                    this.sx = 576;
                    this.animationtype = 1;
                }
                break;
        }
    }

    // Method to update and animate the sprite of the Spider
    animateSprite() {
        context.drawImage(this.image, this.sx, this.sy, 60, 60, this.coordX, this.coordY, this.width, this.height);
    }
}


// DERIVED CLASS: to instantiate a spider and its attributes 
class Spider extends Monster {
    constructor(coordX, coordY) {
        // 'super-requirement-order': coordX, coordY, width, height, image, health, strength, velocity, yieldExperience, moveCooldown
        super(coordX, coordY, 65, 65, monster3Img, 50, 7, 48.75, 500, 90);
        this.monsterId = 3;
        this.sound = spiderAttackSound;
        this.sx = 120;
        this.sy = 5;
        this.animationtype = 1;  // either 1, 2 or 3. only 3 sprits for every diretcion
    }

    generateAnimationType() {
        switch (this.moveDirection) { 
            case 0: // up
                if (this.animationtype === 1) { 
                    this.sx = 0;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 256;
                    this.animationtype = 3;
                } else {
                    this.sx = 512;
                    this.animationtype = 1;
                }
                break;
            case 1: // down
                if (this.animationtype === 1) { 
                    this.sx = 128;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 384;
                    this.animationtype = 3;
                } else {
                    this.sx = 640;
                    this.animationtype = 1;
                }
                break;
            case 2: // left
                if (this.animationtype === 1) { 
                    this.sx = 194;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 450;
                    this.animationtype = 3;
                } else {
                    this.sx = 706;
                    this.animationtype = 1;
                }
                break;
            case 3: // right
                if (this.animationtype === 1) { 
                    this.sx = 64;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 320;
                    this.animationtype = 3;
                } else {
                    this.sx = 576;
                    this.animationtype = 1;
                }
                break;
        }
    }

    // Method to update and animate the sprite of the Spider
    animateSprite() {
        context.drawImage(this.image, this.sx, this.sy, 65, 65, this.coordX, this.coordY, this.width, this.height);
    }
}

// DERIVED CLASS: to instantiate a demon and its attributes
class Demon extends Monster {
    constructor(coordX, coordY) {
        // 'super-requirement-order': coordX, coordY, width, height, image, health, strength, velocity, yieldExperience, moveCooldown
        super(coordX, coordY, 65, 65,  monster4Img, 100, 15, 65, 1000, 60);
        this.monsterId = 4;
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