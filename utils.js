const bcrypt = require("bcrypt");

function genPassword(password) {
  return bcrypt.hash(password, 10);
}

function rollRarity(rarities) {
  const totalChance = rarities.reduce((sum, rarity) => sum + rarity.chance, 0);
  const roll = Math.random() * totalChance;

  let accumulatedChance = 0;
  for (const rarity of rarities) {
    accumulatedChance += rarity.chance;
    if (roll < accumulatedChance) {
      return rarity;
    }
  }

  // This line should never be reached, but it's here as a fallback.
  return rarities[0];
}

module.exports = { genPassword, rollRarity };
