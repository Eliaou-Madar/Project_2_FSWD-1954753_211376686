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

  // Variables du jeu
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
  let bestScore = 0; // Initialisé correctement plus bas
  let gameOver = false;
  let lastPipeTime = 0;
  let pipeSpeed = initialPipeSpeed;
  let pipeGap = initialPipeGap;

  /**
   * Créer une paire de tuyaux (haut et bas).
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
   * Mettre à jour l'état du jeu et l'animation.
   * @param {DOMHighResTimeStamp} currentTime - Le temps actuel en millisecondes.
   */
  function updateGame(currentTime) {
      if (gameOver) return;

      // Appliquer la gravité à l'oiseau
      birdVelocity += gravity;
      birdY += birdVelocity;

      // Empêcher l'oiseau de quitter la zone de jeu
      if (birdY < 0) birdY = 0;
      if (birdY + bird.offsetHeight >= getGameDimensions().height - ground.offsetHeight) {
          endGame();
      }

      bird.style.top = `${birdY}px`;

      // Mettre à jour les tuyaux
      pipes.forEach((pipe, index) => {
          pipe.x -= pipeSpeed;

          // Mettre à jour la position des tuyaux
          pipe.topPipe.style.left = `${pipe.x}px`;
          pipe.bottomPipe.style.left = `${pipe.x}px`;

          // Supprimer les tuyaux qui sont hors de l'écran
          if (pipe.x + pipeWidth < 0) {
              pipe.topPipe.remove();
              pipe.bottomPipe.remove();
              pipes.splice(index, 1);
          }

          // Vérifier les collisions
          if (
              pipe.x < bird.offsetLeft + bird.offsetWidth &&
              pipe.x + pipeWidth > bird.offsetLeft &&
              (birdY < pipe.topPipe.offsetHeight ||
                  birdY + bird.offsetHeight > gameContainer.offsetHeight - ground.offsetHeight - pipe.bottomPipe.offsetHeight)
          ) {
              endGame();
          }

          // Incrémenter le score lorsque l'oiseau passe un tuyau
          if (
              pipe.x + pipeWidth > bird.offsetLeft &&
              pipe.x + pipeWidth <= bird.offsetLeft + pipeSpeed
          ) {
              score++;
              scoreDisplay.textContent = `Score: ${score}`;
              scoreSound.play();

              // Augmenter la difficulté
              if (score % 5 === 0) {
                  pipeSpeed += 0.5;
                  pipeGap = Math.max(pipeGap - 5, 80);
              }
          }
      });

      // Générer de nouveaux tuyaux à intervalles
      if (currentTime - lastPipeTime > pipeInterval) {
          createPipe();
          lastPipeTime = currentTime;
      }

      // Continuer la boucle du jeu
      if (!gameOver) requestAnimationFrame(updateGame);
  }

  /**
   * Gérer la logique de fin de jeu.
   */
  function endGame() {
    gameOver = true;
    hitSound.play();
    finalScore.textContent = `Score: ${score}`;

    // Récupérer les données des utilisateurs depuis localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null; // Récupérer l'utilisateur actif
    const gameKey = "jeu1"; // Nom du jeu ou identifiant unique

    if (currentUser) {
        const userIndex = users.findIndex(user => user.username === currentUser.username);

        if (userIndex !== -1) {
            // Initialiser les scores si nécessaire
            users[userIndex].scores = users[userIndex].scores || {};

            // Mettre à jour le meilleur score pour le jeu actuel
            users[userIndex].scores[gameKey] = Math.max(score, users[userIndex].scores[gameKey] || 0);

            // Mettre à jour le meilleur score global
            bestScore = users[userIndex].scores[gameKey];
            bestScoreDisplay.textContent = `Best Score: ${bestScore}`;
        } else {
            // Si l'utilisateur n'existe pas encore, l'ajouter
            users.push({
                username: currentUser.username,
                email: currentUser.email || '', // Optionnel : ajouter l'email si disponible
                password: currentUser.password || '', // Optionnel : ajouter le mot de passe si disponible
                scores: { [gameKey]: score },
            });
            bestScore = score;
            bestScoreDisplay.textContent = `Best Score: ${bestScore}`;
        }

        // Sauvegarder les modifications dans localStorage
        localStorage.setItem('users', JSON.stringify(users));
    }

    gameOverScreen.style.display = "block";
}

  /**
   * Démarrer ou redémarrer le jeu.
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

  // Contrôles tactiles pour support mobile
  document.addEventListener("touchstart", (e) => {
      if (!gameOver) {
          birdVelocity = flapStrength;
          flapSound.play();
      }
      if (gameOver) startGame();
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

  // Initialisation du meilleur score pour l'utilisateur actuel
  // Initialisation du meilleur score pour l'utilisateur actuel
const users = JSON.parse(localStorage.getItem('users')) || [];
const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;

if (currentUser) {
    const user = users.find(user => user.username === currentUser.username);
    if (user && user.scores && user.scores["jeu1"]) {
        bestScore = user.scores["jeu1"];
        bestScoreDisplay.textContent = `Best Score: ${bestScore}`;
    } else {
        bestScore = 0;
        bestScoreDisplay.textContent = `Best Score: ${bestScore}`;
    }
} else {
    bestScore = 0;
    bestScoreDisplay.textContent = `Best Score: ${bestScore}`;
}
});
