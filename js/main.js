// Импортируем другие модули (мы их создадим ниже)
import { Game } from "./game.js";
import { Player } from "./entities/player.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Настройка размера канваса под размер окна
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Создаем объекты
const game = new Game(canvas, ctx);
const player = new Player();

// Инициализация игры
function init() {
  game.setupRoom(); // Генерируем комнату и двери
  player.spawn(game.entrancePosition); // Спавним игрока у входной двери
  requestAnimationFrame(gameLoop); // Запускаем цикл
}

// Главный игровой цикл
function gameLoop() {
  // 1. Очистка (рисуем фон/пол)
  ctx.fillStyle = "azure";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Обновление логики
  player.update(game.roomBounds);

  // 3. Отрисовка
  // Используем камеру, чтобы игрок всегда был в центре,
  // а комната двигалась вокруг него
  ctx.save();
  const cameraX = -player.x + canvas.width / 2;
  const cameraY = -player.y + canvas.height / 2;
  ctx.translate(cameraX, cameraY);

  game.drawRoom(); // Рисуем стены, двери и символы
  player.draw(ctx); // Рисуем игрока

  ctx.restore();

  requestAnimationFrame(gameLoop);
}

init();
