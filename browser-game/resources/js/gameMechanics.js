/************
Class initialization
************/
//Game Window
var canvas = document.getElementById('gameWindow');
var ctx = canvas.getContext('2d');
let screenWidth = canvas.width;
let screenHeight = canvas.height;
var gameTitle = "Crossing Game";
//Game Objects
var player;
var goal;
var enemy;
var sprites = {};
//Game Status
var gameRunning = false;
var gameDifficulty = 1;
var wins = 0;
var losses = 0;
//Game Input
var rightKey = false;
var leftKey = false;
var upKey = false;
var downKey = false;

/************
Class initialization
************/

//Base object, foundation of all objects
class GameObject {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }
}

//Player object, reacts to key events to move
class Player extends GameObject {
  constructor(x, y, width, height, color) {
    super(x, y, width, height, color);
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.maxSpeed = 4;
  }
  moveHorizontally() {
    if((this.x > screenWidth - this.width && this.xSpeed > 0) || (this.x < 1 && this.xSpeed < 0)) {
      this.xSpeed = 0;
    }
    this.x += this.xSpeed;
  }
  moveVertically() {
    if((this.y > screenHeight - this.height && this.ySpeed > 0) || (this.y < 1 && this.ySpeed < 0)) {
      this.ySpeed = 0;
    }
    this.y += this.ySpeed;
  }
}

//Enemy object, has standard vertical movement.
//Horizontal movement for later
//Movement is measured in pixels/frame refresh
class GameEnemy extends GameObject {
  constructor(x, y, width, height, color, speed) {
    super(x, y, width, height, color);
    this.xSpeed = speed;
    this.ySpeed = speed;
  }
  moveVertically() {
    if( this.y > screenHeight - (this.height + 10) || this.y < 5) {
      this.ySpeed = -this.ySpeed;
    }
    this.y += this.ySpeed;
  }
  moveHorizontally() {
    if( this.x > screenWidth - 90 || this.x < 30) {
      this.xSpeed = -this.xSpeed;
    }
    this.x += this.xSpeed;
  }
}

/************
Game initialization
************/

//Initialize the game objects
var initializeGameObjects = function() {
  player = new Player(50, 175, 45, 45, "rgb(0, 0, 255)");
  goal = new GameObject(screenWidth - 75, (screenHeight - 50)/2, 50, 50, "rgb(255, 255, 255)");
  enemy = [];
}

//Sprite assignment
var loadSprites = function() {
  sprites.player = new Image();
  sprites.player.src = 'img/hero.png';
  sprites.goal = new Image();
  sprites.goal.src = 'img/chest.png';
  sprites.enemy = new Image();
  sprites.enemy.src = 'img/enemy.png';
  sprites.floor = new Image();
  sprites.floor.src = 'img/floor.png';
}

//Randomizes the enemy number, position, and speed.
var setStage = function() {
  var difficultyModifier = Math.floor(Math.random() * 11);
  var numberOfEnemies = 1 + Math.floor((difficultyModifier * gameDifficulty) / (1 + Math.floor(Math.random() * 3)));
  var lastEnemyXPos = screenWidth - 75;
  for(let i = 0; i < numberOfEnemies; i++)
  {
    lastEnemyXPos = lastEnemyXPos - Math.floor(Math.random() * 51) - 60;
    if(lastEnemyXPos < 140)
    {
      lastEnemyXPos = 100;
      i = numberOfEnemies;
    }
    enemy.push(new GameEnemy(lastEnemyXPos, (Math.floor(Math.random() * (screenHeight - 70)) + 30), 30, 30, "rgb(0, 255, 0)", (Math.floor(Math.random() * (gameDifficulty)) +1)));
  }
}

//Starts Game
//Use Enter to restart game after game over
var startGame = function() {
  gameRunning = true;
  setDifficulty();
  initializeGameObjects();
  setStage();
  loadSprites();
  step();
}

//Generic Start Screen before load
var startScreen = function() {
  var titleScreen = new Image();
  titleScreen.onload = function() {
    ctx.clearRect(0, 0, screenWidth, screenHeight);
    ctx.drawImage(titleScreen, 0, 0);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "60px Comic Sans MS";
    ctx.fillText(gameTitle, canvas.width/2, canvas.height/2);
  };
  titleScreen.src = 'img/floor.png';
  window.requestAnimationFrame();
}

/************
Event listeners
************/

//Keydown listens to arrow movement to move player
document.onkeydown = function(event) {
  switch(event.key) {
    case "ArrowRight":
      player.xSpeed = player.maxSpeed;
      rightKey = true;
      break;
    case "ArrowLeft":
      player.xSpeed = -player.maxSpeed;
      leftKey = true;
      break;
    case "ArrowDown":
      player.ySpeed = player.maxSpeed;
      downKey = true;
      break;
    case "ArrowUp":
      player.ySpeed = -player.maxSpeed;
      upKey = true;
      break;
    case "Enter":
      if(!gameRunning) {
        startGame();
      }
      break;
    default:
      break;
  }
}

//Keyup listens to if a key is lifted and checks with the gamestate
//to adjust player movement speed.
document.onkeyup = function(event) {
  switch(event.key) {
    case "ArrowRight":
      if(leftKey) {
        player.xSpeed = -player.maxSpeed;
      }
      else { player.xSpeed = 0;}
      rightKey = false;
      break;
    case "ArrowLeft":
      if(rightKey) {
        player.xSpeed = player.maxSpeed;
      }
      else { player.xSpeed = 0;}
      leftKey = false;
      break;
    case "ArrowDown":
      if(upKey) {
        player.ySpeed = -player.maxSpeed;
      }
      else {player.ySpeed = 0;}
      downKey = false;
      break;
    case "ArrowUp":
      if(downKey) {
        player.ySpeed = player.maxSpeed;
      }
      else {player.ySpeed = 0;}
      upKey = false;
      break;
    default:
      break;
  }
}

/************
Game logic
************/

//Checks collisions between two objects
//Based off rectangle boundaries
var checkCollisions = function(rect1, rect2) {
  var xOverlap = Math.abs(rect1.x - rect2.x) <= Math.max(rect1.width, rect2.width);
  var yOverlap = Math.abs(rect1.y - rect2.y) <= Math.max(rect1.height, rect2.height);
  return xOverlap && yOverlap;
}

//Ends the game on a win or a loss to refresh the page
var endGameLogic = function(text) {
  var scoreOutput = "Wins: " + wins + " / Losses: " + losses;
  ctx.clearRect(0, 0, screenWidth, screenHeight);
  ctx.beginPath();
  ctx.rect(0, 0, screenWidth, screenHeight);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.font = "30px Comic Sans MS";
  ctx.fillText(text, canvas.width/2, canvas.height/2);
  ctx.fillText(scoreOutput, canvas.width/2, canvas.height - 50);
  window.requestAnimationFrame();
}

var setDifficulty = function() {
  if(document.getElementById("easy").checked) {
    gameDifficulty = 1;
  } else if(document.getElementById("medium").checked) {
    gameDifficulty = 2;
  } else if(document.getElementById("hard").checked) {
    gameDifficulty = 3;
  } else {
    gameDifficulty = 1;
  }
}

/************
Game Window Functions
************/

//Updates game objects movement and checks for collisions
var update = function() {
  player.moveHorizontally();
  player.moveVertically();
  if (checkCollisions(player, goal)) {
    gameRunning = false;
    wins += 1;
    endGameLogic("You Win");
  }
  enemy.forEach(function(element){
    if (checkCollisions(player, element)) {
      gameRunning = false;
      losses += 1;
      endGameLogic("You Died");
    }
    element.moveVertically();
  });
}

//Draws game objects on canvas
var draw = function() {
  ctx.clearRect(0, 0, screenWidth, screenHeight);
  ctx.drawImage(sprites.floor, 0, 0);
  ctx.drawImage(sprites.player, player.x, player.y);
  ctx.drawImage(sprites.goal, goal.x, goal.y);
  enemy.forEach(function(element) {
    ctx.drawImage(sprites.enemy, element.x, element.y);
  });
}

//Refreshes the game window, taking updates and drawing sprites.
//Runs until the game is over.
var step = function() {
  update();
  draw();
  if(gameRunning){
    window.requestAnimationFrame(step);
  }
}

document.getElementById("startButton").onclick = function() {
  if(!gameRunning) {
    startGame();
  }
}

startScreen();