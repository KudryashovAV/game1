/**
 * Класс управления миром игры и комнатами.
 */
export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    // Размер комнаты значительно больше экрана
    this.roomBounds = { width: 2400, height: 1800 };
    this.doors = [];
    this.entrancePosition = { x: 0, y: 0 };
    this.allSymbols = ["@", "#", "$", "%"];
  }

  setupRoom() {
    this.doors = [];
    let usedSymbols = [...this.allSymbols].sort(() => Math.random() - 0.5);

    // 1. ВХОД (Правая стена, центр)
    const entrance = {
      side: "right",
      x: this.roomBounds.width,
      y: this.roomBounds.height / 2,
      symbol: "", // У входа нет символа
      hasSymbol: false,
    };
    this.doors.push(entrance);

    // Позиция игрока: центр круга перед дверью (внутри комнаты)
    this.entrancePosition = { x: entrance.x - 60, y: entrance.y };

    // 2. ВЫХОД (Левая стена, макс. удаление)
    // Располагаем по центру левой стены для максимальной дистанции
    this.doors.push({
      side: "left",
      x: 0,
      y: this.roomBounds.height / 2,
      symbol: usedSymbols.pop(),
      hasSymbol: true,
    });

    // Можно добавить еще двери на верх/низ по желанию в будущем
  }

  drawRoom() {
    const ctx = this.ctx;

    // Рисуем пол комнаты (лазурный)
    ctx.fillStyle = "azure";
    ctx.fillRect(0, 0, this.roomBounds.width, this.roomBounds.height);

    // Рисуем стены (черная рамка)
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 15;
    ctx.strokeRect(0, 0, this.roomBounds.width, this.roomBounds.height);

    // Отрисовка дверей
    this.doors.forEach((door) => {
      this.drawDoor(door);
    });
  }

  drawDoor(door) {
    const ctx = this.ctx;
    const doorW = 20;
    const doorH = 60;

    // 1. Зеленый прямоугольник (сама дверь)
    ctx.fillStyle = "green";
    let drawX = door.x;
    let drawY = door.y - doorH / 2;

    // Корректировка отрисовки, чтобы дверь была "встроена" в стену
    if (door.side === "right") drawX -= doorW;

    ctx.fillRect(drawX, drawY, doorW, doorH);

    // 2. Круг перед дверью (диаметр в 2 раза больше игрока 20*2 = 40, значит радиус 20)
    ctx.beginPath();
    let circleX = door.side === "right" ? door.x - 60 : door.side === "left" ? door.x + 60 : door.x;
    let circleY = door.y;

    ctx.arc(circleX, circleY, 20, 0, Math.PI * 2);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3. Символ внутри круга
    if (door.hasSymbol) {
      ctx.fillStyle = "black";
      ctx.font = "bold 24px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(door.symbol, circleX, circleY);
    }
  }
}
