// js/OptimizedRenderer.js
class OptimizedRenderer {
  constructor(canvas, width, height) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = width;
    this.height = height;

    // Оффскринный канвас для статичного фона
    this.bgCanvas = document.createElement("canvas");
    this.bgCanvas.width = width;
    this.bgCanvas.height = height;
    this.bgCtx = this.bgCanvas.getContext("2d");

    // Оффскринный канвас для врагов (batch rendering)
    this.enemyCanvas = document.createElement("canvas");
    this.enemyCanvas.width = width;
    this.enemyCanvas.height = height;
    this.enemyCtx = this.enemyCanvas.getContext("2d");

    // Кэш для спрайтов
    this.spriteCache = new Map();

    // Флаги для частичного обновления
    this.dirty = true;

    // Предварительный рендеринг фона
    this.renderBackground();
  }

  // Рендеринг статичного фона один раз
  renderBackground() {
    const ctx = this.bgCtx;

    // Градиентный фон
    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, "#0a0a2a");
    gradient.addColorStop(1, "#000010");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);

    // Статичные декорации (можно добавить)
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      const size = Math.random() * 3 + 1;
      ctx.fillRect(x, y, size, size);
    }
  }

  // Пакетный рендеринг врагов
  renderEnemies(enemies) {
    const ctx = this.enemyCtx;

    // Очищаем только если нужно
    if (this.dirty) {
      ctx.clearRect(0, 0, this.width, this.height);
    }

    // Группируем врагов по типу для batch rendering
    const enemiesByType = {};
    enemies.forEach((enemy) => {
      if (!enemiesByType[enemy.type]) {
        enemiesByType[enemy.type] = [];
      }
      enemiesByType[enemy.type].push(enemy);
    });

    // Рендерим каждую группу одним draw call
    Object.entries(enemiesByType).forEach(([type, typeEnemies]) => {
      // Выбираем цвет по типу
      const color = this.getEnemyColor(type);
      ctx.fillStyle = color;

      // Рисуем всех врагов этого типа
      ctx.beginPath();
      typeEnemies.forEach((enemy) => {
        if (enemy.isActive) {
          ctx.moveTo(enemy.x + enemy.radius, enemy.y);
          ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        }
      });
      ctx.fill();
    });

    this.dirty = false;
  }

  getEnemyColor(type) {
    const colors = {
      basic: "#ff4444",
      fast: "#ff8844",
      tank: "#ff44ff",
      ranged: "#44aaff",
    };
    return colors[type] || "#ff4444";
  }

  // Основной метод рендеринга
  render(gameState) {
    const { player, enemies, projectiles, particles } = gameState;

    // 1. Рисуем предзарендеренный фон
    this.ctx.drawImage(this.bgCanvas, 0, 0);

    // 2. Рисуем врагов (пакетно)
    this.renderEnemies(enemies);
    this.ctx.drawImage(this.enemyCanvas, 0, 0);

    // 3. Рисуем игрока
    this.renderPlayer(player);

    // 4. Рисуем снаряды (группой)
    this.renderProjectiles(projectiles);

    // 5. Рисуем частицы (группой)
    this.renderParticles(particles);

    // 6. Рисуем опыт (опционально, если много - оптимизировать)
    if (gameState.experienceOrbs) {
      this.renderExperienceOrbs(gameState.experienceOrbs);
    }

    // 7. Рисуем UI поверх всего
    this.renderUI(gameState.ui);
  }

  renderPlayer(player) {
    const ctx = this.ctx;

    // Тело игрока
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fill();

    // Эффект свечения
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Оружие игрока (пример для whip)
    if (player.weapon === "whip") {
      ctx.strokeStyle = "rgba(255, 200, 100, 0.7)";
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.attackRange, player.attackAngle - 0.5, player.attackAngle + 0.5);
      ctx.stroke();
    }
  }

  renderProjectiles(projectiles) {
    if (projectiles.length === 0) return;

    const ctx = this.ctx;

    // Группируем по типу для batch rendering
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();

    projectiles.forEach((proj) => {
      if (proj.isActive) {
        ctx.moveTo(proj.x + 3, proj.y);
        ctx.arc(proj.x, proj.y, 3, 0, Math.PI * 2);
      }
    });

    ctx.fill();
  }

  renderParticles(particles) {
    if (particles.length === 0) return;

    const ctx = this.ctx;

    // Для частиц используем один цвет
    ctx.fillStyle = "rgba(255, 100, 100, 0.7)";

    particles.forEach((particle) => {
      if (particle.life > 0) {
        ctx.globalAlpha = particle.life / particle.maxLife;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
      }
    });

    ctx.globalAlpha = 1.0;
  }

  // Метод для частичного обновления (если мало что изменилось)
  markDirty() {
    this.dirty = true;
  }
}

// Экспорт для использования в других файлах
if (typeof module !== "undefined" && module.exports) {
  module.exports = OptimizedRenderer;
}
