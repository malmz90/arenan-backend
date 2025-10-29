-- --------------------------------------------------------
-- Värd:                         127.0.0.1
-- Serverversion:                11.1.0-MariaDB - mariadb.org binary distribution
-- Server-OS:                    Win64
-- HeidiSQL Version:             12.3.0.6589
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumpar databasstruktur för arenan_db
CREATE DATABASE IF NOT EXISTS `arenan_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `arenan_db`;

-- Dumpar struktur för tabell arenan_db.affixes
CREATE TABLE IF NOT EXISTS `affixes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `affix_type` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(255) DEFAULT NULL,
  `is_percent` tinyint(4) NOT NULL DEFAULT 0,
  `min_value` int(11) DEFAULT 0,
  `max_value` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dataexport var bortvalt.

-- Dumpar struktur för tabell arenan_db.base_items
CREATE TABLE IF NOT EXISTS `base_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `min_dmg` int(11) DEFAULT NULL,
  `max_dmg` int(11) DEFAULT NULL,
  `item_type` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `price` int(11) DEFAULT 0,
  `rarity` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dataexport var bortvalt.

-- Dumpar struktur för tabell arenan_db.characters
CREATE TABLE IF NOT EXISTS `characters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `class_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `level` int(11) DEFAULT 1,
  `experience` int(11) DEFAULT 0,
  `vitality` int(11) DEFAULT NULL,
  `strength` int(11) DEFAULT NULL,
  `dexterity` int(11) DEFAULT NULL,
  `unspent_stat_points` int(11) DEFAULT 0,
  `max_rounds` int(11) DEFAULT 0,
  `current_rounds` int(11) DEFAULT 0,
  `gold` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `FK_character_user` (`user_id`),
  KEY `FK_characters_classes` (`class_id`),
  CONSTRAINT `FK_character_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK_characters_classes` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dataexport var bortvalt.

-- Dumpar struktur för tabell arenan_db.character_equipment
CREATE TABLE IF NOT EXISTS `character_equipment` (
  `character_id` int(11) NOT NULL,
  `head` int(11) DEFAULT NULL,
  `chest` int(11) DEFAULT NULL,
  `legs` int(11) DEFAULT NULL,
  `main_hand` int(11) DEFAULT NULL,
  `off_hand` int(11) DEFAULT NULL,
  `ring` int(11) DEFAULT NULL,
  `amulet` int(11) DEFAULT NULL,
  PRIMARY KEY (`character_id`),
  KEY `fk_character_equipment_head` (`head`),
  KEY `fk_character_equipment_chest` (`chest`),
  KEY `fk_character_equipment_legs` (`legs`),
  KEY `fk_character_equipment_main_hand` (`main_hand`),
  KEY `fk_character_equipment_off_hand` (`off_hand`),
  KEY `fk_character_equipment_ring` (`ring`),
  KEY `fk_character_equipment_amulet` (`amulet`),
  CONSTRAINT `fk_character_equipment_amulet` FOREIGN KEY (`amulet`) REFERENCES `items` (`id`),
  CONSTRAINT `fk_character_equipment_characters` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`),
  CONSTRAINT `fk_character_equipment_chest` FOREIGN KEY (`chest`) REFERENCES `items` (`id`),
  CONSTRAINT `fk_character_equipment_head` FOREIGN KEY (`head`) REFERENCES `items` (`id`),
  CONSTRAINT `fk_character_equipment_legs` FOREIGN KEY (`legs`) REFERENCES `items` (`id`),
  CONSTRAINT `fk_character_equipment_main_hand` FOREIGN KEY (`main_hand`) REFERENCES `items` (`id`),
  CONSTRAINT `fk_character_equipment_off_hand` FOREIGN KEY (`off_hand`) REFERENCES `items` (`id`),
  CONSTRAINT `fk_character_equipment_ring` FOREIGN KEY (`ring`) REFERENCES `items` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dataexport var bortvalt.

-- Dumpar struktur för tabell arenan_db.character_inventory
CREATE TABLE IF NOT EXISTS `character_inventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `character_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_character_inventory_characters` (`character_id`),
  KEY `fk_character_inventory_items` (`item_id`),
  CONSTRAINT `fk_character_inventory_characters` FOREIGN KEY (`character_id`) REFERENCES `characters` (`id`),
  CONSTRAINT `fk_character_inventory_items` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dataexport var bortvalt.

-- Dumpar struktur för tabell arenan_db.classes
CREATE TABLE IF NOT EXISTS `classes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dataexport var bortvalt.

-- Dumpar struktur för tabell arenan_db.class_skills
CREATE TABLE IF NOT EXISTS `class_skills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `class_id` int(11) DEFAULT NULL,
  `skill_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK__classes` (`class_id`),
  KEY `FK__skills` (`skill_id`),
  CONSTRAINT `FK__classes` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK__skills` FOREIGN KEY (`skill_id`) REFERENCES `skills` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dataexport var bortvalt.

-- Dumpar struktur för tabell arenan_db.items
CREATE TABLE IF NOT EXISTS `items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `rarity` varchar(255) NOT NULL,
  `base_item_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_items_base_items` (`base_item_id`),
  CONSTRAINT `FK_items_base_items` FOREIGN KEY (`base_item_id`) REFERENCES `base_items` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dataexport var bortvalt.

-- Dumpar struktur för tabell arenan_db.item_affixes
CREATE TABLE IF NOT EXISTS `item_affixes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `item_id` int(11) DEFAULT 0,
  `affix_id` int(11) DEFAULT 0,
  `value` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `FK__items` (`item_id`),
  KEY `FK__affixes` (`affix_id`),
  CONSTRAINT `FK__affixes` FOREIGN KEY (`affix_id`) REFERENCES `affixes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `FK__items` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dataexport var bortvalt.

-- Dumpar struktur för tabell arenan_db.level_requirements
CREATE TABLE IF NOT EXISTS `level_requirements` (
  `level` int(11) NOT NULL,
  `experience_required` int(11) DEFAULT NULL,
  PRIMARY KEY (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dataexport var bortvalt.

-- Dumpar struktur för tabell arenan_db.monsters
CREATE TABLE IF NOT EXISTS `monsters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '0',
  `level` int(11) NOT NULL DEFAULT 0,
  `min_damage` int(11) NOT NULL DEFAULT 0,
  `max_damage` int(11) NOT NULL DEFAULT 0,
  `exp_reward` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dataexport var bortvalt.

-- Dumpar struktur för tabell arenan_db.monster_item_drops
CREATE TABLE IF NOT EXISTS `monster_item_drops` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `monster_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `drop_rate` decimal(5,4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_monster_item_drops_monsters` (`monster_id`),
  KEY `fk_monster_item_drops_items` (`item_id`),
  CONSTRAINT `fk_monster_item_drops_items` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  CONSTRAINT `fk_monster_item_drops_monsters` FOREIGN KEY (`monster_id`) REFERENCES `monsters` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dataexport var bortvalt.

-- Dumpar struktur för tabell arenan_db.skills
CREATE TABLE IF NOT EXISTS `skills` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL DEFAULT '',
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dataexport var bortvalt.

-- Dumpar struktur för tabell arenan_db.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Dataexport var bortvalt.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
