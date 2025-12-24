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

    // ВХОД (Всегда справа)
    const entrance = {
      side: "right",
      x: this.roomBounds.width,
      y: this.roomBounds.height / 2,
      symbol: "",
      hasSymbol: false,
      circleX: this.roomBounds.width - 60,
      circleY: this.roomBounds.height / 2,
      isExit: false,
    };
    this.doors.push(entrance);
    this.entrancePosition = { x: entrance.circleX, y: entrance.circleY };

    // ВЫХОД (Всегда слева для простоты этапа)
    const isFinalRoom = this.currentRoom === 5;
    this.doors.push({
      side: "left",
      x: 0,
      y: this.roomBounds.height / 2,
      symbol: isFinalRoom ? "" : usedSymbols[0],
      hasSymbol: !isFinalRoom, // В 5-й комнате нет символа и круга
      circleX: 60,
      circleY: this.roomBounds.height / 2,
      isExit: true,
      isFinal: isFinalRoom,
    });
  }

  nextLevel() {
    if (this.currentRoom < 5) {
      this.currentRoom++;
      this.setupRoom();
      document.getElementById("room-display").innerText = `Комната: ${this.currentRoom}/5`;
    }
  }

  checkDoorCollision(player) {
    for (let door of this.doors) {
      if (!door.isExit) continue;

      // Проверка касания круга (только если это не финал)
      if (!door.isFinal) {
        const dist = Math.sqrt((player.x - door.circleX) ** 2 + (player.y - door.circleY) ** 2);
        if (dist < 15) return door;
      }

      // Проверка касания прямоугольника двери
      const doorW = 20;
      const doorH = door.isFinal ? 120 : 60; // В два раза длиннее в финале
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
    const doorH = door.isFinal ? 120 : 60; // Удлиненная дверь

    // Цвет двери: красный в финале, зеленый обычно
    ctx.fillStyle = door.isFinal ? "red" : "green";

    let drawX = door.side === "right" ? door.x - doorW : door.x;
    ctx.fillRect(drawX, door.y - doorH / 2, doorW, doorH);

    // Рисуем круг и символ, только если это не финальная дверь и не вход
    if (door.hasSymbol && !door.isFinal) {
      ctx.beginPath();
      ctx.arc(door.circleX, door.circleY, 20, 0, Math.PI * 2);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "black";
      ctx.font = "bold 24px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(door.symbol, door.circleX, door.circleY);
    }
  }
}
