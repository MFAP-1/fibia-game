// Fibia, the game: main javascript file

// Instatiating the canvas
const canvas = document.getElementById('the-canvas');
const context = canvas.getContext("2d");

// Instatiating the player object (playerImg comes from 'sprites.js')
const player = new Player(canvas.width/2, canvas.height/2, 100, playerImg, 1);
const playerHeathBar = new HealthBar(player.coordX + 10, player.coordY - 5, "red");


// Instatiating one array for storing all monsters object (monster#Img comes from 'sprites.js')
const monsters = [];
// Manually inserting random monsters (LATER CREATE A FUNCTION FOR THAT)
monsters.push(new Rat(randomCoord(), randomCoord(), 70, 70, 20, monster1Img, 3));
monsters.push(new Rat(randomCoord(), randomCoord(), 70, 70, 20, monster1Img, 3));
monsters.push(new Rat(randomCoord(), randomCoord(), 70, 70, 20, monster1Img, 3));
monsters.push(new Dragon(randomCoord(), randomCoord(), 70, 70, 50, monster2Img, 7));


// Graves array - TODO
const graves = [];
// if it is dead, clear the monsters array
// context.drawImage(grave, this.coordX, this.coordY, this.width, this.height);

// MAIN FUNCTION: Waiting for the screen to load.
window.onload = () => {
        
    // FUNCTION: to print the screen
    const draw = () => {
        clearCanvas();
        
        // updating the sprite of the player (if the player still alive)
        if (!player.checkDeath()) {
            player.update();
            playerHeathBar.renderHealthBar();
        }
        
        // updating the sprite of all the monsters
        for (let i = 0; i < monsters.length; i++) {
            if (!monsters[i].checkDeath()) { // if the monster still alive, update it
                monsters[i].update();
            } else { // when the monster is dead
                console.log('monster morreu'); //--------------------------------------DEBUGGER
                player.surroundingMonsters.splice(0, 1);
                monsters.splice(i, 1);
            }
        }
        
        // Checking the loss condition of the game (if the player still alive)
        if (!player.alive) gameOver();

        // Scheduling updates to the canvas (recursive function)
        setInterval(draw, 20); 
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

    draw(); // com a inserção de uma  função p/ menu, eu acho que esse aqui pode sair.
}


// FUNCTION: To terminate the game 
const gameOver = () => {
    clearCanvas();
    context.font = '30px serif';
    context.fillStyle = 'black';
    context.fillText('GAME OVER', 350, 350);
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