const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');

const keys = {};

let score;
let lives;
let gameOver;
let player;
let coin;
let enemies;

function resetGame() {
  score = 0;
  lives = 3;
  gameOver = false;

  player = {
    x: 40,
    y: 40,
    size: 24,
    speed: 4
  };

  coin = createCoin();

  enemies = [
    { x: 180, y: 100, w: 36, h: 36, vx: 2.2, vy: 1.6 },
    { x: 420, y: 280, w: 44, h: 44, vx: -2.6, vy: 1.8 },
    { x: 530, y: 80, w: 30, h: 30, vx: -1.8, vy: 2.5 }
  ];

  updateHud();
  messageEl.textContent = 'Attrape les pièces jaunes.';
}

function createCoin() {
  return {
    x: Math.floor(Math.random() * (canvas.width - 40)) + 20,
    y: Math.floor(Math.random() * (canvas.height - 40)) + 20,
    size: 18
  };
}

function updateHud() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
}

function movePlayer() {
  if (keys.ArrowUp || keys.z || keys.Z || keys.w || keys.W) player.y -= player.speed;
  if (keys.ArrowDown || keys.s || keys.S) player.y += player.speed;
  if (keys.ArrowLeft || keys.q || keys.Q || keys.a || keys.A) player.x -= player.speed;
  if (keys.ArrowRight || keys.d || keys.D) player.x += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));
}

function moveEnemies() {
  enemies.forEach(enemy => {
    enemy.x += enemy.vx;
    enemy.y += enemy.vy;

    if (enemy.x <= 0 || enemy.x + enemy.w >= canvas.width) enemy.vx *= -1;
    if (enemy.y <= 0 || enemy.y + enemy.h >= canvas.height) enemy.vy *= -1;
  });
}

function isColliding(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.size > b.x &&
    a.y < b.y + b.h &&
    a.y + a.size > b.y
  );
}

function isCoinCollected() {
  const dx = player.x + player.size / 2 - coin.x;
  const dy = player.y + player.size / 2 - coin.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < player.size / 2 + coin.size / 2;
}

function handleCollisions() {
  if (isCoinCollected()) {
    score += 1;
    coin = createCoin();
    messageEl.textContent = '+1 point';

    if (score % 5 === 0) {
      enemies.push({
        x: Math.random() * 500 + 50,
        y: Math.random() * 300 + 50,
        w: 28,
        h: 28,
        vx: (Math.random() > 0.5 ? 1 : -1) * 2.8,
        vy: (Math.random() > 0.5 ? 1 : -1) * 2.2
      });
      messageEl.textContent = 'Niveau augmenté : nouvel ennemi.';
    }
  }

  for (const enemy of enemies) {
    if (isColliding(player, enemy)) {
      lives -= 1;
      updateHud();
      messageEl.textContent = 'Touché. Retour au départ.';
      player.x = 40;
      player.y = 40;

      if (lives <= 0) {
        gameOver = true;
        messageEl.textContent = `Game over. Score final : ${score}`;
      }
      break;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#22c55e';
  ctx.fillRect(player.x, player.y, player.size, player.size);

  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, coin.size / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ef4444';
  enemies.forEach(enemy => {
    ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h);
  });
}

function gameLoop() {
  if (!gameOver) {
    movePlayer();
    moveEnemies();
    handleCollisions();
    updateHud();
  }

  draw();
  requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', event => {
  keys[event.key] = true;
});

document.addEventListener('keyup', event => {
  keys[event.key] = false;
});

restartBtn.addEventListener('click', resetGame);

resetGame();
gameLoop();
