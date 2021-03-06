// Fibia, the game: main javascript file


// Instatiating the canvas
const canvas = document.getElementById('the-canvas');
const context = canvas.getContext("2d");

// Instatiating the game object
const game = new Game();

// Instatiating the player object and its health bar 
const player = new Player(canvas.width/2 - 65/2, canvas.height/2 - 65/2);
const playerHealthBar = new HealthBar(player.coordX, player.coordY , "green", player.health); // player's health bar object

// Instatiating one array for storing all monsters object 
const monsters = []; 
const monstersHealthBar = []; // One array for storing all monsters' health bars objects

// Instatiating the grave's array
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
        player.animateSprite(); // player's own sprite
        playerHealthBar.updateHealthBar(player.coordX, player.coordY, player.health); // player's health bar
        player.renderAttackAnimation(); // player's attack
    }

    // updating the sprite of all the monsters
    for (let i = 0; i < monsters.length; i++) {
        if (!monsters[i].checkDeath()) { // if the monster still alive, update it
            monsters[i].animateSprite();
            monstersHealthBar[i].updateHealthBar(monsters[i].coordX, monsters[i].coordY, monsters[i].health);
            monsters[i].renderAttackAnimation();   
        } else { // if the monster is dead
            monsters[i].monsterDied(i);
        }
    }

    // Updating all static sprites (graves, potions, gold coins)
    game.updateStaticSprites(); 

    // Checking if there is any loot to be picked up
    player.looting();

    // combat
    game.combatManager();
    
    // moving all monters towards the player's position
    monsters.forEach(monster => { monster.chasePlayer(); });

    // Generating monsters on the screen
    monsterGenerator();
    
    // Checking the loss condition of the game (if the player is dead)
    if (!player.alive) {
        cancelAnimationFrame(game.animationId);
        game.gameOver(); // render gameOver screen
        return; // to stop this loop (updateGame() main-function)
    }

    // Scheduling updates to the canvas
    game.animationId = requestAnimationFrame(updateGame);
}

// FUNCTION: Waiting for the screen to load (store the listening)
window.onload = () => {    
    // LISTENER: tracking the moviment keys for the player (used to move the player OR set the level of difficulty for the game)
    document.addEventListener('keyup', (event) => {
        switch (event.keyCode) {
            case 38: // arrow key up
            case 87: // 'w'
                // if statement to set up the game difficulty in the menu screen
                if (game.difficulty === 2 && !game.animationId) { 
                    game.difficulty = 1;
                    footstepSound.play(); // using a sound to improve the selection action
                } else if (game.difficulty === 3 && !game.animationId) {
                    game.difficulty = 2;
                    footstepSound.play();
                } else if (game.difficulty === 1 && !game.animationId) {
                    footstepSound.play();
                } else { // when the game is running  (game.animation === true)
                    player.moveUp(); // moving the player
                }
                break;
            case 40: // arrow key down
            case 83: // 's'
                if (game.difficulty === 1 && !game.animationId) {
                    game.difficulty = 2;
                    footstepSound.play();
                } else if (game.difficulty === 2 && !game.animationId) {
                    game.difficulty = 3;
                    footstepSound.play();
                } else if (game.difficulty === 3 && !game.animationId) {
                    footstepSound.play();
                } else { // when the game is running  (game.animation === true)
                    player.moveDown();
                }
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


    // LISTENER: waiting for the 'ENTER' command on the menu to start the game
    document.addEventListener('keyup', (event) => {
        if (event.keyCode === 13) { // enter
            cancelAnimationFrame(game.menuId); // stop menu render-loop
            game.difficultyCalibration();// setting up the characters status based on the difficulty level selected
            updateGame(); // calling the main function of this game
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

    // LISTENER: waiting for the 'click' command from the mouse, to reset the game
    const resetBtnElement = document.getElementById('reset-btn');
    resetBtnElement.onclick = () => {
        window.location.reload();
    }
}


/* 
FUNCTION: To instantiate monsters every iteration. Rules: 
    - Up to 4 monsters on the screen at any given time; 
    - The monster that will be generated respects the current level of the player;
    - They appear in a random valid position;
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