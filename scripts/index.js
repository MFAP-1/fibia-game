// Fibia, the game: main javascript file

// Instatiating the canvas
const canvas = document.getElementById('the-canvas');
const context = canvas.getContext("2d");

// Instatiating the game object
const game = new Game();

// Instatiating the player object (playerImg comes from 'sprites.js')
const player = new Player(canvas.width/2 - 65/2, canvas.height/2 - 65/2);
const playerHealthBar = new HealthBar(player.coordX, player.coordY , "green", player.health);

// Instatiating one array for storing all monsters object 
const monsters = []; 
const monstersHealthBar = []; // Instatiating one array for storing all monsters health bars objects

// Instatiating the graves array
const graves = [];

// Instatiating the gold coins array
const goldCoins = [];

// Instatiating the potions array
const potions = [];

// calling the first method of the game. The menu screen
game.menu(); 



// MAIN-FUNCTION: to update the game's screen
const updateGame = () => {
    game.clearCanvas();
    
    game.frames++; // couting the frames

    // updating the sprite of the player (if the player still alive)
    if (!player.checkDeath()) {
        player.animateSprite();
        playerHealthBar.updateHealthBar(player.coordX, player.coordY, player.health);
    }

    // updating the sprite of all the monsters
    for (let i = 0; i < monsters.length; i++) {
        if (!monsters[i].checkDeath()) { // if the monster still alive, update it
            monsters[i].animateSprite();
            monstersHealthBar[i].updateHealthBar(monsters[i].coordX, monsters[i].coordY, monsters[i].health);   
        } else { // if the monster is dead, do:
            console.log('monster morreu'); //-------------------------------DEBUGGER
            
            //inserting a gold coin into its array
            goldCoins.push(monsters[i]);

            // inserting a potion into its array (with a 10% chance)
            if (Math.floor(Math.random() * 10) === 0) { potions.push(monsters[i]); }
            
            // inserting a gravestone into its array
            // monsters[i].coordX += 40;
            // monsters[i].coordY += 40;
            graves.push(monsters[i]);

            // to keep the count of displayed graves up to 2 at the time
            if (graves.length > 2) graves.shift(); // remove the first in the array
            // increase experience for the player
            player.experience += monsters[i].yieldExperience;
            player.levelUp(); // checking to update its level
            // removing the monster from the array and from the players surrounding
            monsters[i].sound.pause();
            monsters.splice(i, 1);
            monstersHealthBar.splice(i, 1);
            player.surroundingMonsters.splice(0, 1);
        }
    }

    // updating the sprites of all players attack
    // player.attackAnimation.forEach(element => { //(try#2)
    player.drawAttackAnimation();
    // });

    // updating the sprites of all the graves (if any) 
    for (let i = 0; i < graves.length; i++) {
        graves[i].coordX += 20;
        graves[i].coordY += 20;
        graves[i].image = graveImg;
        graves[i].width = 45;
        graves[i].height = 45;
        graves[i].updateSprite();
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
        goldCoins[i].updateSprite();
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
        potions[i].updateSprite();
        potions[i].coordX -= 20;
        potions[i].coordY -= 45;
    }

    // Checking if there is any loot to be picked up
    player.looting();

    // combat
    game.combatManager();
    
    // moving all monters to a random position
    monsters.forEach(monster => { monster.chasePlayer(); });

    // Generating monsters on the screen
    monsterGenerator();
    
    // Checking the loss condition of the game (if the player still alive)
    if (!player.alive) {
        cancelAnimationFrame(game.animationId);
        game.gameOver(); // render gameOver screen
        return; // to stop this loop (updateGame() main-function)
    }

    // Scheduling updates to the canvas (recursive function)
    game.animationId = requestAnimationFrame(updateGame);
}

// FUNCTION: Waiting for the screen to load.
window.onload = () => {    
    // LISTENER: tracking the moviment keys for the player
    document.addEventListener('keyup', (event) => {
        switch (event.keyCode) {
            case 38: // arrow key up
            case 87: // 'w'
                player.moveUp();    
                break;
            case 40: // arrow key down
            case 83: // 's'
                player.moveDown();  
                break;
            case 37: // arrow key left
            case 65: // 'a'
                player.moveLeft();  
                break;
            case 39: // arrow key right
            case 68: // 'd'
                player.moveRight(); 
                break;
        }
    });


    // LISTENER: waiting for the 'ENTER' command on the menu, to start
    document.addEventListener('keyup', (event) => {
        if (event.keyCode === 13) { // enter
            updateGame();
            backgroundSound.play(); // playing the background music
        }
    });


    // LISTENER: waiting for the 'click' command from the mouse, to attack
    canvas.addEventListener('click', (event) => {
        // getting the correct coordinates (inside the canvas, independent of its position on the HTML/sreen size)
        let clickedX = event.pageX - canvas.offsetLeft + canvas.clientLeft;
        let clickedY = event.pageY - canvas.offsetTop + canvas.clientTop;
        player.attacking(clickedX, clickedY);
    });
}


/* 
FUNCTION: To instantiate monsters every iteration. Rules: 
    - Up to 4 monsters on the screen at any given time; 
    - The monster that will be generated respects the current level of the player;
    - They can't overlap each other.
*/
function monsterGenerator() {
    for (let i = monsters.length; i < 4; i++) { 
        if (player.level < 2) {
            monsters.push(new GiantAnt(randomCoord(), randomCoord()));
            monstersHealthBar.push(new HealthBar(monsters[i].coordX + 10, monsters[i].coordY, "red", monsters[i].health)); 
        } else if (player.level < 3) {
            monsters.push(new GiantWasp(randomCoord(), randomCoord()));
            monstersHealthBar.push(new HealthBar(monsters[i].coordX + 10, monsters[i].coordY, "red", monsters[i].health));
        } else if (player.level < 4) {
            monsters.push(new GiantSpider(randomCoord(), randomCoord()));
            monstersHealthBar.push(new HealthBar(monsters[i].coordX + 10, monsters[i].coordY, "red", monsters[i].health));
        } else {
            monsters.push(new Demon(randomCoord(), randomCoord()));
            monstersHealthBar.push(new HealthBar(monsters[i].coordX, monsters[i].coordY, "red", monsters[i].health));
        }
        // if there is an overlapping situation, remove the later monster inserted
        if (overlappingMonster()) { 
            console.log('!!!entrou no POP!!!');  //----------------------------DEBUGGER
            monsters.pop();
            monstersHealthBar.pop();
            i--; // the i controler in the for loop must be decresed since we removed one monster
        } 
    }    
}

// AUX-FUNCTION: To randomize a coordinate (considering the size of any given character = 65x65)
function randomCoord() {
    let currentCoord =  Math.floor(Math.random() * canvas.width);
    let characterSize = 65; // To store the characters' size (they are 65x65)
    if (currentCoord + characterSize > canvas.width) { // checking if the random coordinate would stay out of bounds
        currentCoord -= characterSize;
    }
    return currentCoord;
}

// AUX-FUNCTION: To check the monster overlapping each other when generating a new one
function overlappingMonster() {
    for (let i = 0; i < monsters.length; i++) { // outer loop: to check every element on the monsters array
        //console.log('Current comparing monster: ', monsters[i]);  //--------------------------------------DEBUGGER
        // checking against the player sprite
        if (clashIdentifier(monsters[i], player)) {
            return true; // stops function and return true when one overlap is found
        }

        // checking against the graves sprites
        graves.forEach(grave => {
            if (clashIdentifier(monsters[i], grave)) {
                return true; // stops function and return true when one overlap is found
            }
        });

        // checking against live monsters
        for (let j = i + 1; j < monsters.length; j++) { // 
            if (clashIdentifier(monsters[i], monsters[j])) {
                console.log('!!!entrou no IF DA FUNCÇÃO DE CHECKAR!!!');  //--------------------------------------DEBUGGER
                return true; // stops function and return true when one overlap is found
            }
        }
    }
    return false; // false means no overlapping
}

// AUX-FUNCTION: to identify a clash between two generic (rectangular) elements
function clashIdentifier(elementA, elementB) {
    if (
    (elementA.right() >= elementB.left()) && 
    (elementA.left() <= elementB.right()) &&
    (elementA.top() <= elementB.bottom()) && 
    (elementA.bottom() >= elementB.top())) {
        return true; // clash identified
    }
    return false; // no clash
}