import { Game } from "./game.js";
import { Player } from "./entities/player.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const transitionPopup = document.getElementById("transition-popup");
const transitionText = document.getElementById("transition-text");
const continueBtn = document.getElementById("continue-btn");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const game = new Game(canvas, ctx);
const player = new Player();
let isPaused = false;

function init() {
  game.setupRoom();
  player.spawn(game.entrancePosition);

  // Обработка клика по кнопке "Продолжить"
  continueBtn.addEventListener("click", () => {
    isPaused = false;
    transitionPopup.classList.add("hidden");
    game.nextLevel(); // Генерируем новую комнату
    player.spawn(game.entrancePosition); // Перемещаем игрока к новой входной двери
  });

  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  if (!isPaused) {
    // 1. Логика
    player.update(game.roomBounds);

    // Проверка столкновения с дверями
    const hitDoor = game.checkDoorCollision(player);
    if (hitDoor) {
      showTransition(hitDoor.symbol);
    }
  }

  // 2. Отрисовка
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let targetX = canvas.width / 2 - player.x;
  let targetY = canvas.height / 2 - player.y;
  const marginX = canvas.width * 0.1;
  const marginY = canvas.height * 0.1;
  const camX = Math.max(canvas.width - game.roomBounds.width - marginX, Math.min(marginX, targetX));
  const camY = Math.max(canvas.height - game.roomBounds.height - marginY, Math.min(marginY, targetY));

  ctx.save();
  ctx.translate(camX, camY);
  game.drawRoom();
  player.draw(ctx);
  ctx.restore();

  requestAnimationFrame(gameLoop);
}

function showTransition(symbol) {
  isPaused = true;
  transitionText.innerText = `Уровень пройден, следующая комната содержит ${symbol}`;
  transitionPopup.classList.remove("hidden");
}

init();
