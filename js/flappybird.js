document.addEventListener("DOMContentLoaded", () => {
    const game = {
      container: document.getElementById("game-container"),
      bird: document.getElementById("bird"),
      ground: document.getElementById("ground"),
      scoreDisplay: document.getElementById("score-display"),
      startScreen: document.getElementById("start-screen"),
      gameOverScreen: document.getElementById("game-over-screen"),
      finalScore: document.getElementById("final-score"),
      bestScoreDisplay: document.getElementById("best-score"),
      startButton: document.getElementById("start-button"),
      restartButton: document.getElementById("restart-button"),
      flapSound: new Audio("sfx/flap.wav"),
      hitSound: new Audio("sfx/hit.wav"),
      scoreSound: new Audio("sfx/score.wav"),
    };
  
    const bird = {
      y: 200,
      velocity: 0,
      gravity: 0.5,
      flapStrength: -8, //  מעלה את הציפור  
      flap: function () {
        this.velocity = this.flapStrength;
        game.flapSound.play();
      },
      update: function () {
        this.velocity += this.gravity;
        this.y += this.velocity; // אנחנו מורידים את הציפור ב-0.5 פיקסלים
        if (this.y < 0) this.y = 0; // כך שהציפור תיחסם מלמעלה.
        if (this.y + game.bird.offsetHeight >= getGameDimensions().height - game.ground.offsetHeight) {
          gameHandler.endGame(); // המרחק בין החלק העליון לציפור וזה הגודל
        }
        game.bird.style.top = `${this.y}px`;
      },
      animate: function () {
        // Étape 0 תמונה מקורית: on est a a b0.png'.
        game.bird.src = './img/bird/b1.png';
        // Étape 2 : Après 300 millisecondes, change l'image en 'b2.png'.
        setTimeout(() => game.bird.src = './img/bird/b2.png', 300);
        setTimeout(() => game.bird.src = './img/bird/b0.png', 600);
      },
    };
  
    const pipes = { //  צינורות     
      list: [],
      width: 52,
      gap: 150, // רווח בין שני צינורות
      speed: 3,
      interval: 2000,
      maxOffset: 500,
      lastTime: 0,
      createPipe: function () {
        const { height, width } = getGameDimensions();  //  גודל מסך
        const pipeX = width; // אופקי
        const gapPosition = Math.random() * (height - this.gap - game.ground.offsetHeight);
  
        const topPipe = document.createElement("div");
        topPipe.classList.add("pipe");
        topPipe.style.height = `${gapPosition}px`;
        topPipe.style.width = `${this.width}px`;
        topPipe.style.backgroundImage = "url('./img/toppipe.png')";
        topPipe.style.left = `${pipeX}px`;
        topPipe.style.top = "0px";
  
        const bottomPipe = document.createElement("div");
        bottomPipe.classList.add("pipe");
        bottomPipe.style.height = `${height - this.gap - game.ground.offsetHeight - gapPosition}px`;
        bottomPipe.style.width = `${this.width}px`;
        bottomPipe.style.backgroundImage = "url('./img/botpipe.png')";
        bottomPipe.style.left = `${pipeX}px`;
        bottomPipe.style.bottom = `${game.ground.offsetHeight}px`;
  
        game.container.appendChild(topPipe);
        game.container.appendChild(bottomPipe);
  
        this.list.push({
          x: pipeX,
          topPipe,
          bottomPipe,
        });
      },
      update: function () {
        this.list.forEach((pipe, index) => {
          pipe.x -= this.speed; // אנחנו הולכים להזיז את הצינורות שמאלה
          pipe.topPipe.style.left = `${pipe.x}px`;
          pipe.bottomPipe.style.left = `${pipe.x}px`;
  
          if (pipe.x + this.width < 0) { //אם הצינורות יוצאים מהמסך
            pipe.topPipe.remove(); // לִמְחוֹק
            pipe.bottomPipe.remove();
            this.list.splice(index, 1);
          }
  
          if ( // פונקציה שבודקת אם הציפור נגעה בצינור
            pipe.x < game.bird.offsetLeft + game.bird.offsetWidth &&
            pipe.x + this.width > game.bird.offsetLeft && //רוֹחַב
            (bird.y < pipe.topPipe.offsetHeight || //גוֹבַה 
              bird.y + game.bird.offsetHeight > getGameDimensions().height - game.ground.offsetHeight - pipe.bottomPipe.offsetHeight)
          ) {
            gameHandler.endGame();
          }
  
          if ( // אנו בודקים אם הצינורות נמצאים מאחורי הציפורים, כלומר הם עוברים בין הצינורות
            pipe.x + this.width > game.bird.offsetLeft &&
            pipe.x + this.width <= game.bird.offsetLeft + this.speed
          ) {
            gameHandler.incrementScore();
          }
        });
      },
    };
  
    const gameHandler = {
      score: 0,
      bestScore: 0,
      gameOver: false,
      incrementScore: function () {
        this.score++;
        game.scoreDisplay.textContent = `Score: ${this.score}`;
        game.scoreSound.play();
  
        if (this.score % 5 === 0) {
          pipes.speed += 0.5;
          pipes.gap = Math.max(pipes.gap - 5, 80);
        }
      },
      startGame: function () {
        const { width, height } = getGameDimensions();
  
        game.container.style.width = `${width}px`;
        game.container.style.height = `${height}px`;
  
        bird.y = height / 2; // , אנכי
        bird.velocity = 0; // כוח הכבידה, כמה פיקסלים הציפור יורדות

        pipes.list.forEach((pipe) => {
          pipe.topPipe.remove();
          pipe.bottomPipe.remove();
        });

        pipes.list = [];
        this.score = 0;
        pipes.speed = 3; // בכמה פיקסלים הצינורות מוזזים שמאלה
        pipes.gap = 150; // מרחק בין צינורות
        game.scoreDisplay.textContent = "Score: 0";
        game.gameOverScreen.style.display = "none";
        game.startScreen.style.display = "none";
        pipes.lastTime = 0;
        this.gameOver = false;
        requestAnimationFrame(this.updateGame.bind(this));
      },
      endGame: function () {
        this.gameOver = true;
        game.hitSound.play();
        game.finalScore.textContent = `Score: ${this.score}`;
  
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const currentUser = JSON.parse(sessionStorage.getItem("currentUser")) || null;
        const gameKey = "Flappy Bird";
  
        if (currentUser) {
          const userIndex = users.findIndex(user => user.username === currentUser.username);
  
          if (userIndex !== -1) {
            users[userIndex].scores = users[userIndex].scores || {};
            users[userIndex].scores[gameKey] = Math.max(this.score, users[userIndex].scores[gameKey] || 0);
            this.bestScore = users[userIndex].scores[gameKey];
          } else {
            users.push({
              username: currentUser.username,
              scores: { [gameKey]: this.score },
            });
            this.bestScore = this.score;
          }
  
          localStorage.setItem("users", JSON.stringify(users));
        }
  
        game.bestScoreDisplay.textContent = `Best Score: ${this.bestScore}`;
        game.gameOverScreen.style.display = "block";
      },
      updateGame: function (currentTime) {
        if (this.gameOver) return;
  
        bird.update();
        pipes.update();
  
        if (currentTime - pipes.lastTime > pipes.interval) {
          pipes.createPipe();
          pipes.lastTime = currentTime;
        }
  
        if (!this.gameOver) requestAnimationFrame(this.updateGame.bind(this));
      },
    };
  
    function getGameDimensions() {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    }
  
    game.startButton.addEventListener("click", gameHandler.startGame.bind(gameHandler));
    game.restartButton.addEventListener("click", gameHandler.startGame.bind(gameHandler));
  
    document.addEventListener("keydown", (e) => {
      if (e.code === "Space" && !gameHandler.gameOver) {
        bird.flap();
        bird.animate();
      }
      if (gameHandler.gameOver) gameHandler.startGame();
    });
  
    document.addEventListener("touchstart", () => {
      if (!gameHandler.gameOver) bird.flap();
      if (gameHandler.gameOver) gameHandler.startGame();
    });
  
    window.addEventListener("resize", () => {
      const { width, height } = getGameDimensions();
      game.container.style.width = `${width}px`;
      game.container.style.height = `${height}px`;
    });

  // Initialisation des dimensions du jeu au chargement
  const { width, height } = getGameDimensions();
  game.container.style.width = `${width}px`;
  game.container.style.height = `${height}px`;

  // Affichage de l'écran de démarrage
  game.startScreen.style.display = "block";

  // Synchronisation avec le stockage local pour afficher le meilleur score
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser")) || null;
  if (currentUser) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(user => user.username === currentUser.username);
    if (user && user.scores && user.scores["Flappy Bird"]) {
      game.bestScoreDisplay.textContent = `Best Score: ${user.scores["Flappy Bird"]}`;
    }
  }
});
  