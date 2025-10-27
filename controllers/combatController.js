const db = require("../config/db");
const { getCharacterStats, calculateDamage } = require("../utils");

/**
 * Execute combat between two characters
 * Runs automatically until one character is defeated
 */
const fight = async (req, res) => {
  const userId = req.jwt.id;
  const { opponentCharacterId } = req.body;

  try {
    // Get attacker's character
    const attackerChars = await db.query(
      "SELECT * FROM characters WHERE user_id = ?",
      [userId]
    );
    if (attackerChars.length === 0) {
      return res.status(404).json({ message: "Your character not found" });
    }

    // Get opponent character
    const opponentChars = await db.query(
      "SELECT * FROM characters WHERE id = ?",
      [opponentCharacterId]
    );
    if (opponentChars.length === 0) {
      return res.status(404).json({ message: "Opponent character not found" });
    }

    const attacker = attackerChars[0];
    const opponent = opponentChars[0];

    // Calculate stats for both characters
    const attackerStats = await getCharacterStats(attacker.id);
    const opponentStats = await getCharacterStats(opponent.id);

    // Initialize combat state
    let combatState = {
      attacker: {
        id: attacker.id,
        name: attacker.name,
        level: attacker.level,
        maxHP: attackerStats.maxHP,
        currentHP: attackerStats.maxHP,
        damage: attackerStats.damage,
        defense: attackerStats.defense,
        maxRounds: attacker.max_rounds || 0,
        currentRounds: attacker.current_rounds || 0,
      },
      opponent: {
        id: opponent.id,
        name: opponent.name,
        level: opponent.level,
        maxHP: opponentStats.maxHP,
        currentHP: opponentStats.maxHP,
        damage: opponentStats.damage,
        defense: opponentStats.defense,
        maxRounds: opponent.max_rounds || 0,
        currentRounds: opponent.current_rounds || 0,
      },
      turn: 1,
      log: [],
      winner: null,
      finished: false,
    };

    // Simulate combat until one character is defeated or attacker runs out of rounds
    while (!combatState.finished) {
      // Check rounds for attacker (player). If no rounds, attacker loses
      if ((combatState.attacker.currentRounds || 0) <= 0) {
        combatState.finished = true;
        combatState.winner = combatState.opponent;
        combatState.log.push(
          `${combatState.attacker.name} has no rounds left and loses!`
        );
        break;
      }

      // Consume 1 round from attacker at the start of each round
      combatState.attacker.currentRounds = Math.max(
        0,
        (combatState.attacker.currentRounds || 0) - 1
      );

      // Attacker attacks
      const attackerDamage = calculateDamage(
        combatState.attacker.damage,
        combatState.opponent.defense
      );
      combatState.opponent.currentHP = Math.max(
        0,
        combatState.opponent.currentHP - attackerDamage
      );
      combatState.log.push(
        `Turn ${combatState.turn}: ${combatState.attacker.name} attacks for ${attackerDamage} damage! (${combatState.opponent.name}: ${combatState.opponent.currentHP}/${combatState.opponent.maxHP} HP)`
      );

      if (combatState.opponent.currentHP <= 0) {
        combatState.finished = true;
        combatState.winner = combatState.attacker;
        combatState.log.push(`${combatState.attacker.name} wins!`);
        break;
      }

      // Opponent counter-attacks
      const opponentDamage = calculateDamage(
        combatState.opponent.damage,
        combatState.attacker.defense
      );
      combatState.attacker.currentHP = Math.max(
        0,
        combatState.attacker.currentHP - opponentDamage
      );
      combatState.log.push(
        `${combatState.opponent.name} counter-attacks for ${opponentDamage} damage! (${combatState.attacker.name}: ${combatState.attacker.currentHP}/${combatState.attacker.maxHP} HP)`
      );

      if (combatState.attacker.currentHP <= 0) {
        combatState.finished = true;
        combatState.winner = combatState.opponent;
        combatState.log.push(`${combatState.opponent.name} wins!`);
        break;
      }

      combatState.turn++;
    }

    // Award experience and gold if player won
    let rewards = null;
    if (combatState.winner && combatState.winner.id === attacker.id) {
      const expGained = Math.floor(opponent.level * 50);
      const goldGained = Math.floor(opponent.level * 10);

      await db.query(
        "UPDATE characters SET experience = experience + ?, gold = gold + ? WHERE id = ?",
        [expGained, goldGained, attacker.id]
      );

      rewards = { experience: expGained, gold: goldGained };
      combatState.log.push(
        `${attacker.name} gained ${expGained} experience and ${goldGained} gold!`
      );
    }

    // Persist remaining rounds for attacker
    try {
      await db.query("UPDATE characters SET current_rounds = ? WHERE id = ?", [
        combatState.attacker.currentRounds || 0,
        attacker.id,
      ]);
    } catch (e) {
      // Non-fatal if this update fails; combat result still returns
      console.error("Failed to persist current_rounds:", e);
    }

    res.json({
      combat: combatState,
      rewards,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      message: "Something went wrong during auto-combat",
    });
  }
};

module.exports = {
  fight,
};
