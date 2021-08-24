// Fibia, the game: sounds js file
// All sounds were downloaded from: https://freesound.org/

// Sound for when the player engage in combat
const engageCombatSound = new Audio();
engageCombatSound.src = '../assets/audio/sword.flac';
engageCombatSound.volume = 0.3;

// Sound for the Giant-Ant attack (monster #1)
const giantAntAttackSound = new Audio();
giantAntAttackSound.src = '../assets/audio/giant-ant.wav';
giantAntAttackSound.volume = 0.4;

// Sound for the Giant-Wasp attack (monster #2)
const giantWaspAttackSound = new Audio();
giantWaspAttackSound.src = '../assets/audio/giant-wasp.wav';
giantWaspAttackSound.volume = 0.5;

// Sound for the Giant-Spider attack (monster #3)
const giantSpiderAttackSound = new Audio();
giantSpiderAttackSound.src = '../assets/audio/giant-spider.mp3';
giantSpiderAttackSound.volume = 0.5;

// Sound for the Demon attack (monster #4)
const demonAttackSound = new Audio();
demonAttackSound.src = '../assets/audio/demon-laugh.wav';
demonAttackSound.volume = 0.5;

// Sound for the gameover
const gameOverSound = new Audio();
gameOverSound.src = '../assets/audio/gameOver.wav';
gameOverSound.volume = 0.95;

// Sound for when the player is walking
const footstepSound = new Audio();
footstepSound.src = '../assets/audio/footsteps.wav';
footstepSound.volume = 0.3;

// Background track-sound for the game
const backgroundSound = new Audio();
backgroundSound.src = '../assets/audio/medieval-music.mp3';
backgroundSound.volume = 0.1;
