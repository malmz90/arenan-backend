# Combat System Documentation

## Overview

A turn-based combat system where characters fight each other using their stats and equipped items. Combat is calculated based on character attributes (strength, vitality, dexterity) and equipment bonuses.

## Version 1.0 Features

### ✅ What's Implemented

#### 1. **Stat Calculation System**

- Characters have base stats: `strength`, `vitality`, `dexterity`
- Equipment provides bonus stats through affixes
- Calculated stats include:
  - **HP (Health Points)**: `100 + (vitality × 10) + bonusHP`
  - **Damage**: `(strength × 2) + dexterity + weaponDamage + bonusDamage`
  - **Defense**: `(vitality × 0.5) + bonusDefense`

#### 2. **Combat Mechanics**

- Turn-based combat with alternating attacks
- Damage calculation includes:
  - Base damage from attacker
  - Defense reduction: `damage - (defense × 0.5)`
  - Random variance: ±10% for unpredictability
  - Minimum damage: always at least 1
- Combat continues until one character reaches 0 HP

#### 3. **Equipment Integration**

- Weapon damage from `main_hand` slot
- All equipment affixes are counted (damage, defense, hp, strength, vitality, dexterity)
- Affixes supported:
  - `strength`, `vitality`, `dexterity` (stat bonuses)
  - `damage`, `defense`, `hp` (direct combat bonuses)

#### 4. **Reward System**

- Winner receives:
  - **Experience**: `opponentLevel × 50`
  - **Gold**: `opponentLevel × 10`
- Rewards automatically added to character

---

## API Endpoints

### 1. Get Character Stats

**GET** `/character/stats`

- Requires authentication
- Returns character's calculated combat stats including equipment bonuses

**Response Example:**

```json
{
  "character": {
    "id": 1,
    "name": "Warrior Bob",
    "level": 5,
    "experience": 250,
    "gold": 150
  },
  "stats": {
    "strength": 15,
    "vitality": 20,
    "dexterity": 10,
    "bonusDamage": 5,
    "bonusDefense": 3,
    "bonusHP": 10,
    "weaponMinDamage": 10,
    "weaponMaxDamage": 20,
    "maxHP": 310,
    "damage": 50,
    "defense": 13
  }
}
```

### 2. Get All Characters

**GET** `/character/all`

- Public endpoint (no auth required)
- Lists all characters sorted by level
- Use this to find opponents

**Response Example:**

```json
[
  {
    "id": 1,
    "name": "Warrior Bob",
    "level": 5,
    "experience": 250,
    "strength": 15,
    "vitality": 20,
    "dexterity": 10,
    "gold": 150,
    "class_name": "Warrior"
  }
]
```

### 3. Fight!

**POST** `/combat/fight`

- Requires authentication
- Simulates entire combat from start to finish
- Returns complete battle log and results

**Request Body:**

```json
{
  "opponentCharacterId": 2
}
```

**Response Example:**

```json
{
  "combat": {
    "attacker": {
      "id": 1,
      "name": "Warrior Bob",
      "currentHP": 45,
      "maxHP": 310
    },
    "opponent": {
      "id": 2,
      "name": "Rogue Jane",
      "currentHP": 0,
      "maxHP": 250
    },
    "turn": 6,
    "log": [
      "Turn 1: Warrior Bob attacks for 47 damage! (Rogue Jane: 203/250 HP)",
      "Rogue Jane counter-attacks for 30 damage! (Warrior Bob: 280/310 HP)",
      "Turn 2: Warrior Bob attacks for 51 damage! (Rogue Jane: 152/250 HP)",
      "Rogue Jane counter-attacks for 32 damage! (Warrior Bob: 248/310 HP)",
      "...",
      "Warrior Bob wins!",
      "Warrior Bob gained 200 experience and 40 gold!"
    ],
    "winner": {
      "id": 1,
      "name": "Warrior Bob"
    },
    "finished": true
  },
  "rewards": {
    "experience": 200,
    "gold": 40
  }
}
```

---

## Combat Flow Example

### Fight an Opponent

```javascript
// One request does everything - fight runs until someone wins!
POST /combat/fight
{ "opponentCharacterId": 2 }

// Returns complete combat result with full battle log
```

---

## What's Missing / Future Enhancements

### 🔄 Potential Improvements

#### 1. **Skills & Abilities**

- Currently only basic attacks
- Could add special abilities based on character class
- Cooldown system for powerful abilities
- Mana/energy system

#### 2. **Combat History**

- Currently combat results are not saved
- Could add database table to track combat history
- View past battle logs
- Combat statistics and win/loss records

#### 3. **PvE (Player vs Environment)**

- Currently only supports PvP (player vs player)
- Could add monster combat using the `monsters` table
- Random monster encounters
- Boss battles

#### 4. **Critical Hits & Dodge**

- Add chance for critical damage (dexterity-based)
- Add dodge chance (dexterity-based)
- More combat variety

#### 5. **Status Effects**

- Poison, stun, buffs, debuffs
- Duration-based effects
- Equipment/skills that apply status effects

#### 6. **Combat Balance**

- Stat scaling may need adjustment
- Defense formula could be tweaked
- Weapon damage scaling

#### 7. **Arena/Matchmaking**

- Level-based matchmaking
- Ranking system
- Combat seasons/leaderboards

#### 8. **Death Penalties**

- Currently no penalty for losing
- Could add gold loss, equipment damage, etc.

#### 9. **Combat Animations/Effects**

- More detailed combat descriptions
- Add flavor text based on damage amount
- Character/class-specific attack descriptions

#### 10. **Item Durability**

- Equipment wear from combat
- Repair system

---

## Database Considerations

### Current Schema - No Changes Needed ✅

The existing database schema supports combat without modifications:

- Characters have all necessary base stats
- Equipment system is fully functional
- Affixes provide combat bonuses

### Optional Future Tables

If adding persistence features:

```sql
-- Track active combats
CREATE TABLE active_combats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  character1_id INT,
  character2_id INT,
  combat_state JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (character1_id) REFERENCES characters(id),
  FOREIGN KEY (character2_id) REFERENCES characters(id)
);

-- Combat history
CREATE TABLE combat_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  winner_id INT,
  loser_id INT,
  turns INT,
  experience_gained INT,
  gold_gained INT,
  combat_log TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (winner_id) REFERENCES characters(id),
  FOREIGN KEY (loser_id) REFERENCES characters(id)
);
```

---

## Testing the Combat System

### Prerequisites

1. Create at least 2 characters
2. Equip some items with damage/defense affixes
3. Have some base stats (strength, vitality, dexterity)

### Test Sequence

1. **Check your character stats**

   ```
   GET /character/stats
   ```

2. **Find an opponent**

   ```
   GET /character/all
   ```

3. **Fight an opponent**

   ```
   POST /combat/fight
   { "opponentCharacterId": 2 }
   ```

### Expected Behavior

- Characters with higher stats should win more often
- Better equipment should give significant advantage
- Combat should be deterministic (same stats = predictable outcome, with slight variance)
- Winner always receives exp and gold
- Minimum 1 damage per hit

---

## Formula Reference

```javascript
// Max HP
maxHP = 100 + (vitality × 10) + bonusHP

// Damage Output
damage = (strength × 2) + dexterity + weaponDamage + bonusDamage

// Defense
defense = (vitality × 0.5) + bonusDefense

// Actual Damage Dealt
actualDamage = attackerDamage - (defenderDefense × 0.5)
finalDamage = actualDamage × randomFactor(0.9 to 1.1)
finalDamage = max(1, finalDamage) // Minimum 1

// Rewards (for winner only)
experienceGained = opponentLevel × 50
goldGained = opponentLevel × 10
```

---

## Summary

✅ **Ready to Use:**

- Automatic turn-based combat
- Stat calculations with equipment
- Simple one-endpoint combat system
- Reward system
- Complete API

🎯 **Keep it Simple:**
This v1 focuses on core combat mechanics. You can now:

1. Fight other characters
2. Use equipment effectively
3. Gain rewards from victories
4. Test different character builds

🚀 **Next Steps:**

- Test the combat system
- Balance the formulas if needed
- Add features from the "Future Enhancements" list
- Consider PvE combat with monsters
- Add skills/abilities system

The foundation is solid and ready to build upon! 🎮
