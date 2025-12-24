// ===================== КОНСТАНТЫ И ПЕРЕМЕННЫЕ =====================
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const levelUpScreen = document.getElementById("levelUpScreen");
const roomTransitionScreen = document.getElementById("roomTransitionScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const abilityChoices = document.getElementById("abilityChoices");
const doorChoices = document.getElementById("doorChoices");
const timerText = document.getElementById("timerText");
const healthDisplay = document.getElementById("health");
const levelDisplay = document.getElementById("level");
const roomDisplay = document.getElementById("room");
const enemiesDisplay = document.getElementById("enemies");
const roomTimerDisplay = document.getElementById("roomTimer");
const abilitiesList = document.getElementById("abilitiesList");
const finalRoomDisplay = document.getElementById("finalRoom");
const finalLevelDisplay = document.getElementById("finalLevel");

// Размеры
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Состояние игры
let gameState = {
  player: null,
  enemies: [],
  experienceOrbs: [],
  projectiles: [],
  particles: [],
  currentRoom: 1,
  totalRooms: 5,
  roomCleared: false,
  roomTimer: 5,
  roomTimerActive: false,
  playerLevel: 1,
  maxLevel: 5,
  experience: 0,
  nextLevelExp: 100,
  abilities: [],
  availableAbilities: [],
  selectedWeapon: "A",
  gameOver: false,
  currentRoomObj: null,
};

// Управление
const keys = {};

// ===================== ОПРЕДЕЛЕНИЕ СПОСОБНОСТЕЙ =====================
const abilities = {
  1: { name: "Ability 1", weapon: "A", desc: "Basic attack - Whip" },
  2: { name: "Ability 2", weapon: "B", desc: "Magic Wand - Fires magic missiles" },
  3: { name: "Ability 3", weapon: "C", desc: "Knife Thrower - Rapid fire knives" },
  4: { name: "Ability 4", weapon: "D", desc: "Fire Wand - Sets enemies on fire" },
  5: { name: "Ability 5", weapon: "E", desc: "Lightning Rod - Chain lightning" },
  6: { name: "Ability 6", weapon: "F", desc: "Holy Water - Area damage" },
  7: { name: "Ability 7", weapon: "G", desc: "Runetracer - Bouncing projectiles" },
  8: { name: "Ability 8", weapon: "H", desc: "Axe Thrower - High damage, slow" },
  9: { name: "Ability 9", weapon: "I", desc: "Cross - Rotating shield" },
  10: { name: "Ability 10", weapon: "J", desc: "King Bible - Orbiting books" },
  11: { name: "Ability 11", weapon: "K", desc: "Garlic - Damage aura" },
  12: { name: "Ability 12", weapon: "L", desc: "Santa Water - Rain of fire" },
  13: { name: "Ability 13", weapon: "M", desc: "Song of Mana - Sound waves" },
  14: { name: "Ability 14", weapon: "N", desc: "Shadow Pin - Piercing attacks" },
  15: { name: "Ability 15", weapon: "O", desc: "Heaven Sword - Divine smite" },
};

const weapons = {
  A: { damage: 10, speed: 1, range: 100, color: "#ff5555", type: "whip" },
  B: { damage: 8, speed: 1.5, range: 150, color: "#5555ff", type: "wand" },
  C: { damage: 5, speed: 3, range: 120, color: "#ffff55", type: "knife" },
  D: { damage: 12, speed: 0.8, range: 130, color: "#ff8800", type: "fire" },
  E: { damage: 15, speed: 2, range: 140, color: "#00ffff", type: "lightning" },
  F: { damage: 20, speed: 0.5, range: 80, color: "#ff00ff", type: "area" },
  G: { damage: 7, speed: 2, range: 200, color: "#55ff55", type: "bounce" },
  H: { damage: 25, speed: 0.7, range: 110, color: "#aa5500", type: "axe" },
  I: { damage: 6, speed: 2, range: 60, color: "#ffffff", type: "shield" },
  J: { damage: 4, speed: 2, range: 70, color: "#ffaa00", type: "orbit" },
  K: { damage: 3, speed: 1, range: 50, color: "#00aa00", type: "aura" },
  L: { damage: 10, speed: 1, range: 90, color: "#aa00aa", type: "rain" },
  M: { damage: 9, speed: 1.2, range: 140, color: "#ff55ff", type: "wave" },
  N: { damage: 8, speed: 2.5, range: 160, color: "#000000", type: "pierce" },
  O: { damage: 30, speed: 0.3, range: 180, color: "#ffff00", type: "divine" },
};

// ===================== КЛАССЫ ИГРЫ =====================
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 15;
    this.speed = 300;
    this.health = 5;
    this.maxHealth = 5;
    this.damage = 10;
    this.attackSpeed = 1;
    this.attackRange = 100;
    this.lastAttack = 0;
    this.weaponType = "A";
    this.color = "#ffffff";
    this.invincible = false;
    this.invincibleTimer = 0;
    this.collectRange = 100;
  }

  update(deltaTime, enemies) {
    // Движение
    this.handleMovement(deltaTime);

    // Автоатака
    this.autoAttack(enemies, deltaTime);

    // Таймер неуязвимости
    if (this.invincible) {
      this.invincibleTimer -= deltaTime;
      if (this.invincibleTimer <= 0) {
        this.invincible = false;
      }
    }

    // Ограничение в пределах комнаты
    this.x = Math.max(50, Math.min(canvas.width - 50, this.x));
    this.y = Math.max(50, Math.min(canvas.height - 50, this.y));
  }

  handleMovement(deltaTime) {
    let moveX = 0;
    let moveY = 0;

    if (keys["w"] || keys["ArrowUp"]) moveY -= 1;
    if (keys["s"] || keys["ArrowDown"]) moveY += 1;
    if (keys["a"] || keys["ArrowLeft"]) moveX -= 1;
    if (keys["d"] || keys["ArrowRight"]) moveX += 1;

    // Нормализация диагонального движения
    if (moveX !== 0 && moveY !== 0) {
      moveX *= 0.7071;
      moveY *= 0.7071;
    }

    this.x += moveX * this.speed * deltaTime;
    this.y += moveY * this.speed * deltaTime;
  }

  autoAttack(enemies, deltaTime) {
    const now = Date.now();
    const attackInterval = 1000 / this.attackSpeed;

    if (now - this.lastAttack > attackInterval) {
      const weapon = weapons[this.weaponType];

      switch (weapon.type) {
        case "whip":
          this.attackWhip(enemies);
          break;
        case "wand":
          this.attackWand(enemies);
          break;
        case "knife":
          this.attackKnife(enemies);
          break;
        case "fire":
          this.attackFire(enemies);
          break;
        case "lightning":
          this.attackLightning(enemies);
          break;
        default:
          this.attackBasic(enemies);
      }

      this.lastAttack = now;
    }
  }

  attackBasic(enemies) {
    enemies.forEach((enemy) => {
      const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y);
      if (dist < this.attackRange) {
        enemy.takeDamage(this.damage);
        createHitParticle(enemy.x, enemy.y);
      }
    });
  }

  attackWhip(enemies) {
    const angle = Math.random() * Math.PI * 2;
    const arcStart = angle - 0.5;
    const arcEnd = angle + 0.5;

    enemies.forEach((enemy) => {
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const dist = Math.hypot(dx, dy);
      const enemyAngle = Math.atan2(dy, dx);

      if (dist < this.attackRange && enemyAngle >= arcStart && enemyAngle <= arcEnd) {
        enemy.takeDamage(this.damage);
        createHitParticle(enemy.x, enemy.y);
      }
    });
  }

  attackWand(enemies) {
    const nearest = enemies.reduce(
      (nearest, enemy) => {
        const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y);
        return dist < nearest.dist ? { enemy, dist } : nearest;
      },
      { enemy: null, dist: Infinity }
    );

    if (nearest.enemy && nearest.dist < 500) {
      gameState.projectiles.push(
        new Projectile(this.x, this.y, nearest.enemy.x, nearest.enemy.y, this.damage, weapons[this.weaponType])
      );
    }
  }

  attackKnife(enemies) {
    for (let i = 0; i < 3; i++) {
      const angle = Math.random() * Math.PI * 2;
      const targetX = this.x + Math.cos(angle) * 500;
      const targetY = this.y + Math.sin(angle) * 500;

      gameState.projectiles.push(
        new Projectile(this.x, this.y, targetX, targetY, this.damage * 0.7, weapons[this.weaponType])
      );
    }
  }

  attackFire(enemies) {
    enemies.forEach((enemy) => {
      const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y);
      if (dist < this.attackRange) {
        enemy.takeDamage(this.damage);
        enemy.setFire(2);
        createFireParticle(enemy.x, enemy.y);
      }
    });
  }

  attackLightning(enemies) {
    if (enemies.length > 0) {
      const first = enemies[0];
      first.takeDamage(this.damage);
      createLightningParticle(this.x, this.y, first.x, first.y);

      // Цепная молния (3 цепочки)
      let current = first;
      for (let i = 0; i < 3 && i < enemies.length - 1; i++) {
        const next = enemies[i + 1];
        if (Math.hypot(current.x - next.x, current.y - next.y) < 150) {
          next.takeDamage(this.damage * 0.7);
          createLightningParticle(current.x, current.y, next.x, next.y);
          current = next;
        }
      }
    }
  }

  takeDamage(amount) {
    if (!this.invincible) {
      this.health -= amount;
      healthDisplay.textContent = this.health;

      // Мигание при получении урона
      this.invincible = true;
      this.invincibleTimer = 1;
      createDamageParticle(this.x, this.y);

      if (this.health <= 0) {
        gameOver();
      }
    }
  }

  draw(ctx) {
    // Тело игрока
    ctx.save();

    if (this.invincible) {
      ctx.globalAlpha = 0.5 + Math.sin(Date.now() / 100) * 0.3;
    }

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Оружие (визуализация)
    const weapon = weapons[this.weaponType];
    ctx.strokeStyle = weapon.color + "80";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.attackRange, 0, Math.PI * 2);
    ctx.stroke();

    // Полоска здоровья
    const healthWidth = (this.health / this.maxHealth) * (this.radius * 2);
    ctx.fillStyle = this.health > 2 ? "#00ff00" : "#ff0000";
    ctx.fillRect(this.x - this.radius, this.y - this.radius - 10, healthWidth, 3);

    // Радиус сбора опыта
    ctx.strokeStyle = "#0088ff40";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.collectRange, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}

class Enemy {
  constructor(x, y, type = "basic") {
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.health = 50;
    this.maxHealth = 50;
    this.speed = 100;
    this.damage = 1;
    this.color = "#ff4444";
    this.type = type;
    this.isOnFire = false;
    this.fireTimer = 0;

    // Разные типы врагов
    switch (type) {
      case "fast":
        this.radius = 8;
        this.health = 30;
        this.maxHealth = 30;
        this.speed = 180;
        this.color = "#ff8844";
        break;
      case "tank":
        this.radius = 15;
        this.health = 100;
        this.maxHealth = 100;
        this.speed = 60;
        this.color = "#ff44ff";
        break;
    }
  }

  update(deltaTime, player) {
    // Движение к игроку
    const dx = player.x - this.x;
    const dy = player.y - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 0) {
      this.x += (dx / dist) * this.speed * deltaTime;
      this.y += (dy / dist) * this.speed * deltaTime;
    }

    // Огонь
    if (this.isOnFire) {
      this.fireTimer -= deltaTime;
      this.health -= 5 * deltaTime;
      if (this.fireTimer <= 0) {
        this.isOnFire = false;
      }
    }

    // Коллизия с игроком
    if (dist < this.radius + player.radius) {
      player.takeDamage(this.damage);
      createDamageParticle(player.x, player.y);
    }

    return this.health > 0;
  }

  takeDamage(amount) {
    this.health -= amount;

    if (this.health <= 0) {
      // Спавн опыта при смерти
      gameState.experienceOrbs.push(new ExperienceOrb(this.x, this.y));
      createDeathParticle(this.x, this.y, this.color);
      return false; // Враг умер
    }

    createHitParticle(this.x, this.y);
    return true; // Враг жив
  }

  setFire(duration) {
    this.isOnFire = true;
    this.fireTimer = duration;
  }

  draw(ctx) {
    // Тело врага
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Полоска здоровья
    const healthWidth = (this.health / this.maxHealth) * (this.radius * 2);
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(this.x - this.radius, this.y - this.radius - 8, healthWidth, 2);

    // Эффект огня
    if (this.isOnFire) {
      ctx.fillStyle = `rgba(255, ${Math.random() * 128}, 0, 0.7)`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

class ExperienceOrb {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.color = "#0088ff";
    this.collected = false;
    this.floatTimer = Math.random() * Math.PI * 2;
  }

  update(deltaTime) {
    this.floatTimer += deltaTime;
    this.y += Math.sin(this.floatTimer * 3) * 0.5;

    // Проверка сбора игроком (игрок должен подойти)
    if (gameState.player && !this.collected) {
      const dx = this.x - gameState.player.x;
      const dy = this.y - gameState.player.y;
      const dist = Math.hypot(dx, dy);

      if (dist < gameState.player.collectRange) {
        // Притягивание к игроку
        const moveSpeed = 500;
        this.x -= (dx / dist) * moveSpeed * deltaTime;
        this.y -= (dy / dist) * moveSpeed * deltaTime;

        if (dist < this.radius + gameState.player.radius) {
          this.collect();
        }
      }
    }
  }

  collect() {
    if (!this.collected) {
      this.collected = true;
      gameState.experience += 25;
      createExperienceParticle(this.x, this.y);
      checkLevelUp();
    }
  }

  draw(ctx) {
    if (!this.collected) {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Свечение
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }
}

class Projectile {
  constructor(fromX, fromY, targetX, targetY, damage, weapon) {
    this.x = fromX;
    this.y = fromY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.damage = damage;
    this.speed = 500;
    this.radius = 4;
    this.color = weapon.color;
    this.type = weapon.type;
    this.lifetime = 3;

    // Направление
    const dx = targetX - fromX;
    const dy = targetY - fromY;
    const dist = Math.hypot(dx, dy);
    this.vx = (dx / dist) * this.speed;
    this.vy = (dy / dist) * this.speed;
  }

  update(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.lifetime -= deltaTime;

    // Проверка попадания
    for (let i = gameState.enemies.length - 1; i >= 0; i--) {
      const enemy = gameState.enemies[i];
      const dist = Math.hypot(this.x - enemy.x, this.y - enemy.y);

      if (dist < this.radius + enemy.radius) {
        enemy.takeDamage(this.damage);
        createHitParticle(enemy.x, enemy.y);
        return false; // Снаряд уничтожен
      }
    }

    // Проверка выхода за пределы
    if (
      this.x < -100 ||
      this.x > canvas.width + 100 ||
      this.y < -100 ||
      this.y > canvas.height + 100 ||
      this.lifetime <= 0
    ) {
      return false;
    }

    return true;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // След
    ctx.strokeStyle = this.color + "80";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x - this.vx * 0.1, this.y - this.vy * 0.1);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();
  }
}

// ===================== СИСТЕМА ЧАСТИЦ =====================
class Particle {
  constructor(x, y, color, size, velocityX, velocityY, lifetime = 1) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.vx = velocityX;
    this.vy = velocityY;
    this.lifetime = lifetime;
    this.maxLifetime = lifetime;
  }

  update(deltaTime) {
    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;
    this.lifetime -= deltaTime;
    this.vx *= 0.95;
    this.vy *= 0.95;
    return this.lifetime > 0;
  }

  draw(ctx) {
    const alpha = this.lifetime / this.maxLifetime;
    ctx.fillStyle = this.color.replace(")", `, ${alpha})`).replace("rgb", "rgba");
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function createHitParticle(x, y) {
  for (let i = 0; i < 5; i++) {
    gameState.particles.push(
      new Particle(
        x,
        y,
        "#ffff00",
        Math.random() * 3 + 1,
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        0.5
      )
    );
  }
}

function createDeathParticle(x, y, color) {
  for (let i = 0; i < 15; i++) {
    gameState.particles.push(
      new Particle(x, y, color, Math.random() * 4 + 2, (Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300, 1)
    );
  }
}

function createExperienceParticle(x, y) {
  for (let i = 0; i < 10; i++) {
    gameState.particles.push(
      new Particle(
        x,
        y,
        "#0088ff",
        Math.random() * 2 + 1,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        0.3
      )
    );
  }
}

function createDamageParticle(x, y) {
  for (let i = 0; i < 8; i++) {
    gameState.particles.push(
      new Particle(
        x,
        y,
        "#ff0000",
        Math.random() * 2 + 1,
        (Math.random() - 0.5) * 150,
        (Math.random() - 0.5) * 150,
        0.5
      )
    );
  }
}

function createFireParticle(x, y) {
  gameState.particles.push(
    new Particle(x, y, "#ff8800", Math.random() * 3 + 2, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, 1)
  );
}

function createLightningParticle(x1, y1, x2, y2) {
  const segments = 5;
  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 20;
    const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 20;

    gameState.particles.push(new Particle(x, y, "#00ffff", Math.random() * 2 + 1, 0, 0, 0.1));
  }
}

// ===================== СИСТЕМА КОМНАТ =====================
class Room {
  constructor(roomNumber, enteredFrom = null) {
    this.number = roomNumber;
    this.enemiesCount = calculateEnemiesForRoom(roomNumber);
    this.doors = generateDoorsForRoom(roomNumber);
    this.cleared = false;
    this.playerEnteredFrom = enteredFrom;
    this.enemies = [];
  }

  spawnEnemies() {
    this.enemies = [];

    for (let i = 0; i < this.enemiesCount; i++) {
      let x, y;
      let attempts = 0;

      do {
        x = Math.random() * (canvas.width - 100) + 50;
        y = Math.random() * (canvas.height - 100) + 50;
        attempts++;
      } while (Math.hypot(x - canvas.width / 2, y - canvas.height / 2) < 100 && attempts < 10);

      let type = "basic";
      const rand = Math.random();
      if (rand < 0.2) type = "fast";
      if (rand < 0.1) type = "tank";

      this.enemies.push(new Enemy(x, y, type));
    }

    gameState.enemies = [...this.enemies];
    enemiesDisplay.textContent = gameState.enemies.length;
  }

  update(deltaTime, player) {
    // Обновляем врагов
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (!this.enemies[i].update(deltaTime, player)) {
        this.enemies.splice(i, 1);
      }
    }

    // Синхронизируем с глобальным состоянием
    gameState.enemies = [...this.enemies];
    enemiesDisplay.textContent = gameState.enemies.length;

    // Проверка очистки комнаты
    if (this.enemies.length === 0 && !this.cleared) {
      this.cleared = true;
      gameState.roomCleared = true;
      gameState.roomTimer = 5;
      gameState.roomTimerActive = true;
      showRoomTransition();
    }
  }

  draw(ctx) {
    // Рисуем двери
    this.doors.forEach((door) => {
      ctx.fillStyle = door === this.playerEnteredFrom ? "#00ff00" : "#8a2be2";
      ctx.fillRect(door.x - 20, door.y - 10, 40, 20);

      // Текст направления
      ctx.fillStyle = "#ffffff";
      ctx.font = '12px "Press Start 2P"';
      ctx.textAlign = "center";
      ctx.fillText(door.direction, door.x, door.y - 15);
    });

    // Номер комнаты
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.font = '20px "Press Start 2P"';
    ctx.textAlign = "center";
    ctx.fillText(`ROOM ${this.number}`, canvas.width / 2, 30);

    // Количество врагов
    ctx.fillStyle = "#ff4444";
    ctx.font = '16px "Press Start 2P"';
    ctx.textAlign = "left";
    ctx.fillText(`ENEMIES: ${this.enemies.length}`, 20, canvas.height - 20);
  }
}

function calculateEnemiesForRoom(roomNumber) {
  const totalRooms = 5;
  const startEnemies = 5;
  const endEnemies = 100;

  // Линейное увеличение
  return Math.round(startEnemies + (endEnemies - startEnemies) * ((roomNumber - 1) / (totalRooms - 1)));
}

function generateDoorsForRoom(roomNumber) {
  const allDoors = [
    { x: canvas.width / 2, y: 30, direction: "UP", id: "up" },
    { x: canvas.width - 30, y: canvas.height / 2, direction: "RIGHT", id: "right" },
    { x: canvas.width / 2, y: canvas.height - 30, direction: "DOWN", id: "down" },
    { x: 30, y: canvas.height / 2, direction: "LEFT", id: "left" },
  ];

  let doors = [...allDoors];

  // Первая комната: 3 двери (случайные, но не все 4)
  if (roomNumber === 1) {
    doors = shuffleArray([...allDoors]).slice(0, 3);
  }
  // Последняя комната: 2 двери
  else if (roomNumber === 5) {
    doors = shuffleArray([...allDoors]).slice(0, 2);
  }
  // Средние комнаты: 3-4 двери
  else {
    doors = Math.random() > 0.5 ? [...allDoors] : shuffleArray([...allDoors]).slice(0, 3);
  }

  return doors;
}

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// ===================== ФУНКЦИИ ИГРЫ =====================
function checkLevelUp() {
  if (gameState.playerLevel >= gameState.maxLevel) return;

  if (gameState.experience >= gameState.nextLevelExp) {
    gameState.playerLevel++;
    gameState.experience -= gameState.nextLevelExp;
    gameState.nextLevelExp = Math.round(gameState.nextLevelExp * 1.5);

    levelDisplay.textContent = gameState.playerLevel;
    showLevelUpScreen();
  }
}

function showLevelUpScreen() {
  // Выбираем 3 случайные способности из оставшихся
  const allAbilityIds = Object.keys(abilities).map(Number);
  const availableIds = allAbilityIds.filter((id) => !gameState.abilities.includes(id));

  if (availableIds.length === 0) return;

  // Берем 3 случайные или все оставшиеся
  const selectedIds = shuffleArray([...availableIds]).slice(0, Math.min(3, availableIds.length));

  // Очищаем предыдущие варианты
  abilityChoices.innerHTML = "";

  // Создаем кнопки выбора
  selectedIds.forEach((id) => {
    const ability = abilities[id];
    const weapon = weapons[ability.weapon];

    const choiceDiv = document.createElement("div");
    choiceDiv.className = "choice";
    choiceDiv.innerHTML = `
            <h3>${ability.name} (${ability.weapon})</h3>
            <p>${ability.desc}</p>
            <p>Damage: ${weapon.damage} | Speed: ${weapon.speed} | Range: ${weapon.range}</p>
        `;

    choiceDiv.onclick = () => selectAbility(id);

    abilityChoices.appendChild(choiceDiv);
  });

  levelUpScreen.style.display = "block";
  gameState.availableAbilities = selectedIds;
}

function selectAbility(abilityId) {
  const ability = abilities[abilityId];

  // Добавляем способность
  gameState.abilities.push(abilityId);

  // Обновляем оружие игрока
  gameState.player.weaponType = ability.weapon;
  gameState.selectedWeapon = ability.weapon;

  // Обновляем панель способностей
  updateAbilitiesPanel();

  // Скрываем экран выбора
  levelUpScreen.style.display = "none";

  // Продолжаем игру
  gameLoop();
}

function updateAbilitiesPanel() {
  abilitiesList.innerHTML = "";

  gameState.abilities.forEach((abilityId) => {
    const ability = abilities[abilityId];
    const weapon = weapons[ability.weapon];

    const abilityDiv = document.createElement("div");
    abilityDiv.className = "ability-item";
    abilityDiv.innerHTML = `
            <strong>${ability.name}</strong> (${ability.weapon})<br>
            <small>${ability.desc}</small>
        `;

    abilitiesList.appendChild(abilityDiv);
  });
}

function showRoomTransition() {
  roomTransitionScreen.style.display = "block";
  updateDoorChoices();
  updateTimerText();
}

function updateDoorChoices() {
  doorChoices.innerHTML = "";

  if (gameState.currentRoomObj) {
    gameState.currentRoomObj.doors.forEach((door) => {
      if (door !== gameState.currentRoomObj.playerEnteredFrom) {
        const doorDiv = document.createElement("div");
        doorDiv.className = "choice";
        doorDiv.innerHTML = `
                    <h3>Go ${door.direction}</h3>
                    <p>Enter next room through this door</p>
                `;

        doorDiv.onclick = () => moveToNextRoom(door);

        doorChoices.appendChild(doorDiv);
      }
    });
  }
}

function updateTimerText() {
  timerText.textContent = `Leaving in: ${Math.ceil(gameState.roomTimer)}s`;
}

function moveToNextRoom(door) {
  // Переход в следующую комнату
  gameState.currentRoom++;

  if (gameState.currentRoom > gameState.totalRooms) {
    gameState.currentRoom = gameState.totalRooms;
  }

  // Создаем новую комнату
  gameState.currentRoomObj = new Room(gameState.currentRoom, door);
  gameState.currentRoomObj.spawnEnemies();

  // Размещаем игрока у двери
  gameState.player.x = door.x;
  gameState.player.y = door.y;

  // Сбрасываем состояние комнаты
  gameState.roomCleared = false;
  gameState.roomTimer = 5;
  gameState.roomTimerActive = false;

  // Обновляем отображение
  roomDisplay.textContent = `${gameState.currentRoom}/${gameState.totalRooms}`;

  // Скрываем экран перехода
  roomTransitionScreen.style.display = "none";

  // Продолжаем игру
  gameLoop();
}

function gameOver() {
  gameState.gameOver = true;
  finalRoomDisplay.textContent = gameState.currentRoom;
  finalLevelDisplay.textContent = gameState.playerLevel;
  gameOverScreen.style.display = "block";
}

function restartGame() {
  // Сбрасываем состояние
  gameState = {
    player: new Player(canvas.width / 2, canvas.height / 2),
    enemies: [],
    experienceOrbs: [],
    projectiles: [],
    particles: [],
    currentRoom: 1,
    totalRooms: 5,
    roomCleared: false,
    roomTimer: 5,
    roomTimerActive: false,
    playerLevel: 1,
    maxLevel: 5,
    experience: 0,
    nextLevelExp: 100,
    abilities: [],
    availableAbilities: [],
    selectedWeapon: "A",
    gameOver: false,
    currentRoomObj: null,
  };

  // Инициализируем первую комнату
  gameState.currentRoomObj = new Room(1);
  gameState.currentRoomObj.spawnEnemies();

  // Обновляем отображение
  healthDisplay.textContent = gameState.player.health;
  levelDisplay.textContent = gameState.playerLevel;
  roomDisplay.textContent = `1/${gameState.totalRooms}`;
  enemiesDisplay.textContent = gameState.enemies.length;
  roomTimerDisplay.textContent = "-";

  // Скрываем экраны
  levelUpScreen.style.display = "none";
  roomTransitionScreen.style.display = "none";
  gameOverScreen.style.display = "none";

  // Начинаем игру
  init();
}

// ===================== ОСНОВНЫЕ ФУНКЦИИ ИГРЫ =====================
function init() {
  // Инициализация игрока
  gameState.player = new Player(canvas.width / 2, canvas.height / 2);

  // Инициализация первой комнаты
  gameState.currentRoomObj = new Room(1);
  gameState.currentRoomObj.spawnEnemies();

  // Обновляем отображение
  healthDisplay.textContent = gameState.player.health;
  levelDisplay.textContent = gameState.playerLevel;
  roomDisplay.textContent = `${gameState.currentRoom}/${gameState.totalRooms}`;
  enemiesDisplay.textContent = gameState.enemies.length;

  // Слушатели событий клавиатуры
  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    keys[e.key.toLowerCase()] = true;
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
    keys[e.key.toLowerCase()] = false;
  });

  // Запуск игрового цикла
  gameLoop();
}

let lastTime = 0;
function gameLoop(currentTime = 0) {
  if (gameState.gameOver) return;

  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // Очистка канваса
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Фон комнаты
  drawRoomBackground();

  // Обновление комнаты
  if (gameState.currentRoomObj) {
    gameState.currentRoomObj.update(deltaTime, gameState.player);
    gameState.currentRoomObj.draw(ctx);
  }

  // Обновление игрока
  if (gameState.player) {
    gameState.player.update(deltaTime, gameState.enemies);
    gameState.player.draw(ctx);
  }

  // Обновление опыта
  for (let i = gameState.experienceOrbs.length - 1; i >= 0; i--) {
    gameState.experienceOrbs[i].update(deltaTime);
    if (gameState.experienceOrbs[i].collected) {
      gameState.experienceOrbs.splice(i, 1);
    } else {
      gameState.experienceOrbs[i].draw(ctx);
    }
  }

  // Обновление снарядов
  for (let i = gameState.projectiles.length - 1; i >= 0; i--) {
    if (!gameState.projectiles[i].update(deltaTime)) {
      gameState.projectiles.splice(i, 1);
    } else {
      gameState.projectiles[i].draw(ctx);
    }
  }

  // Обновление частиц
  for (let i = gameState.particles.length - 1; i >= 0; i--) {
    if (!gameState.particles[i].update(deltaTime)) {
      gameState.particles.splice(i, 1);
    } else {
      gameState.particles[i].draw(ctx);
    }
  }

  // Таймер комнаты (после очистки)
  if (gameState.roomTimerActive) {
    gameState.roomTimer -= deltaTime;
    roomTimerDisplay.textContent = Math.ceil(gameState.roomTimer);
    updateTimerText();

    if (gameState.roomTimer <= 0) {
      // Наносим урон игроку
      gameState.player.takeDamage(1 * deltaTime);
    }
  }

  // Продолжаем цикл
  requestAnimationFrame(gameLoop);
}

function drawRoomBackground() {
  // Градиентный фон
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#0a0a2a");
  gradient.addColorStop(1, "#000010");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Текстура пола (сетка)
  ctx.strokeStyle = "rgba(100, 100, 150, 0.1)";
  ctx.lineWidth = 1;

  // Вертикальные линии
  for (let x = 0; x < canvas.width; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }

  // Горизонтальные линии
  for (let y = 0; y < canvas.height; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

// ===================== ЗАПУСК ИГРЫ =====================
// Изменение размера канваса при изменении окна
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Если есть комната, перегенерируем двери
  if (gameState.currentRoomObj) {
    gameState.currentRoomObj.doors = generateDoorsForRoom(gameState.currentRoom);
  }
});

// Запуск игры при загрузке страницы
window.addEventListener("load", init);
