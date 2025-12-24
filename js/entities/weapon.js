/**
 * Класс оружия "Шаровая молния"
 */
export class BallLightning {
  constructor(config) {
    this.name = config.name;
    this.damage = config.damage;
    this.attackSpeed = config.attackSpeed; // Скорость вращения
    this.distance = config.radius; // Удаление от игрока (150px)
    this.hitbox = config.hitbox; // Радиус поражения

    this.angle = 0; // Текущий угол вращения
    this.x = 0;
    this.y = 0;
    this.size = 5; // Диаметр шарика
  }

  update(playerX, playerY) {
    // Увеличиваем угол вращения
    this.angle += this.attackSpeed;

    // Вычисляем позицию шарика относительно игрока по формуле окружности
    this.x = playerX + Math.cos(this.angle) * this.distance;
    this.y = playerY + Math.sin(this.angle) * this.distance;
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
    ctx.fillStyle = "yellow"; // Цвет молнии
    ctx.shadowBlur = 10; // Эффект свечения
    ctx.shadowColor = "yellow";
    ctx.fill();
    ctx.shadowBlur = 0; // Сбрасываем тень, чтобы не влиять на другие объекты
    ctx.closePath();
  }
}
