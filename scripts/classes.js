// Fibia, the game: class file

// BASE CLASS: game
class Game {
    constructor() {
        this.frames = 0;
        this.animationId;
        this.menuId;
        this.difficulty = 2; // 1 to easy, 2 to normal and 3 to hard
    }

    // Method to render the main menu screen
    menu () {
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = '40px MedievalSharp, cursive';
        context.fillStyle = '#cca06d';
        context.fillText('Welcome to Fibia', 180, 120);
        context.font = '30px MedievalSharp, cursive';
        context.fillText('Select the desired difficulty level', 100, 260);
        context.fillText(' and press enter to play:', 150, 300);
        context.fillStyle = 'bisque';
        context.font = '20px MedievalSharp, cursive';
        context.fillText('Easy', 200, 340);
        context.fillText('Normal', 200, 380);
        context.fillText('Hard', 200, 420);
        // options to set the difficulty level
        if (game.difficulty === 1) { 
            context.fillText('#', 180, 340); 
        } else if (game.difficulty === 2) {
            context.fillText('#', 180, 380);
        } else {
            context.fillText('#', 180, 420);
        }
        // looping to render the updated position of the '#' icon
        game.menuId = requestAnimationFrame(game.menu);
    }

    // Method to clear the canvas
    clearCanvas() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Method to calibrate all characters stats based on the difficulty level selected
    difficultyCalibration() {
        let calibrationFactor = 1;
        if (this.difficulty === 1) { // easy
        calibrationFactor = 1.25;
        } else if (this.difficulty === 2) { // normal
            calibrationFactor = 1;
        } else if (this.difficulty === 3) { // hard
            calibrationFactor = 0.50;
        }
        // Calibrating player status
        player.health = player.health * calibrationFactor;
        player.strength = player.strength * calibrationFactor;
        playerHealthBar.maxHealth = player.health;
    }

    // Method to render the game over screen
    gameOver() {
        this.clearCanvas();
        backgroundSound.pause();
        gameOverSound.play();
        context.font = '30px MedievalSharp, cursive';
        context.fillStyle = 'bisque';
        context.fillText('GAME OVER :(', 250, 300);
        context.font = '20px MedievalSharp, cursive';
        context.fillText('Use the Reset button to play again', 180, 350);
    }

    // Method To manage the automated combat actions from the monsters toward the player
    combatManager() {
        if (game.frames % 60 === 0) { // every 60 frames (1 seconds)
            // player receiving dmg every iteration for every monsters in its surroundings
            player.surroundingMonsters.forEach(monster => { monster.causeDamage(); });
        }   
    }

    // Method to update all static sprites (graves, potions, gold coins)
    updateStaticSprites() {
        // updating the sprites of all the graves (if any) 
        for (let i = 0; i < graves.length; i++) {
            graves[i].coordX += 20;
            graves[i].coordY += 20;
            graves[i].image = graveImg;
            graves[i].width = 45;
            graves[i].height = 45;
            graves[i].renderStaticSprite();
            graves[i].coordX -= 20;
            graves[i].coordY -= 20;
        }
        // updating the sprites of all the gold (if any) 
        for (let i = 0; i < goldCoins.length; i++) {
            goldCoins[i].coordX += 20;
            goldCoins[i].coordY += 35;
            goldCoins[i].image = goldImg;
            goldCoins[i].width = 20;
            goldCoins[i].height = 20;
            goldCoins[i].renderStaticSprite();
            goldCoins[i].coordX -= 20;
            goldCoins[i].coordY -= 35;
        }
        // updating the sprites of all the potions (if any) 
        for (let i = 0; i < potions.length; i++) {
            potions[i].coordX += 20;
            potions[i].coordY += 45;
            potions[i].image = potionImg;
            potions[i].width = 20;
            potions[i].height = 20;
            potions[i].renderStaticSprite();
            potions[i].coordX -= 20;
            potions[i].coordY -= 45;
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
        // object for rendering the attack animations
        this.attackAnimation = {
            xPosition: 0,
            yPosition: 0,
            targetX: 0,
            targetY: 0,
        };
    }

    // Method to render the static sprite of any given character
    renderStaticSprite() {
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

     // Method to render the character's attack animation (either player or monster)
     renderAttackAnimation() {
        if (this.attackAnimation.targetX !== 0) { // only render animation if there is a target
            // checking the conditions for the end of the present animation
            if ((Math.floor(this.attackAnimation.xPosition) >= Math.floor(this.attackAnimation.targetX) - 2) &&
                (Math.floor(this.attackAnimation.xPosition) <= Math.floor(this.attackAnimation.targetX) + 2) 
            ) { // +- 2 is the margin of error in the calculations
                this.attackAnimation.xPosition = this.coordX + this.width / 2;
                this.attackAnimation.yPosition = this.coordY + this.height / 2;
                this.attackAnimation.targetX = 0;
                this.attackAnimation.targetY = 0;
            }
            // Calculating the difference vector
            let dx = this.attackAnimation.targetX - this.attackAnimation.xPosition;
            let dy = this.attackAnimation.targetY - this.attackAnimation.yPosition;
            // Calculating the direction vector
            let length = Math.sqrt(dx * dx + dy * dy);
            if (length) {
                dx = dx / length;
                dy = dy / length;
            }
            // updating the current value
            this.attackAnimation.xPosition += dx * 5; // 5 pixels every frame 
            this.attackAnimation.yPosition += dy * 5;
            // rendering the animation
            context.drawImage(this.attackImg, 0, 0, 30, 30, this.attackAnimation.xPosition, this.attackAnimation.yPosition, 30, 30);   
        }  
    }
}


// SUB CLASS: to define attributes and methods for the player 
class Player extends Character {
    constructor(coordX, coordY) {
        // 'super-requirement-order': coordX, coordY, width, height, image, health, strength, velocity
        super(coordX, coordY, 65, 65, playerImg, 150, 15, 32);
        this.level = 1;
        this.experience = 0;
        this.goldColleted = 0;
        this.surroundingMonsters = [];
        this.attackImg = playerAttackImg; // all images/sprites comes from the file 'sprites.js'.
        // variables for the player's animation sprite
        this.sx = 5; 
        this.sy = 0;
    }

    // 4 Methods to move the player arround 
    moveUp() {
        this.coordY -= this.velocity;
        this.sy = 100; // to change the sprite's animation
        footstepSound.play();
        if (this.playerCollisionDetection()) { // if there is a collision with the intended movement
            this.coordY += this.velocity; // revert that movement
        } else { // if there was no collision
            this.surroundingMonsters.forEach(monster => { monster.combat = false; }); // if there was a surrounding monster, set its combat to false
            this.surroundingMonsters = []; // clear the surrounding monsters array
        }
    }
    moveDown() {
        this.coordY += this.velocity;
        this.sy = 0;
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
        this.sy = 140;
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
        this.sy = 50;
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
        // first, checking collision with the canvas' wall
        let collision = (this.left() <= 0 || this.right() >= canvas.width || this.top() <= 0 || this.bottom() >= canvas.height);
        if (collision) return true; // if statement to check whether the collision has occurred
        // now checking collision with any given monster from the array of monsters
        for (let i = 0; i < monsters.length; i++) {
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
    
    // Method to check the player level based on its experience
    levelUp() {
        const experienceTable = [1000, 2050, 4200, 8600, 17600, 36080, 73000]; // pre-defined required experience for leveling up
        for (let i = 0; i < experienceTable.length; i++) {
            if (this.experience > experienceTable[i]){
                this.level = i + 2; // +2 cause in the 0 index is the level up from lvl 1 to 2. And so on.
            }
        }
        // updating the level on the screen
        const levelDisplayElement = document.getElementById('level-display');
        levelDisplayElement.innerHTML = this.level;
    }

    // Method for the player to cause damage
    attacking(clickedX, clickedY) {
        // for meele attack, check if the clicked monster is surrounding the player
        this.surroundingMonsters.forEach(monster => {
            if ((clickedX >= monster.coordX && clickedX <= monster.coordX + monster.width) &&
                (clickedY >= monster.coordY && clickedY <= monster.coordY + monster.height)) {
                    engageCombatSound.play(); // playing the attack sound
                    // Updating the attack animation object/element
                    player.attackAnimation.xPosition = player.coordX + player.width / 2;
                    player.attackAnimation.yPosition = player.coordY + player.height / 2;
                    player.attackAnimation.targetX = monster.coordX + monster.width / 2;
                    player.attackAnimation.targetY = monster.coordY + monster.height / 2;
                    // decresing the monster's health
                    monster.health -= player.strength;
            }
        });
    }

    // Method to check and loot anything that it is on the floor (gold or potion)
    looting() {
        // looting gold coins
        goldCoins.forEach((coin, index) => {
            if(clashIdentifier(player, coin)) {
                this.goldColleted++; 
                goldCollectSound.play();
                goldCoins.splice(index, 1); // removing the gold from the game
            }
        });
        // looting potions
        potions.forEach((potion, index) => {
            if(clashIdentifier(player, potion)) {
                if (this.health <  playerHealthBar.maxHealth / 2) { this.health +=  playerHealthBar.maxHealth / 2; }
                else if (this.health >=  playerHealthBar.maxHealth / 2) { this.health =  playerHealthBar.maxHealth; }
                drinkingPotionSound.play();
                potions.splice(index, 1); // removing the gold from the game
            }
        });
        // updating the gold count on the screen
        const goldDisplayElement = document.getElementById('gold-display');
        goldDisplayElement.innerHTML = this.goldColleted;
    }

    // Method to update and animate the sprite of the player
    animateSprite() {
        context.drawImage(this.image, this.sx, this.sy, 45, 45, this.coordX, this.coordY, this.width, this.height);
    }
}


// SUB CLASS (INTERMEDIATE CLASS): to define attributes and methods for a generic monster 
class Monster extends Character {
    constructor(coordX, coordY, width, height, image, health, strength, velocity, yieldExperience, moveCooldown) {
        // 'super-requirement-order': coordX, coordY, width, height, image, health, strength, velocity
        super(coordX, coordY, width, height, image, health, strength, velocity);

        this.yieldExperience = yieldExperience; // amount of experience that it will yield to the player after
        this.combat = false; // false = not in combat
        this.moveDirection = 1; // 0 - up, 1- down, 2- left and 3- right
        this.moveCooldown = moveCooldown; // cooldown to define the time interval between moves on the screen
    }

    // Method to set the movement of the monster towards the player
    chasePlayer() {
        // Calculating the difference vector
        let dx = player.coordX + (player.width / 2) - this.coordX; // target - this position
        let dy = player.coordY + (player.height / 2) - this.coordY; // target - this position
        
        // Calculating the direction vector
        let length = Math.sqrt(dx * dx + dy * dy);
        if (length) {
            dx = dx / length;
            dy = dy / length;
        }
        
        // Making the move. This will happend if the monster isn't in combat, and every interval of time defined by the "moveCooldown" attribuite. Example: 120 frames (2 seconds) for the GiantAnt class. 
        if (game.frames % this.moveCooldown === 0 && this.combat === false) { 
            // Generating a new random move direciton for this iteration
            this.determineMoveDirection(dx, dy);
            this.coordX += dx * this.velocity;
            this.coordY += dy * this.velocity;
            if (this.monsterCollisionDetection()) { // if there is a collision, revert the movement
                this.coordX -= (dx * this.velocity);
                this.coordY -= (dy * this.velocity);
            }
        }
    }
    
    // Auxiliary Method to determine the direction of the current movement of the monster
    determineMoveDirection(dx, dy) {
        let angle = (Math.atan2(dy, dx) * 180 / Math.PI) * -1;
        if (angle < 0) { angle += 360; }
        if (angle > 45 && angle < 135) {
            this.moveDirection = 0; // up
        } else if (angle > 225 && angle < 315){ // down
            this.moveDirection = 1; // down
        } else if (angle > 135 && angle < 225) { // left
            this.moveDirection = 2; // left
        } else { // right
            this.moveDirection = 3; // right
        }
    }

    // Method to cause damage to the player if it is colliding with one or plus monster(s)
    causeDamage() {
        this.sound.pause(); // interrupting longer sounds that lingers one iteration to the other
        this.sound.play(); // playing the attack sound
        // Updating the attack animation object/element
        this.attackAnimation.xPosition = this.coordX + this.width / 2;
        this.attackAnimation.yPosition = this.coordY + this.height / 2;
        this.attackAnimation.targetX = player.coordX + player.width / 2;
        this.attackAnimation.targetY = player.coordY + player.height / 2;
        // decreasing the player's health
        player.health -= this.strength; 
    }
    
    // Method to check if there is a collision (triggered by a monster)
    monsterCollisionDetection() {
        // first, checking collision with the canvas' wall
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

    // Method to trigger everything that depends on the monster dying
    monsterDied(index) {
        // inserting a gold coin into its array
        goldCoins.push(this);
        // inserting a potion into its array (with a 10% chance!)
        if (Math.floor(Math.random() * 10) === 0) { 
            potions.push(this); 
        }
        // inserting a gravestone into its array
        graves.push(this);
        // to keep the count of displayed graves up to 2 at the time
        if (graves.length > 2) graves.shift(); // remove the first in the array
        // increase experience for the player
        player.experience += this.yieldExperience;
        player.levelUp(); // checking to update the player's level
        // removing the dead monster from its array and from the players surrounding
        this.sound.pause();
        monsters.splice(index, 1);
        monstersHealthBar.splice(index, 1);
        player.surroundingMonsters.splice(0, 1);
    }
}


// DERIVED CLASS: to instantiate a Giant-Ant and its attributes 
class GiantAnt extends Monster {
    constructor(coordX, coordY) {
        // 'super-requirement-order': coordX, coordY, width, height, image, health, strength, velocity, yieldExperience, moveCooldown
        super(coordX, coordY, 65, 65, giantAntImg, 20, 3, 32, 250, 120);
        this.monsterId = 1;
        this.sound = giantAntAttackSound;
        this.attackImg = giantAntAttackImg;
        // variables for animating the sprite
        this.sx = 780;
        this.sy = 10;
        this.animationtype = 1;  // either 1, 2 or 3. only 3 sprits for every diretcion
    }
    
    // Method to generate the correct animation type for the Giant-Ant
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
        if (game.frames % 30 === 0) { // every 30 frames (0.5 seconds)
            this.generateAnimationType(); // to change the sprite's animation
        }
        // rendering image
        context.drawImage(this.image, this.sx, this.sy, 60, 60, this.coordX, this.coordY, this.width, this.height);
    }
}

// DERIVED CLASS: to instantiate a Giant-Wasp and its attributes 
class GiantWasp extends Monster {
    constructor(coordX, coordY) {
        // 'super-requirement-order': coordX, coordY, width, height, image, health, strength, velocity, yieldExperience, moveCooldown
        super(coordX, coordY, 65, 65, giantWaspImg, 35, 5, 48, 350, 105);
        this.monsterId = 2;
        this.sound = giantWaspAttackSound;
        this.attackImg = giantWaspAttackImg;
        // variables for animating the sprite
        this.sx = 120;
        this.sy = 0;
        this.animationtype = 1;  // either 1, 2 or 3. only 3 sprits for every diretcion
    }

    // Method to generate the correct animation type for the Giant-Wasp
    generateAnimationType() {
        switch (this.moveDirection) { 
            case 0: // up
                if (this.animationtype === 1) { 
                    this.sx = -10;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 240;
                    this.animationtype = 3;
                } else {
                    this.sx = 495;
                    this.animationtype = 1;
                }
                break;
            case 1: // down
                if (this.animationtype === 1) { 
                    this.sx = 120;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 376;
                    this.animationtype = 3;
                } else {
                    this.sx = 632;
                    this.animationtype = 1;
                }
                break;
            case 2: // left
                if (this.animationtype === 1) { 
                    this.sx = 182;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 438;
                    this.animationtype = 3;
                } else {
                    this.sx = 694;
                    this.animationtype = 1;
                }
                break;
            case 3: // right
                if (this.animationtype === 1) { 
                    this.sx = 49;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 305;
                    this.animationtype = 3;
                } else {
                    this.sx = 561;
                    this.animationtype = 1;
                }
                break;
        }
    }

    // Method to update and animate the sprite of the Spider
    animateSprite() {
        if (game.frames % 30 === 0) { // every 30 frames (0.5 seconds)
            this.generateAnimationType(); // to change the sprite's animation
        }
        // rendering image
        context.drawImage(this.image, this.sx, this.sy, 60, 60, this.coordX, this.coordY, this.width, this.height);
    }
}


// DERIVED CLASS: to instantiate a Giant-Spider and its attributes 
class GiantSpider extends Monster {
    constructor(coordX, coordY) {
        // 'super-requirement-order': coordX, coordY, width, height, image, health, strength, velocity, yieldExperience, moveCooldown
        super(coordX, coordY, 65, 65, giantSpiderImg, 50, 7, 48, 500, 90);
        this.monsterId = 3;
        this.sound = giantSpiderAttackSound;
        this.attackImg = giantSpiderAttackImg;
        // variables for animating the sprite
        this.sx = 120;
        this.sy = 5;
        this.animationtype = 1;  // either 1, 2 or 3. only 3 sprits for every diretcion
    }

    // Method to generate the correct animation type for the Giant-Spider
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
        if (game.frames % 30 === 0) { // every 30 frames (0.5 seconds)
            this.generateAnimationType(); // to change the sprite's animation
        }
        // rendering image
        context.drawImage(this.image, this.sx, this.sy, 65, 65, this.coordX, this.coordY, this.width, this.height);
    }
}

// DERIVED CLASS: to instantiate a Demon and its attributes
class Demon extends Monster {
    constructor(coordX, coordY) {
        // 'super-requirement-order': coordX, coordY, width, height, image, health, strength, velocity, yieldExperience, moveCooldown
        super(coordX, coordY, 65, 65,  demonImg, 100, 15, 64, 1000, 60);
        this.monsterId = 4;
        this.attackImg = demonAttackImg;
        this.sound = demonAttackSound;
        // variables for animating the sprite
        this.sx = 510;
        this.sy = 0;
        this.animationtype = 1;  // either 1, 2 or 3. only 3 sprits for every diretcion
    }

    // Method to generate the correct animation type for the Demon
    generateAnimationType() {
        switch (this.moveDirection) { 
            case 0: // up
                if (this.animationtype === 1) { 
                    this.sx = 382;
                    this.sy = 0;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 636;
                    this.sy = 0;
                    this.animationtype = 3;
                } else {
                    this.sx = 894;
                    this.sy = 0;
                    this.animationtype = 1;
                }
                break;
            case 1: // down
                if (this.animationtype === 1) { 
                    this.sx = 510;
                    this.sy = 0;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 766;
                    this.sy = 0;
                    this.animationtype = 3;
                } else {
                    this.sx = 0;
                    this.sy = 70;
                    this.animationtype = 1;
                }
                break;
            case 2: // left
                if (this.animationtype === 1) { 
                    this.sx = 574;
                    this.sy = 0;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 830;
                    this.sy = 0;
                    this.animationtype = 3;
                } else {
                    this.sx = 64;
                    this.sy = 65;
                    this.animationtype = 1;
                }
                break;
            case 3: // right
                if (this.animationtype === 1) { 
                    this.sx = 448;
                    this.sy = 0;
                    this.animationtype = 2;
                } else if (this.animationtype === 2) {
                    this.sx = 704;
                    this.sy = 0;
                    this.animationtype = 3;
                } else {
                    this.sx = 960;
                    this.sy = 0;
                    this.animationtype = 1;
                }
                break;
        }
    }

    // Method to update and animate the sprite of the giantAnt
    animateSprite() {
        if (game.frames % 30 === 0) { // every 30 frames (0.5 seconds)
            this.generateAnimationType(); // to change the sprite's animation
        }
        // rendering image
        context.drawImage(this.image, this.sx, this.sy, 64, 64, this.coordX, this.coordY, this.width, this.height);
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