/**
 * Класс врага в форме пятиконечной звезды
 */
export class Enemy {
  constructor(config, x, y) {
    this.x = x;
    this.y = y;
    this.speed = config.speed;
    this.hp = config.hp;
    this.maxHp = config.hp;
    this.color = config.color;
    this.blinkColor = config.blinkColor;
    this.size = config.size;

    this.isBlinking = false;
    this.blinkTimer = 0;
    this.isDead = false;
  }

  // Логика движения в сторону игрока
  update(playerX, playerY) {
    if (this.isDead) return;

    // Вычисляем вектор направления к игроку
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      // Движение с постоянной скоростью
      this.x += (dx / distance) * this.speed;
      this.y += (dy / distance) * this.speed;
    }

    // Таймер моргания при получении урона
    if (this.isBlinking) {
      this.blinkTimer--;
      if (this.blinkTimer <= 0) this.isBlinking = false;
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.isBlinking = true;
    this.blinkTimer = 5; // Моргает 5 кадров
    if (this.hp <= 0) this.isDead = true;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    ctx.fillStyle = this.isBlinking ? this.blinkColor : this.color;

    // Рисование пятиконечной звезды
    ctx.beginPath();
    const spikes = 5;
    const outerRadius = this.size / 2;
    const innerRadius = this.size / 4;
    let rot = (Math.PI / 2) * 3;
    let x = 0;
    let y = 0;
    const step = Math.PI / spikes;

    for (let i = 0; i < spikes; i++) {
      x = Math.cos(rot) * outerRadius;
      y = Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = Math.cos(rot) * innerRadius;
      y = Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(0, -outerRadius);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
