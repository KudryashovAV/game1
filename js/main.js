import { Game } from "./game.js";
import { Player } from "./entities/player.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const transitionPopup = document.getElementById("transition-popup");
const transitionText = document.getElementById("transition-text");
const continueBtn = document.getElementById("continue-btn");
const pausePopup = document.getElementById("pause-popup");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const restartGameBtn = document.getElementById("restart-game-btn");
const restartLevelBtn = document.getElementById("restart-level-btn");
const game = new Game(canvas, ctx);
const player = new Player();

let isPaused = false;
let isPausedByMenu = false; // Отдельное состояние для меню паузы

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

/**
 * Функция включения/выключения паузы
 */
function togglePauseMenu() {
  // Не открываем меню паузы, если уже открыт попап перехода между уровнями
  if (isPaused && !isPausedByMenu) return;

  isPausedByMenu = !isPausedByMenu;
  isPaused = isPausedByMenu; // Общая переменная паузы для игрового цикла

  if (isPausedByMenu) {
    pausePopup.classList.remove("hidden");
  } else {
    pausePopup.classList.add("hidden");
  }
}

/**
 * Перезапуск текущего уровня
 */
async function restartLevel() {
  isPausedByMenu = false;
  isPaused = false;
  pausePopup.classList.add("hidden");

  // Перегенерируем ту же комнату (враги пересоздадутся внутри setupRoom)
  await game.setupRoom();
  player.spawn(game.entrancePosition);
}

/**
 * Перезапуск всей игры
 */
function restartGame() {
  location.reload(); // Самый надежный способ сбросить всё в начальное состояние
}

function handleContinue() {
  if (!isPaused) return;

  if (game.currentRoom >= 5) {
    location.reload();
    return;
  }

  isPaused = false;
  transitionPopup.classList.add("hidden");

  // Порядок важен: сначала генерируем новую комнату
  game.nextLevel().then(() => {
    // Затем перемещаем игрока в точку входа новой комнаты
    player.spawn(game.entrancePosition);
  });
}

async function init() {
  // 1. Сначала генерируем комнату и её границы
  await game.setupRoom();

  // 2. Только когда комната готова, ставим игрока в нужные координаты
  player.spawn(game.entrancePosition);

  // 3. Загружаем оружие
  try {
    await player.equipWeapon("1");
  } catch (e) {
    console.warn("Оружие не загружено, играем без него");
  }

  // 4. Настраиваем события
  continueBtn.addEventListener("click", handleContinue);
  window.addEventListener("keydown", (e) => {
    if (e.code === "Enter" || e.code === "NumpadEnter") handleContinue();
  });

  // Клик по кнопке "Пауза" в интерфейсе
  pauseBtn.addEventListener("click", (e) => {
    e.blur(); // Снимаем фокус с кнопки, чтобы Enter не нажимал её повторно
    togglePauseMenu();
  });

  // Кнопки внутри попапа
  resumeBtn.addEventListener("click", togglePauseMenu);
  restartLevelBtn.addEventListener("click", restartLevel);
  restartGameBtn.addEventListener("click", restartGame);

  // Клавиша Esc и Enter для управления
  window.addEventListener("keydown", (e) => {
    if (e.code === "Escape") {
      togglePauseMenu();
    }

    // Если открыто меню паузы, Enter работает как "Продолжить"
    if (isPausedByMenu && (e.code === "Enter" || e.code === "NumpadEnter")) {
      togglePauseMenu();
    }
  });

  // 5. И только теперь запускаем цикл
  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  if (!isPaused) {
    player.update(game.roomBounds);

    // Логика врагов
    game.enemies.forEach((enemy) => {
      enemy.update(player.x, player.y);

      // Оружие -> Враг
      if (player.weapon) {
        const dx = enemy.x - player.weapon.x;
        const dy = enemy.y - player.weapon.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < enemy.size / 2 + player.weapon.hitbox) {
          enemy.takeDamage(0.05);
        }
      }

      // Враг -> Игрок
      const dxP = enemy.x - player.x;
      const dyP = enemy.y - player.y;
      const distP = Math.sqrt(dxP * dxP + dyP * dyP);
      if (distP < enemy.size / 2 + player.size / 2) {
        enemy.isDead = true;
      }
    });

    game.enemies = game.enemies.filter((e) => !e.isDead);

    const hitDoor = game.checkDoorCollision(player);
    if (hitDoor) {
      showTransition(hitDoor);
    }
  }

  // Рендеринг
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
  game.enemies.forEach((enemy) => enemy.draw(ctx));
  player.draw(ctx);
  ctx.restore();

  requestAnimationFrame(gameLoop);
}

function showTransition(door) {
  isPaused = true;
  if (game.currentRoom === 5) {
    transitionText.innerText = "Ура! Игра пройдена";
    continueBtn.innerText = "Начать заново";
  } else {
    transitionText.innerText = `Уровень пройден, следующая комната содержит ${door.symbol}`;
    continueBtn.innerText = "Продолжить";
  }
  transitionPopup.classList.remove("hidden");
}

init();
