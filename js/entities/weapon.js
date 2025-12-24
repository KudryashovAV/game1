/**
 * Класс оружия "Шаровая молния"
 */
export class BallLightning {
  constructor(config) {
    this.name = config.name;
    this.damage = config.damage;
    this.attackSpeed = config.attackSpeed;
    this.distance = config.radius;
    this.hitbox = config.hitbox;

    this.angle = 0;
    this.x = 0;
    this.y = 0;
    this.size = 10; // Сделаем чуть крупнее (10px), чтобы точно заметить
  }

  update(playerX, playerY) {
    // Увеличиваем угол
    this.angle += this.attackSpeed;

    // Вычисляем позицию шарика вокруг игрока
    this.x = playerX + Math.cos(this.angle) * this.distance;
    this.y = playerY + Math.sin(this.angle) * this.distance;
  }

  draw(ctx) {
    ctx.save(); // Сохраняем состояние контекста

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);

    // Стиль молнии
    ctx.fillStyle = "yellow";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "yellow";

    ctx.fill();

    // Добавим яркую обводку, чтобы было видно на лазурном фоне
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.closePath();
    ctx.restore(); // Возвращаем настройки (убирает тенm)
  }
}
