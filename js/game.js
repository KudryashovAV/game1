export class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    // Комната больше экрана: 2000x2000 пикселей
    this.roomBounds = { width: 2000, height: 2000 };
    this.doors = [];
    this.entrancePosition = { x: 0, y: 0 };
    this.symbols = ["@", "#", "$", "%"];
  }

  setupRoom() {
    this.doors = [];
    const doorSize = 40; // Размер прямоугольника двери
    const playerSize = 20; // 5мм в пикселях
    const circleRadius = playerSize; // Диаметр в 2 раза больше фигурки (радиус = размеру)

    // 1. Входная дверь (Правая стена, центр)
    const entrance = {
      side: "right",
      x: this.roomBounds.width - 10,
      y: this.roomBounds.height / 2,
      hasSymbol: false,
      symbol: "",
    };
    this.doors.push(entrance);
    // Точка появления игрока: центр круга перед дверью
    this.entrancePosition = { x: entrance.x - 40, y: entrance.y };

    // 2. Генерация выходных дверей (от 1 до 3 дополнительных)
    const availableSides = ["left", "top", "bottom"];
    const numExits = 1; // Для первого этапа сделаем минимум 2 двери (Вход + 1 Выход)

    // Перемешиваем символы
    let currentSymbols = [...this.symbols].sort(() => Math.random() - 0.5);

    availableSides.forEach((side, index) => {
      // Если это левая сторона (макс. удаление от правой), создаем дверь обязательно
      if (side === "left") {
        this.doors.push({
          side: "left",
          x: 10,
          y: this.roomBounds.height / 2,
          hasSymbol: true,
          symbol: currentSymbols.pop(),
        });
      }
    });
  }

  drawRoom() {
    const ctx = this.ctx;

    // Рисуем границы комнаты (стены)
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 10;
    ctx.strokeRect(0, 0, this.roomBounds.width, this.roomBounds.height);

    // Рисуем двери
    this.doors.forEach((door) => {
      // Зеленый прямоугольник (дверь)
      ctx.fillStyle = "green";
      ctx.fillRect(door.x - 10, door.y - 25, 20, 50);

      // Круг перед дверью
      ctx.beginPath();
      const circleX = door.side === "right" ? door.x - 40 : door.side === "left" ? door.x + 40 : door.x;
      const circleY = door.side === "top" ? door.y + 40 : door.side === "bottom" ? door.y - 40 : door.y;

      ctx.arc(circleX, circleY, 20, 0, Math.PI * 2);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Символ внутри круга
      if (door.hasSymbol) {
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(door.symbol, circleX, circleY);
      }
    });
  }
}
