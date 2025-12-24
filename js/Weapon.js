// Weapon.js
class Weapon {
  constructor(type, owner) {
    this.type = type;
    this.owner = owner;
    this.damage = 10;
    this.cooldown = 1000;
    this.lastFire = 0;
    this.projectiles = [];
  }

  update(deltaTime, player, enemies) {
    const now = Date.now();

    if (now - this.lastFire > this.cooldown) {
      this.fire(enemies);
      this.lastFire = now;
    }

    // Обновление снарядов
    this.projectiles.forEach((proj, index) => {
      proj.update(deltaTime);

      // Удаление вышедших за пределы
      if (proj.isOutOfBounds()) {
        this.projectiles.splice(index, 1);
      }
    });
  }

  fire(enemies) {
    switch (this.type) {
      case "whip":
        this.fireWhip(enemies);
        break;
      case "magic_wand":
        this.fireMagicWand(enemies);
        break;
      case "knife":
        this.fireKnife(enemies);
        break;
    }
  }

  fireWhip(enemies) {
    // Ближняя атака по дуге
    enemies.forEach((enemy) => {
      const distance = Math.hypot(this.owner.x - enemy.x, this.owner.y - enemy.y);

      if (distance < 100) {
        // Радиус атаки
        enemy.takeDamage(this.damage);
      }
    });
  }
}
