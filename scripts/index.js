// Fibia, the game: main javascript file

// Instatiating the canvas
const canvas = document.getElementById('the-canvas');
const context = canvas.getContext("2d");


// Instatiating the player object (playerImg comes from 'sprites.js')
const player = new Player(canvas.width/2, canvas.height/2, 150, playerImg);
const playerHealthBar = new HealthBar(player.coordX, player.coordY , "green", player.health);


/* FUNCTION: To instatiate monsters every iteration. Rules: 
    - Up to 4 monsters on the screen at any given time. 
    - The monster that will be generated respects the current level of the player.
*/
const monsters = []; // Instatiating one array for storing all monsters object 
const monstersHealthBar = []; // Instatiating one array for storing all monsters object 
function monsterGenerator() {
    for (let i = monsters.length; i < 4; i++) { // (monster#Img comes from 'sprites.js')
        if (player.level < 2) {
            monsters.push(new Rat(randomCoord(), randomCoord(), 70, 70, 20, monster1Img, 3));
            monstersHealthBar.push(new HealthBar(monsters[i].coordX, monsters[i].coordY, "red", monsters[i].health)); 
        } else if (player.level < 3) {
            monsters.push(new Dragon(randomCoord(), randomCoord(), 70, 70, 50, monster2Img, 7));
            monstersHealthBar.push(new HealthBar(monsters[i].coordX + 10, monsters[i].coordY, "red", monsters[i].health));
        } else {
            monsters.push(new Demon(randomCoord(), randomCoord(), 70, 70, 100, monster3Img, 15));
            monstersHealthBar.push(new HealthBar(monsters[i].coordX, monsters[i].coordY, "red", monsters[i].health));
        }
    }    
}
// Manually inserting random monsters (LATER CREATE A FUNCTION FOR THAT)
// monsters.push(new Rat(randomCoord(), randomCoord(), 70, 70, 20, monster1Img, 3));
// monsters.push(new Rat(randomCoord(), randomCoord(), 70, 70, 20, monster1Img, 3));
// monsters.push(new Rat(randomCoord(), randomCoord(), 70, 70, 20, monster1Img, 3));
// monsters.push(new Dragon(randomCoord(), randomCoord(), 70, 70, 50, monster2Img, 7));


// Graves array
const graves = [];


// MAIN FUNCTION: Waiting for the screen to load.
window.onload = () => {

    // FUNCTION: to print the screen
    const draw = () => {
        clearCanvas();
        
        // updating the sprite of the player (if the player still alive)
        if (!player.checkDeath()) {
            player.update();
            playerHealthBar.updateHealthBar(player.coordX, player.coordY, player.health);
            player.levelUp();
        }
        
        // updating the sprite of all the monsters
        for (let i = 0; i < monsters.length; i++) {
            if (!monsters[i].checkDeath()) { // if the monster still alive, update it
                
                monsters[i].update();
                monstersHealthBar[i].updateHealthBar(monsters[i].coordX, monsters[i].coordY, monsters[i].health);
                // setTimeout(monsters[i].randomMovement(), 2.0*1000);
                //monsters[i].randomMovement();
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
            graves[i].update();
        }
        
        // Generating monsters on the screen
        monsterGenerator();

        // Checking the loss condition of the game (if the player still alive)
        if (!player.alive) gameOver();

        // Scheduling updates to the canvas (recursive function)
        setInterval(draw, 60); 
    }

    
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
            draw();
        }
    });

    menu(); 
}


// FUNCTION: main menu screen
const menu = () => {
    context.font = '30px serif';
    context.fillStyle = 'black';
    context.fillText('PRESS ENTER TO PLAY.', 170, 350);
}


// FUNCTION: To terminate the game 
const gameOver = () => {
    clearCanvas();
    context.font = '30px serif';
    context.fillStyle = 'black';
    context.fillText('GAME OVER :(', 300, 350);
}


// AUX-FUNCTION: To clear the canvas
const clearCanvas = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
}


// AUX-FUNCTION: To randomize a coordinate (considering the size of any given character = 70x70)
function randomCoord() {
    let currentCoord =  Math.floor(Math.random() * canvas.width);
    if (currentCoord + 70 > canvas.width) { // checking if the random coordinate would stay out of bounds
        currentCoord -= 70;
    }
    return currentCoord;
}


/* The Game Window can render a maximum of 15 × 11 square meters (fields)
with the size of 32 × 32 pixels each, if not enlarged or reduced. 
Total is 15 x 32 = 480 by 11 x 32 = 352


*/