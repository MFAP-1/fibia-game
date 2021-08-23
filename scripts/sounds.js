// Fibia, the game: sounds js file
// All sounds download in: https://freesound.org/

// Sound for when a player and a monster engage in combat
const engageCombatSound = new Audio();
engageCombatSound.src = '../assets/audio/sword.flac';
engageCombatSound.volume = 0.2;

// Sound for the Rat attack
const ratAttackSound = new Audio();
ratAttackSound.src = '../assets/audio/rat.flac';
ratAttackSound.volume = 0.1;

// Sound for the Dragon attack
const dragonAttackSound = new Audio();
dragonAttackSound.src = '../assets/audio/dragon.wav';
dragonAttackSound.volume = 0.5;

// Sound for the Dragon attack
const demonAttackSound = new Audio();
demonAttackSound.src = '../assets/audio/demon-laugh.wav';
demonAttackSound.volume = 0.5;

// Background track-sound for the game
const backgroundSound = new Audio();
backgroundSound.src = '../assets/audio/medieval-music.mp3';
backgroundSound.volume = 0.1;

// .play() <--- metodo para tocar no momento necessário