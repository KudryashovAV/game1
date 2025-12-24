export class Player {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.size = 20; // Примерно 5мм
    this.speed = 5;
    this.keys = {};

    // Слушаем нажатия клавиш
    window.addEventListener("keydown", (e) => (this.keys[e.code] = true));
    window.addEventListener("keyup", (e) => (this.keys[e.code] = false));
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

    // Ограничение движения границами комнаты
    this.x = Math.max(0, Math.min(this.x, bounds.width - this.size));
    this.y = Math.max(0, Math.min(this.y, bounds.height - this.size));
  }

  draw(ctx) {
    ctx.fillStyle = "white";
    // Центрируем квадрат относительно координат x/y
    ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
  }
}
