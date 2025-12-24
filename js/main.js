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

/**
 * Логика продолжения игры (вынесена в отдельную функцию,
 * чтобы вызывать и по клику, и по нажатию Enter)
 */
function handleContinue() {
  if (!isPaused) return; // Если игра не на паузе, ничего не делаем

  if (game.currentRoom >= 5) {
    location.reload();
    return;
  }

  isPaused = false;
  transitionPopup.classList.add("hidden");
  game.nextLevel();
  player.spawn(game.entrancePosition);
}

async function init() {
  game.setupRoom();
  player.spawn(game.entrancePosition);

  // 1. Обработка клика мышкой
  continueBtn.addEventListener("click", handleContinue);

  // 2. Обработка клавиши Enter
  window.addEventListener("keydown", (e) => {
    if (e.code === "Enter" || e.code === "NumpadEnter") {
      handleContinue();
    }
  });

  // Экипируем первое оружие
  await player.equipWeapon("1");

  requestAnimationFrame(gameLoop);
}

function gameLoop() {
  if (!isPaused) {
    player.update(game.roomBounds);

    game.enemies.forEach((enemy, index) => {
      enemy.update(player.x, player.y);

      // 1. Проверка: Оружие бьет врага
      if (player.weapon) {
        const distToWeapon = Math.sqrt((enemy.x - player.weapon.x) ** 2 + (enemy.y - player.weapon.y) ** 2);
        // Используем радиус поражения (hitbox) из JSON оружия
        if (distToWeapon < enemy.size / 2 + player.weapon.hitbox) {
          enemy.takeDamage(0.1); // Наносим небольшой урон каждый кадр касания
        }
      }

      // 2. Проверка: Враг касается игрока
      const distToPlayer = Math.sqrt((enemy.x - player.x) ** 2 + (enemy.y - player.y) ** 2);
      if (distToPlayer < enemy.size / 2 + player.size / 2) {
        enemy.isDead = true; // Враг погибает при касании по ТЗ
        // Здесь потом добавим вычитание HP у игрока
      }
    });

    // Удаляем мертвых врагов
    game.enemies = game.enemies.filter((e) => !e.isDead);

    const hitDoor = game.checkDoorCollision(player);
    if (hitDoor) {
      showTransition(hitDoor);
    }
  }

  // Отрисовка
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
