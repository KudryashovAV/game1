/**
 * Класс управления миром игры.
 * Реализована случайная генерация дверей на разных стенах.
 */

import { Enemy } from "./entities/enemy.js";

export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.roomBounds = { width: 2400, height: 1800 };
    this.doors = [];
    this.entrancePosition = { x: 0, y: 0 };
    this.allSymbols = ["@", "#", "$", "%"];
    this.currentRoom = 1;
    this.enemies = [];
    this.enemyConfig = null;
  }

  async loadEnemyConfig() {
    if (this.enemyConfig) return;
    try {
      const response = await fetch("./assets/enemies.json");
      this.enemyConfig = await response.json();
    } catch (e) {
      this.enemyConfig = { star: { name: "Звезда", speed: 2, hp: 3, color: "#FFD700", blinkColor: "#FFF", size: 25 } };
    }
  }

  spawnEnemies() {
    // Расчет количества: 1 комната = 5, 5 комната = 100
    const count = 5 + Math.floor((this.currentRoom - 1) * 23.75);

    for (let i = 0; i < count; i++) {
      // Спавним врагов на случайном расстоянии от центра, чтобы они не были кучей
      const x = Math.random() * (this.roomBounds.width - 200) + 100;
      const y = Math.random() * (this.roomBounds.height - 200) + 100;

      // Убедимся, что враг не спавнится прямо на игроке (грубая проверка)
      if (Math.abs(x - this.entrancePosition.x) < 300) continue;

      this.enemies.push(new Enemy(this.enemyConfig.star, x, y));
    }
  }

  async setupRoom() {
    this.doors = [];
    let usedSymbols = [...this.allSymbols].sort(() => Math.random() - 0.5);
    const isFinalRoom = this.currentRoom === 5;
    this.enemies = [];
    await this.loadEnemyConfig();
    this.spawnEnemies();

    // 1. ВХОД (Всегда справа, центр)
    const entrance = {
      side: "right",
      x: this.roomBounds.width,
      y: this.roomBounds.height / 2,
      symbol: "",
      hasSymbol: false,
      circleX: this.roomBounds.width - 60,
      circleY: this.roomBounds.height / 2,
      isExit: false,
    };
    this.doors.push(entrance);
    this.entrancePosition = { x: entrance.circleX, y: entrance.circleY };

    // 2. ГЕНЕРАЦИЯ ВЫХОДОВ
    const potentialSides = ["left", "top", "bottom"];

    // Определяем количество выходов: в финале всегда 1, иначе от 1 до 3
    let numExits = isFinalRoom ? 1 : Math.floor(Math.random() * 3) + 1;

    // Перемешиваем стороны, чтобы выбрать случайные
    potentialSides.sort(() => Math.random() - 0.5);
    const selectedSides = potentialSides.slice(0, numExits);

    selectedSides.forEach((side, index) => {
      let doorX, doorY, circleX, circleY;
      const padding = 20; // Отступ от углов, чтобы двери не слипались

      console.log("side", side);
      console.log("numExits", numExits);

      if (side === "left") {
        doorX = 0;
        // Если выход один, ставим строго по центру для макс. удаления
        doorY = this.getRandomInRange(padding, this.roomBounds.height - padding);
        circleX = 60;
        circleY = doorY;
      } else if (side === "top") {
        doorX = this.getRandomInRange(padding, this.roomBounds.width - padding);
        doorY = 0;
        circleX = doorX;
        circleY = 60;
      } else if (side === "bottom") {
        doorX = this.getRandomInRange(padding, this.roomBounds.width - padding);
        doorY = this.roomBounds.height;
        circleX = doorX;
        circleY = this.roomBounds.height - 60;
      }

      this.doors.push({
        side: side,
        x: doorX,
        y: doorY,
        symbol: isFinalRoom ? "" : usedSymbols[index % usedSymbols.length],
        hasSymbol: !isFinalRoom,
        circleX: circleX,
        circleY: circleY,
        isExit: true,
        isFinal: isFinalRoom,
      });
    });
  }

  // Вспомогательная функция для рандома
  getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  async nextLevel() {
    if (this.currentRoom < 5) {
      this.currentRoom++;
      await this.setupRoom();
      document.getElementById("room-display").innerText = `Комната: ${this.currentRoom}/5`;
    }
  }

  checkDoorCollision(player) {
    for (let door of this.doors) {
      if (!door.isExit) continue;

      // Проверка круга
      if (!door.isFinal) {
        const dist = Math.sqrt((player.x - door.circleX) ** 2 + (player.y - door.circleY) ** 2);
        if (dist < 20) return door;
      }

      // Проверка прямоугольника двери
      const doorSizeNormal = 60;
      const doorSizeFinal = 120;
      const currentSize = door.isFinal ? doorSizeFinal : doorSizeNormal;

      // Определяем границы двери в зависимости от стены
      let rect = { x: 0, y: 0, w: 0, h: 0 };
      const thickness = 20;

      if (door.side === "left") {
        rect = { x: 0, y: door.y - currentSize / 2, w: thickness, h: currentSize };
      } else if (door.side === "right") {
        rect = { x: door.x - thickness, y: door.y - currentSize / 2, w: thickness, h: currentSize };
      } else if (door.side === "top") {
        rect = { x: door.x - currentSize / 2, y: 0, w: currentSize, h: thickness };
      } else if (door.side === "bottom") {
        rect = { x: door.x - currentSize / 2, y: door.y - thickness, w: currentSize, h: thickness };
      }

      if (
        player.x + player.size / 2 > rect.x &&
        player.x - player.size / 2 < rect.x + rect.w &&
        player.y + player.size / 2 > rect.y &&
        player.y - player.size / 2 < rect.y + rect.h
      ) {
        return door;
      }
    }
    return null;
  }

  drawRoom() {
    const ctx = this.ctx;
    ctx.fillStyle = "azure";
    ctx.fillRect(0, 0, this.roomBounds.width, this.roomBounds.height);

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 15;
    ctx.strokeRect(0, 0, this.roomBounds.width, this.roomBounds.height);

    this.doors.forEach((door) => this.drawDoor(door));
  }

  drawDoor(door) {
    const ctx = this.ctx;
    const thickness = 20;
    const currentSize = door.isFinal ? 120 : 60;

    ctx.fillStyle = door.isFinal ? "red" : "green";

    // Рисуем дверь в зависимости от стороны
    let dx, dy, dw, dh;
    if (door.side === "left" || door.side === "right") {
      dw = thickness;
      dh = currentSize;
      dx = door.side === "left" ? 0 : door.x - thickness;
      dy = door.y - dh / 2;
    } else {
      dw = currentSize;
      dh = thickness;
      dx = door.x - dw / 2;
      dy = door.side === "top" ? 0 : door.y - thickness;
    }
    ctx.fillRect(dx, dy, dw, dh);

    if (door.hasSymbol && !door.isFinal) {
      ctx.beginPath();
      ctx.arc(door.circleX, door.circleY, 20, 0, Math.PI * 2);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "black";
      ctx.font = "bold 24px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(door.symbol, door.circleX, door.circleY);
    }
  }
}
