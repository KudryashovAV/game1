import { BallLightning } from "./weapon.js";

export class Player {
  constructor() {
    this.size = 20;
    this.x = 0;
    this.y = 0;
    this.speed = 7;
    this.keys = {};
    this.weapon = null;

    // Слушатели клавиш
    window.addEventListener("keydown", (e) => (this.keys[e.code] = true));
    window.addEventListener("keyup", (e) => (this.keys[e.code] = false));
  }

  async equipWeapon(weaponId) {
    let config;
    try {
      const response = await fetch("../assets/weapons.json");
      const data = await response.json();
      config = data[weaponId];
    } catch (error) {
      console.warn("Используются локальные настройки оружия");
      config = {
        name: "Шаровая молния",
        damage: 1,
        attackSpeed: 0.05,
        radius: 150,
        hitbox: 15,
      };
    }

    if (config) {
      this.weapon = new BallLightning(config);
      const display = document.getElementById("weapon-display");
      if (display) display.innerText = `Моё оружие: ${this.weapon.name}`;
    }
  }

  spawn(pos) {
    this.x = pos.x;
    this.y = pos.y;
  }

  update(bounds) {
    // --- 1. ДВИЖЕНИЕ ИГРОКА ---
    // Проверяем каждую ось независимо
    if (this.keys["KeyW"] || this.keys["ArrowUp"]) {
      this.y -= this.speed;
    }
    if (this.keys["KeyS"] || this.keys["ArrowDown"]) {
      this.y += this.speed;
    }
    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) {
      this.x -= this.speed;
    }
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) {
      this.x += this.speed;
    }

    // --- 2. ОГРАНИЧЕНИЕ ГРАНИЦАМИ (COLLISION) ---
    const half = this.size / 2;
    // Ограничение по X
    if (this.x < half) this.x = half;
    if (this.x > bounds.width - half) this.x = bounds.width - half;

    // Ограничение по Y
    if (this.y < half) this.y = half;
    if (this.y > bounds.height - half) this.y = bounds.height - half;

    // --- 3. ОБНОВЛЕНИЕ ОРУЖИЯ ---
    // Оружие просто "подсматривает" текущие координаты игрока
    if (this.weapon) {
      this.weapon.update(this.x, this.y);
    }
  }

  draw(ctx) {
    // Отрисовка оружия (под игроком или над ним — на твой вкус)
    if (this.weapon) {
      this.weapon.draw(ctx);
    }

    // Отрисовка игрока
    ctx.fillStyle = "black";
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }
}
