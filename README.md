# Arenan Backend

A text-based fantasy game backend with character management, equipment system, item generation, and turn-based combat.

## Features

### ✅ Implemented Systems

- **User Authentication** - Login/Register with JWT tokens
- **Character Management** - Create and manage fantasy characters with stats
- **Item System** - Dynamic item generation with rarities and affixes
- **Equipment System** - Equip items to character slots (head, chest, legs, weapons, jewelry)
- **Inventory Management** - Store and manage character items
- **Market System** - Buy/sell items between characters
- **Combat System** ⚔️ - Turn-based PvP combat with stat calculations

## Quick Start

### Prerequisites

- Node.js
- MariaDB/MySQL
- `.env` file with:
  ```
  PORT=4000
  ACCES_TOKEN_SECRET=your_secret_here
  DB_HOST=localhost
  DB_USER=your_db_user
  DB_PASSWORD=your_db_password
  DB_NAME=arenan_db
  ```

### Installation

```bash
npm install
```

### Database Setup

Run the SQL script to create the database:

```bash
# Import the database schema
mysql -u root -p < config/Arenandb.sql
```

### Running the Server

```bash
npm start
```

Server will run on `http://localhost:4000` (or your configured PORT)

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user (returns JWT cookie)
- `POST /auth/logout` - Logout user

### Characters

- `POST /character/create` - Create new character
- `GET /character/all` - Get all characters (public)
- `GET /character/stats` - Get your character's calculated stats
- `GET /character/equipment` - Get equipped items
- `GET /character/inventory` - Get inventory items
- `POST /character/equip` - Equip an item
- `POST /character/unequip` - Unequip an item

### Items

- `GET /item` - Get all base items
- `POST /item/generate` - Generate random item with affixes

### Market

- `POST /market/list` - List item for sale
- `GET /market` - Get all market listings
- `POST /market/buy` - Purchase item from market

### Combat ⚔️

- `POST /combat/fight` - Fight opponent (runs until someone wins)

## Combat System

The combat system features turn-based battles between characters. See **[COMBAT_SYSTEM.md](./COMBAT_SYSTEM.md)** for detailed documentation.

### Quick Combat Overview

**Stats Calculation:**

- HP = `100 + (vitality × 10) + bonusHP`
- Damage = `(strength × 2) + dexterity + weaponDamage + bonusDamage`
- Defense = `(vitality × 0.5) + bonusDefense`

**Combat Flow:**

1. Characters alternate attacks each turn
2. Damage is reduced by defender's defense
3. Battle continues until one character reaches 0 HP
4. Winner receives experience and gold

**Testing Combat:**

```bash
POST /combat/fight
{ "opponentCharacterId": 2 }
# Battle runs automatically until someone wins!
```

## Project Structure

```
arenan-backend/
├── config/
│   ├── Arenandb.sql      # Database schema
│   ├── db.js             # Database connection
│   └── itemRarities.js   # Item rarity definitions
├── controllers/
│   ├── authController.js
│   ├── characterController.js
│   ├── itemController.js
│   ├── marketController.js
│   └── combatController.js  ⚔️
├── middleware/
│   └── auth.js           # JWT authentication
├── routes/
│   ├── authRoutes.js
│   ├── characterRoutes.js
│   ├── itemRoutes.js
│   ├── marketRoutes.js
│   └── combatRoutes.js      ⚔️
├── utils.js              # Utility functions & combat calculations
├── index.js              # Express server
├── COMBAT_SYSTEM.md      # Combat documentation
└── COMBAT_EXAMPLES.http  # API testing examples
```

## Game Mechanics

### Character Stats

- **Strength** - Increases damage output
- **Vitality** - Increases HP and defense
- **Dexterity** - Increases damage slightly
- **Level** - Character progression
- **Experience** - Earned from combat
- **Gold** - Currency for market

### Item System

- **Rarities**: Common, Rare, Unique, Legendary
- **Affixes**: Random stat bonuses based on rarity
- **Equipment Slots**: head, chest, legs, main_hand, off_hand, ring, amulet

### Combat Rewards

- Experience: `opponentLevel × 50`
- Gold: `opponentLevel × 10`

## Development

### Adding New Features

The system is designed to be extensible:

1. **New Stats** - Add to character schema and update `getCharacterStats()` in `utils.js`
2. **New Affixes** - Add to database `affixes` table and update stat calculations
3. **New Combat Mechanics** - Extend `combatController.js` and damage calculations
4. **Skills/Abilities** - Use the existing `skills` and `class_skills` tables

### Database Tables

- `users` - User accounts
- `characters` - Player characters
- `classes` - Character classes
- `skills` - Available skills
- `class_skills` - Skills per class
- `base_items` - Item templates
- `items` - Generated items
- `affixes` - Stat modifiers
- `item_affixes` - Affixes on items
- `character_equipment` - Equipped items
- `character_inventory` - Inventory items
- `monsters` - Enemy creatures (for future PvE)
- `level_requirements` - XP needed per level

## Testing

Use the provided `COMBAT_EXAMPLES.http` file with REST Client extension in VS Code:

1. Login to get JWT token
2. Create/select a character
3. Generate some items and equip them
4. Find an opponent from `/character/all`
5. Initiate combat with `/combat/fight`

## Future Enhancements

See **[COMBAT_SYSTEM.md](./COMBAT_SYSTEM.md)** for detailed future feature ideas:

- Skills & Abilities
- PvE Combat (monsters)
- Critical Hits & Dodge
- Status Effects
- Combat History
- Arena/Matchmaking
- Equipment Durability

## License

[Your License Here]

## Credits

Built with Express.js, MariaDB, and passion for fantasy games! ⚔️
