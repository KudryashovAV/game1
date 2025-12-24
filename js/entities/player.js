import { BallLightning } from "./weapon.js";

export class Player {
  constructor() {
    this.size = 20;
    this.x = 0;
    this.y = 0;
    this.speed = 7;
    this.keys = {};
    this.weapon = null; // Текущее оружие

    window.addEventListener("keydown", (e) => (this.keys[e.code] = true));
    window.addEventListener("keyup", (e) => (this.keys[e.code] = false));
  }

  // Загрузка оружия из JSON
  async equipWeapon(weaponId) {
    var config = null;

    try {
      const response = await fetch("../assets/weapons.json");
      const data = await response.json();
      config = data[weaponId];

      if (config) {
        this.weapon = new BallLightning(config);
        document.getElementById("weapon-display").innerText = `Моё оружие: ${this.weapon.name}`;
      }
    } catch (error) {
      console.warn("JSON не найден, использую стандартные настройки оружия.");
      // Запасной вариант, если JSON не загрузился
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
    if (this.keys["KeyW"] || this.keys["ArrowUp"]) this.y -= this.speed;
    if (this.keys["KeyS"] || this.keys["ArrowDown"]) this.y += this.speed;
    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) this.x -= this.speed;
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) this.x += this.speed;

    const half = this.size / 2;
    this.x = Math.max(half, Math.min(this.x, bounds.width - half));
    this.y = Math.max(half, Math.min(this.y, bounds.height - half));

    // Обновляем позицию оружия, если оно есть
    if (this.weapon) {
      this.weapon.update(this.x, this.y);
    }
  }

  draw(ctx) {
    // Сначала рисуем оружие (оно может быть под или над игроком)
    if (this.weapon) {
      this.weapon.draw(ctx);
    }

    ctx.fillStyle = "black";
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }
}
