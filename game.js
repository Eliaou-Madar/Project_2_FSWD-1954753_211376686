document.addEventListener("DOMContentLoaded", () => {
  const gameContainer = document.getElementById("game-container");
  const bird = document.getElementById("bird");
  const ground = document.getElementById("ground");
  const scoreDisplay = document.getElementById("score-display");
  const startScreen = document.getElementById("start-screen");
  const gameOverScreen = document.getElementById("game-over-screen");
  const finalScore = document.getElementById("final-score");
  const bestScoreDisplay = document.getElementById("best-score");
  const startButton = document.getElementById("start-button");
  const restartButton = document.getElementById("restart-button");

  const flapSound = new Audio("sfx/flap.wav");
  const hitSound = new Audio("sfx/hit.wav");
  const scoreSound = new Audio("sfx/score.wav");

  // Game variables
  let birdY = 200;
  let birdVelocity = 0;
  const gravity = 0.5;
  const flapStrength = -8;

  let pipes = [];
  const initialPipeGap = 150;
  const pipeWidth = 52;
  const initialPipeSpeed = 3;
  const pipeInterval = 2000;
  const maxPipeOffset = 500;

  let score = 0;
  let bestScore = localStorage.getItem("bestScore") || 0;
  let gameOver = false;
  let lastPipeTime = 0;
  let pipeSpeed = initialPipeSpeed;
  let pipeGap = initialPipeGap;

  /**
   * Create a pair of pipes (top and bottom).
   */
  function createPipe() {
    const { height, width } = getGameDimensions();
    const pipeX = width; // Tuyaux commencent à droite de l'écran
    const pipeGapPosition = Math.floor(
      Math.random() * (height - pipeGap - ground.offsetHeight)
    );
  
    // Créer le tuyau supérieur
    const topPipe = document.createElement("div");
    topPipe.classList.add("pipe");
    topPipe.style.height = `${pipeGapPosition}px`;
    topPipe.style.width = `${pipeWidth}px`;
    topPipe.style.backgroundImage = "url('./img/toppipe.png')";
    topPipe.style.left = `${pipeX}px`;
    topPipe.style.top = "0px";
  
    // Créer le tuyau inférieur
    const bottomPipe = document.createElement("div");
    bottomPipe.classList.add("pipe");
    bottomPipe.style.height = `${
      height - pipeGap - ground.offsetHeight - pipeGapPosition
    }px`;
    bottomPipe.style.width = `${pipeWidth}px`;
    bottomPipe.style.backgroundImage = "url('./img/botpipe.png')";
    bottomPipe.style.left = `${pipeX}px`;
    bottomPipe.style.bottom = `${ground.offsetHeight}px`;
  
    // Ajouter les tuyaux au conteneur de jeu
    gameContainer.appendChild(topPipe);
    gameContainer.appendChild(bottomPipe);
  
    // Ajouter les tuyaux à la liste des tuyaux actifs
    pipes.push({
      x: pipeX,
      topPipe: topPipe,
      bottomPipe: bottomPipe,
    });
  }
  
  

  /**
   * Update the game state and animation.
   * @param {DOMHighResTimeStamp} currentTime - The current time in milliseconds.
   */
  function updateGame(currentTime) {
    if (gameOver) return;

    // Apply gravity to bird
    birdVelocity += gravity;
    birdY += birdVelocity;

    // Prevent the bird from leaving the game area
    if (birdY < 0) birdY = 0;
    if (birdY + bird.offsetHeight >= getGameDimensions().height - ground.offsetHeight) {
      endGame();
    }

    bird.style.top = `${birdY}px`;

    // Update pipes
    pipes.forEach((pipe, index) => {
      pipe.x -= pipeSpeed;

      // Update pipe positions
      pipe.topPipe.style.left = `${pipe.x}px`;
      pipe.bottomPipe.style.left = `${pipe.x}px`;

      // Remove pipes that are off-screen
      if (pipe.x + pipeWidth < 0) {
        pipe.topPipe.remove();
        pipe.bottomPipe.remove();
        pipes.splice(index, 1);
      }

      // Check for collisions
      if (
        pipe.x < bird.offsetLeft + bird.offsetWidth &&
        pipe.x + pipeWidth > bird.offsetLeft &&
        (birdY < pipe.topPipe.offsetHeight ||
          birdY + bird.offsetHeight > gameContainer.offsetHeight - ground.offsetHeight - pipe.bottomPipe.offsetHeight)
      ) {
        endGame();
      }

      // Increment score when bird passes a pipe
      if (
        pipe.x + pipeWidth > bird.offsetLeft &&
        pipe.x + pipeWidth <= bird.offsetLeft + pipeSpeed
    ) {
        score++;
        scoreDisplay.textContent = `Score: ${score}`;
        scoreSound.play();
    
        // Increase difficulty
        if (score % 5 === 0) {
            pipeSpeed += 0.5;
            pipeGap = Math.max(pipeGap - 5, 80);
        }
    }
    });

    // Generate new pipes at intervals
    if (currentTime - lastPipeTime > pipeInterval) {
      createPipe();
      lastPipeTime = currentTime;
    }

    // Continue the game loop
    if (!gameOver) requestAnimationFrame(updateGame);
  }

  /**
   * Handle game over logic.
   */
  function endGame() {
    gameOver = true;
    hitSound.play();
    finalScore.textContent = `Score: ${score}`;
    bestScore = Math.max(score, bestScore);
    localStorage.setItem("bestScore", bestScore);
    bestScoreDisplay.textContent = `Best Score: ${bestScore}`;
    gameOverScreen.style.display = "block";
  }

  /**
   * Start or restart the game.
   */
  function startGame() {
    const { width, height } = getGameDimensions();
  
    gameContainer.style.width = `${width}px`;
    gameContainer.style.height = `${height}px`;
  
    birdY = height / 2;
    birdVelocity = 0;
    pipes.forEach((pipe) => {
      pipe.topPipe.remove();
      pipe.bottomPipe.remove();
    });
    pipes = [];
    score = 0;
    pipeSpeed = initialPipeSpeed;
    pipeGap = initialPipeGap;
    scoreDisplay.textContent = "Score: 0";
    gameOverScreen.style.display = "none";
    startScreen.style.display = "none";
    lastPipeTime = 0;
    gameOver = false;
    requestAnimationFrame(updateGame);
  }

  // Event listeners
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !gameOver) {
        // Changer l'image de l'oiseau à chaque saut
        flapBirdImage();

        // Appliquer la force de vol
        birdVelocity = flapStrength;
        flapSound.play();
    }
    if (gameOver) startGame();
});

// Fonction pour alterner l'image de l'oiseau lors du saut
function flapBirdImage() {
    bird.src = './img/bird/b1.png'; // L'oiseau passe à b1.png
    setTimeout(() => {
        bird.src = './img/bird/b2.png'; // Puis à b2.png après 0.3 sec
    }, 300);

    setTimeout(() => {
        bird.src = './img/bird/b0.png'; // Enfin, on revient à b0.png après 0.6 sec
    }, 600);
}

  startButton.addEventListener("click", startGame);
  restartButton.addEventListener("click", startGame);

  // Touch controls for mobile support
  document.addEventListener("touchstart", (e) => {
    if (!gameOver) {
      birdVelocity = flapStrength;
      flapSound.play();
    }
    if (gameOver) startGame();
  });
});


window.addEventListener("resize", () => {
  const { width, height } = getGameDimensions();
  gameContainer.style.width = `${width}px`;
  gameContainer.style.height = `${height}px`;
});


function getGameDimensions() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}
