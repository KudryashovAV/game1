/**
 * Точка входа в игру. Управляет циклом и камерой.
 */
import { Game } from "./game.js";
import { Player } from "./entities/player.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Установка размера холста на весь экран
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const game = new Game(canvas, ctx);
const player = new Player();

function init() {
  game.setupRoom(); // Генерация комнаты и дверей
  player.spawn(game.entrancePosition); // Появление игрока у входа
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  // 1. Сначала заливаем весь экран серым цветом (пространство за стеной)
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Обновление логики игрока (движение и границы)
  player.update(game.roomBounds);

  // 3. Расчет камеры
  let targetX = canvas.width / 2 - player.x;
  let targetY = canvas.height / 2 - player.y;

  // 10% отступа от края экрана
  const marginX = canvas.width * 0.1;
  const marginY = canvas.height * 0.1;

  // Ограничение камеры, чтобы стены не подходили к краю ближе чем на 10%
  const minX = canvas.width - game.roomBounds.width - marginX;
  const maxX = marginX;
  const minY = canvas.height - game.roomBounds.height - marginY;
  const maxY = marginY;

  const camX = Math.max(minX, Math.min(maxX, targetX));
  const camY = Math.max(minY, Math.min(maxY, targetY));

  // 4. Отрисовка с применением трансформации камеры
  ctx.save();
  ctx.translate(camX, camY);

  game.drawRoom(); // Рисует лазурный пол, стены и двери
  player.draw(ctx); // Рисует игрока

  ctx.restore();

  requestAnimationFrame(gameLoop);
}

// Запуск игры
init();
