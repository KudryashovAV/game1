// PowerUp.js
class PowerUpSystem {
  constructor() {
    this.availablePowerUps = [
      { id: "whip", name: "Whip", level: 0, maxLevel: 8 },
      { id: "magic_wand", name: "Magic Wand", level: 0, maxLevel: 8 },
      { id: "knife", name: "Knife", level: 0, maxLevel: 8 },
      { id: "attractorb", name: "Attractorb", level: 0, maxLevel: 5 },
      { id: "armor", name: "Armor", level: 0, maxLevel: 5 },
      { id: "empty_tome", name: "Empty Tome", level: 0, maxLevel: 5 },
    ];

    this.evolutions = {
      whip: {
        requires: ["hollow_heart"],
        evolvesTo: "bloody_tear",
      },
    };
  }

  levelUp(powerUpId) {
    const powerUp = this.availablePowerUps.find((p) => p.id === powerUpId);

    if (powerUp && powerUp.level < powerUp.maxLevel) {
      powerUp.level++;

      // Применяем эффект
      this.applyEffect(powerUpId, powerUp.level);

      // Проверяем эволюцию
      this.checkEvolution(powerUpId);

      return true;
    }
    return false;
  }

  applyEffect(powerUpId, level) {
    const effects = {
      whip: (lvl) => ({ damage: 10 + lvl * 2, range: 100 + lvl * 10 }),
      attractorb: (lvl) => ({ magnetRange: 100 + lvl * 50 }),
      empty_tome: (lvl) => ({ cooldownReduction: 0.1 * lvl }),
    };

    return effects[powerUpId]?.(level) || {};
  }
}
