export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.roomBounds = { width: 2400, height: 1800 };
    this.doors = [];
    this.entrancePosition = { x: 0, y: 0 };
    this.allSymbols = ["@", "#", "$", "%"];
    this.currentRoom = 1;
  }

  setupRoom() {
    this.doors = [];
    let usedSymbols = [...this.allSymbols].sort(() => Math.random() - 0.5);

    // Вход (справа)
    const entrance = {
      side: "right",
      x: this.roomBounds.width,
      y: this.roomBounds.height / 2,
      symbol: "",
      hasSymbol: false,
      // Координаты центра круга для проверки коллизий
      circleX: this.roomBounds.width - 60,
      circleY: this.roomBounds.height / 2,
    };
    this.doors.push(entrance);
    this.entrancePosition = { x: entrance.circleX, y: entrance.circleY };

    // Выход (слева)
    this.doors.push({
      side: "left",
      x: 0,
      y: this.roomBounds.height / 2,
      symbol: usedSymbols[0],
      hasSymbol: true,
      circleX: 60,
      circleY: this.roomBounds.height / 2,
    });
  }

  nextLevel() {
    this.currentRoom++;
    this.setupRoom();
    document.getElementById("room-display").innerText = `Комната: ${this.currentRoom}/5`;
  }

  // Проверка: коснулся ли игрок двери или центра круга
  checkDoorCollision(player) {
    for (let door of this.doors) {
      // Проверяем только двери, которые являются выходами (с символами)
      if (!door.hasSymbol) continue;

      // 1. Проверка касания центра круга (дистанция между точками)
      const dist = Math.sqrt((player.x - door.circleX) ** 2 + (player.y - door.circleY) ** 2);
      if (dist < 15) return door; // Если игрок почти в центре круга

      // 2. Проверка касания прямоугольника двери
      const doorW = 20;
      const doorH = 60;
      const doorRect = {
        x: door.side === "left" ? 0 : door.x - doorW,
        y: door.y - doorH / 2,
        w: doorW,
        h: doorH,
      };

      if (
        player.x + player.size / 2 > doorRect.x &&
        player.x - player.size / 2 < doorRect.x + doorRect.w &&
        player.y + player.size / 2 > doorRect.y &&
        player.y - player.size / 2 < doorRect.y + doorRect.h
      ) {
        return door;
      }
    }
    return null;
  }

  drawRoom() {
    const ctx = this.ctx;
    ctx.fillStyle = "azure";
    ctx.fillRect(0, 0, this.roomBounds.width, this.roomBounds.height);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 15;
    ctx.strokeRect(0, 0, this.roomBounds.width, this.roomBounds.height);

    this.doors.forEach((door) => this.drawDoor(door));
  }

  drawDoor(door) {
    const ctx = this.ctx;
    const doorW = 20;
    const doorH = 60;

    ctx.fillStyle = "green";
    let drawX = door.side === "right" ? door.x - doorW : door.x;
    ctx.fillRect(drawX, door.y - doorH / 2, doorW, doorH);

    ctx.beginPath();
    ctx.arc(door.circleX, door.circleY, 20, 0, Math.PI * 2);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (door.hasSymbol) {
      ctx.fillStyle = "black";
      ctx.font = "bold 24px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(door.symbol, door.circleX, door.circleY);
    }
  }
}
