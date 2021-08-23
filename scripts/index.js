// Fibia, the game: main javascript file

// Instatiating the canvas
const canvas = document.getElementById('the-canvas');
const context = canvas.getContext("2d");

// Instatiating the game object
const game = new Game();

// Instatiating the player object (playerImg comes from 'sprites.js')
const player = new Player(canvas.width/2, canvas.height/2);
const playerHealthBar = new HealthBar(player.coordX, player.coordY , "green", player.health);

// Instatiating one array for storing all monsters object 
const monsters = []; 
const monstersHealthBar = []; // Instatiating one array for storing all monsters health bars objects

// Instatiating the graves array
const graves = [];

// calling the first method of the game. The menu screen
game.menu(); 

    
// MAIN-FUNCTION: to update game's screen
const updateGame = () => {
    game.clearCanvas();
    
    game.frames++;

    // updating the sprite of the player (if the player still alive)
    if (!player.checkDeath()) {
        player.updateSprite();
        playerHealthBar.updateHealthBar(player.coordX, player.coordY, player.health);
        player.levelUp();
    }

    // updating the sprite of all the monsters
    for (let i = 0; i < monsters.length; i++) {
        if (!monsters[i].checkDeath()) { // if the monster still alive, update it
            monsters[i].updateSprite();
            monstersHealthBar[i].updateHealthBar(monsters[i].coordX, monsters[i].coordY, monsters[i].health);
        // when the monster is dead
        } else { 
            console.log('monster morreu'); //--------------------------------------DEBUGGER
            // inserting a gravestone
            monsters[i].image = grave;
            graves.push(monsters[i]);
            if (graves.length > 2) graves.shift(); // the keep the count of displayed graves up to 2 at the time
            // increase experience for the player
            player.experience += monsters[i].yieldExperience;
            // removing the monster from the array and from the players surrounding
            monsters.splice(i, 1);
            monstersHealthBar.splice(i, 1);
            player.surroundingMonsters.splice(0, 1);
        }
    }

    // updating the sprites of all the graves (if any) 
    for (let i = 0; i < graves.length; i++) {
        graves[i].updateSprite();
    }

    // IMPORTANT MANIPULATION OF THE FRAMES
    if (game.frames % 120 === 0) { // every 2 seconds
        monsters.forEach(monster => {
            monster.randomMovement();
        });
    }   
    
    // Generating monsters on the screen
    monsterGenerator();
    
    // Checking the loss condition of the game (if the player still alive)
    if (!player.alive) {
        cancelAnimationFrame(this.animationId);
        game.gameOver();
    }

    // Scheduling updates to the canvas (recursive function)
    game.animationId = requestAnimationFrame(updateGame);
    //console.log('rodando'); //--------------------------------------DEBUGGER
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
        }
    });


    // LISTENER: waiting for the 'click' command from the mouse, to attack
    canvas.addEventListener('click', (event) => {
        // getting the correct coordinates (inside the canvas, independent of its position on the HTML/sreen size)
        let clickedX = event.pageX - canvas.offsetLeft + canvas.clientLeft;
        let clickedY = event.pageY - canvas.offsetTop + canvas.clientTop;
        player.attack(clickedX, clickedY);
    });
}


//
// function startGame() {
//     updateGame();
// }


/* 
FUNCTION: To instantiate monsters every iteration. Rules: 
    - Up to 4 monsters on the screen at any given time; 
    - The monster that will be generated respects the current level of the player;
    - They can't overlap each other.
*/
function monsterGenerator() {
    for (let i = monsters.length; i < 4; i++) { 
        if (player.level < 2) {
            monsters.push(new Rat(randomCoord(), randomCoord()));
            monstersHealthBar.push(new HealthBar(monsters[i].coordX, monsters[i].coordY, "red", monsters[i].health));
        } else if (player.level < 3) {
            monsters.push(new Dragon(randomCoord(), randomCoord()));
            monstersHealthBar.push(new HealthBar(monsters[i].coordX + 10, monsters[i].coordY, "red", monsters[i].health));
        } else {
            monsters.push(new Demon(randomCoord(), randomCoord()));
            monstersHealthBar.push(new HealthBar(monsters[i].coordX, monsters[i].coordY, "red", monsters[i].health));
        }
        // if there is an overlapping situation, remove the later monster inserted
        if (overlappingMonster()) { 
            console.log('!!!entrou no POP!!!');  //--------------------------------------DEBUGGER
            monsters.pop();
            monstersHealthBar.pop();
            i--; // the i controler in the for loop must be decresed since we removed one monster
        } 
    }    
}

// AUX-FUNCTION: To randomize a coordinate (considering the size of any given character = 70x70)
function randomCoord() {
    let currentCoord =  Math.floor(Math.random() * canvas.width);
    let characterSize = 70; // To store the characters' size (they are 70x70)
    if (currentCoord + characterSize > canvas.width) { // checking if the random coordinate would stay out of bounds
        currentCoord -= characterSize;
    }
    return currentCoord;
}

// AUX-FUNCTION: To check the monster overlapping each other when generating a new one
function overlappingMonster() {
    for (let i = 0; i < monsters.length; i++) { // outer loop: to check every element on the monsters array
        console.log('Current comparing monster: ', monsters[i]);  //--------------------------------------DEBUGGER
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