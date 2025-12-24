// Enemy.js - оптимизация для 1000+ врагов
class EnemyManager {
  constructor() {
    this.enemies = [];
    this.pool = []; // Object pool для переиспользования
    this.gridSize = 50;
    this.spatialGrid = new Map();
  }

  // Используем spatial grid для оптимизации коллизий
  updateSpatialGrid() {
    this.spatialGrid.clear();

    this.enemies.forEach((enemy) => {
      const gridX = Math.floor(enemy.x / this.gridSize);
      const gridY = Math.floor(enemy.y / this.gridSize);
      const key = `${gridX},${gridY}`;

      if (!this.spatialGrid.has(key)) {
        this.spatialGrid.set(key, []);
      }
      this.spatialGrid.get(key).push(enemy);
    });
  }

  // Быстрая проверка коллизий только в соседних клетках
  getNearbyEnemies(x, y, radius) {
    const gridX = Math.floor(x / this.gridSize);
    const gridY = Math.floor(y / this.gridSize);
    const nearby = [];

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${gridX + dx},${gridY + dy}`;
        const cellEnemies = this.spatialGrid.get(key) || [];

        cellEnemies.forEach((enemy) => {
          const distance = Math.hypot(x - enemy.x, y - enemy.y);
          if (distance < radius) {
            nearby.push(enemy);
          }
        });
      }
    }

    return nearby;
  }
}

class Enemy {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.health = 100;
    this.speed = 50;
    this.isActive = true;
  }

  update(deltaTime, player) {
    if (!this.isActive) return;

    // Простой ИИ: двигаться к игроку
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 10) {
      this.x += (dx / distance) * this.speed * (deltaTime / 1000);
      this.y += (dy / distance) * this.speed * (deltaTime / 1000);
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.die();
      return true; // Умер
    }
    return false; // Выжил
  }

  die() {
    this.isActive = false;
    // Спавн опыта
    GameEngine.spawnExperience(this.x, this.y);
  }
}
