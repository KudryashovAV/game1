/**
 * Класс игрока.
 */
export class Player {
  constructor() {
    this.size = 20; // Примерно 5мм на типичном мониторе
    this.x = 0;
    this.y = 0;
    this.speed = 7;
    this.keys = {};

    // Отслеживание нажатых клавиш
    window.addEventListener("keydown", (e) => (this.keys[e.code] = true));
    window.addEventListener("keyup", (e) => (this.keys[e.code] = false));
  }

  spawn(pos) {
    this.x = pos.x;
    this.y = pos.y;
  }

  update(bounds) {
    // Движение по WASD или Стрелкам
    if (this.keys["KeyW"] || this.keys["ArrowUp"]) this.y -= this.speed;
    if (this.keys["KeyS"] || this.keys["ArrowDown"]) this.y += this.speed;
    if (this.keys["KeyA"] || this.keys["ArrowLeft"]) this.x -= this.speed;
    if (this.keys["KeyD"] || this.keys["ArrowRight"]) this.x += this.speed;

    // Ограничение передвижения: не даем выйти за стены комнаты
    // Учитываем размер игрока (от центра)
    const half = this.size / 2;
    if (this.x < half) this.x = half;
    if (this.x > bounds.width - half) this.x = bounds.width - half;
    if (this.y < half) this.y = half;
    if (this.y > bounds.height - half) this.y = bounds.height - half;
  }

  draw(ctx) {
    ctx.fillStyle = "black";
    // Рисуем квадрат, где (x, y) — это его центр
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);

    // Маленькая обводка, чтобы игрок не сливался с лазурным, если будет светлое оформление
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.strokeRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }
}
