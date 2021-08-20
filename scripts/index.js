// Fibia, the game: main javascript file

// Instatiating the canvas
const canvas = document.getElementById('the-canvas');
const context = canvas.getContext("2d");

// Instatiating the player object
const player = new Player(canvas.width/2, canvas.height/2, 100, 1);
//console.log(player); //-----------------------------------------------------DEBUGGER

// Instatiating the player object
const monster1 = new Monster(randomCoord(), randomCoord(), 50);


// MAIN FUNCTION: Waiting for the screen to load.
window.onload = () => {
        
    // FUNCTION: to print the screen
    const draw = () => {
        clearCanvas();
        
        // printing the sprite (playerImg comes from 'sprites.js')
        context.drawImage(playerImg, player.coordX, player.coordY);
        context.drawImage(monster1Img, monster1.coordX, monster1.coordY);
        // VERIFICAR A POSSIBILDIADE DE PASSAR ESSA IMAGEM COMO ATRIBUTO DA CLASSE
        
        // recursive callback
        // player.coordX += 2; ---------------COMMENTED
        setInterval(draw, 40); //---------------COMMENTED
    }

    draw();

    // LISTENER: tracking the moviment keys for the player
    document.addEventListener('keydown', (event) => {
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




}




// AUX-FUNCTION: To clear the canvas
const clearCanvas = () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

// AUX-FUNCTION: To randomize a coordinate
function randomCoord() {
    return Math.floor(Math.random() * canvas.width);
}


/* The Game Window can render a maximum of 15 × 11 square meters (fields)
with the size of 32 × 32 pixels each, if not enlarged or reduced. 
Total is 15 x 32 = 480 by 11 x 32 = 352


*/