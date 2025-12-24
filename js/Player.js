// Player.js
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 200;
    this.weapons = [];
    this.lastAttackTime = 0;
    this.attackInterval = 1000; // 1 секунда
  }

  update(deltaTime, enemies) {
    // Движение (управление WASD или стрелками)
    this.handleMovement(deltaTime);

    // Автоматическая атака всех врагов
    this.autoAttack(enemies, deltaTime);

    // Обновление оружия
    this.weapons.forEach((weapon) => weapon.update(deltaTime, this, enemies));
  }

  autoAttack(enemies, deltaTime) {
    const now = Date.now();

    if (now - this.lastAttackTime > this.attackInterval) {
      enemies.forEach((enemy) => {
        const distance = Math.hypot(this.x - enemy.x, this.y - enemy.y);

        // Атакуем врагов в радиусе
        if (distance < this.attackRange) {
          enemy.takeDamage(this.baseDamage);
        }
      });

      this.lastAttackTime = now;
    }
  }

  addWeapon(weaponType) {
    const weapon = WeaponFactory.create(weaponType, this);
    this.weapons.push(weapon);
  }
}
