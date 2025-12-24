// js/GameEngine.js
// В начале файла импортируем оптимизатор
// import { OptimizedRenderer } from './OptimizedRenderer.js'; // Если используем ES6 modules

class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;

    // ⭐ СОЗДАЁМ ОПТИМИЗИРОВАННЫЙ РЕНДЕРЕР
    this.renderer = new OptimizedRenderer(canvas, canvas.width, canvas.height);

    this.gameState = {
      player: null,
      enemies: [],
      projectiles: [],
      particles: [],
      experienceOrbs: [],
      ui: {},
    };

    this.lastTime = 0;
    this.deltaTime = 0;
    this.isRunning = false;

    // Инициализация других систем
    this.enemyManager = new EnemyManager();
    this.collisionSystem = new CollisionSystem();
    this.uiManager = new UIManager();
  }

  update(deltaTime) {
    // Обновляем все системы
    this.updatePlayer(deltaTime);
    this.enemyManager.update(deltaTime, this.gameState.player);
    this.updateProjectiles(deltaTime);
    this.updateParticles(deltaTime);

    // Проверяем коллизии
    this.collisionSystem.checkAll(this.gameState.player, this.gameState.enemies, this.gameState.projectiles);

    // Обновляем UI
    this.gameState.ui = this.uiManager.getUIState();
  }

  render() {
    // ⭐ ИСПОЛЬЗУЕМ ОПТИМИЗИРОВАННЫЙ РЕНДЕРЕР
    this.renderer.render(this.gameState);
  }

  gameLoop(currentTime) {
    if (!this.isRunning) return;

    this.deltaTime = (currentTime - this.lastTime) / 1000; // в секундах
    this.lastTime = currentTime;

    // Фиксированный временной шаг для стабильности физики
    const fixedDelta = 1 / 60; // 60 FPS

    this.update(fixedDelta);
    this.render();

    requestAnimationFrame(this.gameLoop.bind(this));
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  stop() {
    this.isRunning = false;
  }
}
