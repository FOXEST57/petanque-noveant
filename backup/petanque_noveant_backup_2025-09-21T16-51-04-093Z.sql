-- Sauvegarde de la base de données petanque_noveant
-- Date: 2025-09-21T16:51:04.095Z
-- Avant migration club_id=1 vers club_id=2

-- Structure de la table carousel_images
DROP TABLE IF EXISTS `carousel_images`;
CREATE TABLE `carousel_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `image_url` varchar(500) NOT NULL,
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `club_id` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_display_order` (`display_order`),
  KEY `idx_is_active` (`is_active`),
  KEY `fk_carousel_images_club_id` (`club_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Données de la table carousel_images
INSERT INTO `carousel_images` VALUES
(1, 'Image d accueil 1', '/image/fond.jpeg', 1, 1, '2025-09-09 15:35:32', '2025-09-09 15:35:32', 1),
(2, 'Terrain de petanque', '/image/AdobeStock_645053.jpeg', 2, 1, '2025-09-09 15:35:32', '2025-09-09 15:35:32', 1),
(3, 'Competition', '/image/AdobeStock_645162.jpeg', 3, 1, '2025-09-09 15:35:32', '2025-09-09 15:35:32', 1),
(4, 'Image d\'accueil 1', '/image/fond.jpeg', 1, 1, '2025-09-09 15:37:57', '2025-09-09 15:37:57', 1),
(5, 'Terrain de pétanque', '/image/AdobeStock_645053.jpeg', 2, 1, '2025-09-09 15:37:57', '2025-09-09 15:37:57', 1),
(6, 'Compétition', '/image/AdobeStock_645162.jpeg', 3, 1, '2025-09-09 15:37:57', '2025-09-09 15:37:57', 1);

-- Structure de la table clubs
DROP TABLE IF EXISTS `clubs`;
CREATE TABLE `clubs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `numero_ffpjp` varchar(20) NOT NULL,
  `subdomain` varchar(100) NOT NULL,
  `ville` varchar(100) NOT NULL,
  `adresse` text,
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `description` text,
  `logo_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_ffpjp` (`numero_ffpjp`),
  UNIQUE KEY `subdomain` (`subdomain`),
  CONSTRAINT `chk_numero_ffpjp_4digits` CHECK (regexp_like(`numero_ffpjp`,_utf8mb4'^[0-9]{4}$'))
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Données de la table clubs
INSERT INTO `clubs` VALUES
(1, 'Pétanque Club de Noveant', '0092', 'noveant', 'Noveant-sur-Moselle', '123 Rue du Stade, 57680 Noveant-sur-Moselle', '03.87.12.34.56', 'contact@petanque-noveant.fr', 'Club de pétanque de Noveant-sur-Moselle fondé en 1985', NULL, '2025-09-20 09:59:06', '2025-09-20 16:37:23'),
(3, 'Pétanque Marseillaise', '1302', 'marseille', 'Marseille', '45 Avenue du Prado, 13008 Marseille', '04.91.22.33.44', 'contact@petanque-marseille.fr', 'Club historique de pétanque marseillaise fondé en 1952. Ambiance provençale garantie !', NULL, '2025-09-21 09:56:11', '2025-09-21 09:56:11'),
(4, 'Boule Lyonnaise', '6903', 'lyon', 'Lyon', '12 Rue de la République, 69002 Lyon', '04.78.55.66.77', 'info@boule-lyonnaise.fr', 'Club dynamique au cœur de Lyon, spécialisé dans la pétanque et la lyonnaise depuis 1968.', NULL, '2025-09-21 09:56:11', '2025-09-21 09:56:11'),
(5, 'AS Pétanque Toulousaine', '3104', 'toulouse', 'Toulouse', '88 Boulevard de Strasbourg, 31000 Toulouse', '05.61.44.55.66', 'contact@petanque-toulouse.fr', 'Association sportive de pétanque toulousaine. Venez découvrir la convivialité du Sud-Ouest !', NULL, '2025-09-21 09:56:11', '2025-09-21 09:56:11'),
(6, 'Club Bouliste Niçois', '0605', 'nice', 'Nice', '25 Promenade des Anglais, 06000 Nice', '04.93.77.88.99', 'secretariat@bouliste-nice.fr', 'Club de pétanque niçois avec vue sur la Méditerranée. Cadre exceptionnel pour jouer !', NULL, '2025-09-21 09:56:11', '2025-09-21 09:56:11'),
(7, 'Pétanque Club Strasbourgeois', '6706', 'strasbourg', 'Strasbourg', '15 Place Kléber, 67000 Strasbourg', '03.88.11.22.33', 'admin@petanque-strasbourg.fr', 'Club alsacien de pétanque alliant tradition française et convivialité européenne depuis 1975.', NULL, '2025-09-21 09:56:11', '2025-09-21 09:56:11');

-- Structure de la table drinks
DROP TABLE IF EXISTS `drinks`;
CREATE TABLE `drinks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `description` text,
  `image_url` varchar(500) DEFAULT NULL,
  `stock` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `club_id` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`(250)),
  KEY `fk_drinks_club_id` (`club_id`)
) ENGINE=MyISAM AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Données de la table drinks
INSERT INTO `drinks` VALUES
(2, 'Bière Bouteille', '20.00', 'Sélection de bières en bouteille, locales et internationales', 'uploads/drinks/1757427719801_73w4wu4bwer.jpg', 38, '2025-09-07 05:39:49', '2025-09-21 07:24:45', 1),
(3, 'Picon Pression', '1.50', 'Picon bière à la pression, la boisson traditionnelle des joueurs de pétanque', 'uploads/drinks/1757305364144_fo985g3hxx9.jpeg', 40, '2025-09-07 05:39:49', '2025-09-08 04:22:44', 1),
(4, 'Picon Bouteille', '1.30', 'Picon bière en bouteille, pour savourer cette spécialité française', 'uploads/drinks/1757305326289_v28gbh62d5.jpg', 100, '2025-09-07 05:39:49', '2025-09-17 05:45:45', 1),
(6, 'Soda', '2.50', 'Variété de sodas rafraîchissants : Coca-Cola, Orangina, Sprite et plus', 'uploads/drinks/1757305377092_myg0nfrtj9g.jpg', 50, '2025-09-07 07:32:51', '2025-09-08 04:22:57', 1),
(7, 'Verre de Vin', '2.00', 'Vins de la région servis au verre, rouge, blanc ou rosé', 'uploads/drinks/1757305388484_nmkjdqbb06m.jpg', 30, '2025-09-07 07:32:51', '2025-09-08 04:23:08', 1),
(8, 'Bouteille de Vin', '1.50', 'Bouteilles de vin sélectionnées, parfaites pour partager entre amis ou amies', 'uploads/drinks/1757431813032_1weq0jzyzdf.png', 42, '2025-09-07 07:32:51', '2025-09-16 15:40:48', 1),
(16, 'Biere pression', '2.50', 'biere', 'uploads/drinks/1757432356771_f3swd899cyd.jpg', 50, '2025-09-09 15:39:16', '2025-09-09 15:39:16', 1);

-- Structure de la table event_photos
DROP TABLE IF EXISTS `event_photos`;
CREATE TABLE `event_photos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `upload_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `club_id` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_event_id` (`event_id`),
  KEY `fk_event_photos_club_id` (`club_id`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Données de la table event_photos
INSERT INTO `event_photos` VALUES
(1, 4, '1757224218955_reajtthhl7b.jpeg', 'AdobeStock_645053 (1).jpeg', 'uploads/events/1757224218955_reajtthhl7b.jpeg', 2920836, 'image/jpeg', '2025-09-07 05:50:18', 1),
(2, 4, '1757224218959_9e0ke1hm6ct.jpeg', 'AdobeStock_645162 (1) - Copie.jpeg', 'uploads/events/1757224218959_9e0ke1hm6ct.jpeg', 2179857, 'image/jpeg', '2025-09-07 05:50:18', 1),
(3, 4, '1757224218961_u1p6f1cjm9.jpeg', 'AdobeStock_645174.jpeg', 'uploads/events/1757224218961_u1p6f1cjm9.jpeg', 1984321, 'image/jpeg', '2025-09-07 05:50:18', 1),
(4, 4, '1757224218962_zu4pawx13s.jpeg', 'AdobeStock_940865 - Copie.jpeg', 'uploads/events/1757224218962_zu4pawx13s.jpeg', 747365, 'image/jpeg', '2025-09-07 05:50:18', 1),
(5, 4, '1757224218963_rk2m4emryt.jpeg', 'AdobeStock_11774030.jpeg', 'uploads/events/1757224218963_rk2m4emryt.jpeg', 2901967, 'image/jpeg', '2025-09-07 05:50:18', 1),
(6, 7, '1757258042657_maabps7i42d.jpeg', 'AdobeStock_166802024 - Copie.jpeg', 'uploads/events/1757258042657_maabps7i42d.jpeg', 3401365, 'image/jpeg', '2025-09-07 15:14:02', 1),
(7, 8, '1757258072636_j8cl487p28d.jpeg', 'AdobeStock_189048411.jpeg', 'uploads/events/1757258072636_j8cl487p28d.jpeg', 2817396, 'image/jpeg', '2025-09-07 15:14:32', 1),
(8, 10, '1757305582152_7aiytc74pl5.jpeg', 'AdobeStock_108030161 (1) - Copie.jpeg', 'uploads/events/1757305582152_7aiytc74pl5.jpeg', 4473926, 'image/jpeg', '2025-09-08 04:26:22', 1),
(9, 7, '1757305824933_qtdbuawgjy.jpeg', 'AdobeStock_189048411.jpeg', 'uploads/events/1757305824933_qtdbuawgjy.jpeg', 2817396, 'image/jpeg', '2025-09-08 04:30:24', 1),
(10, 7, '1757305824935_8ooilc6bcu.jpeg', 'AdobeStock_108030161 - Copie.jpeg', 'uploads/events/1757305824935_8ooilc6bcu.jpeg', 4473926, 'image/jpeg', '2025-09-08 04:30:24', 1),
(11, 7, '1757305824937_u06x7qqh71e.jpeg', 'AdobeStock_166802024.jpeg', 'uploads/events/1757305824937_u06x7qqh71e.jpeg', 3401365, 'image/jpeg', '2025-09-08 04:30:24', 1),
(12, 7, '1757305824939_i3f7a7vlm3.jpeg', 'AdobeStock_645166.jpeg', 'uploads/events/1757305824939_i3f7a7vlm3.jpeg', 1955247, 'image/jpeg', '2025-09-08 04:30:24', 1),
(13, 8, '1757481527833_vgghc4ijwa.jpeg', 'AdobeStock_645174 (1).jpeg', 'uploads/events/1757481527833_vgghc4ijwa.jpeg', 1984321, 'image/jpeg', '2025-09-10 05:18:47', 1),
(14, 10, '1758037217240_7w1sf8ax87.jpeg', 'AdobeStock_645166 (1).jpeg', 'uploads/events/1758037217240_7w1sf8ax87.jpeg', 1955247, 'image/jpeg', '2025-09-16 15:40:17', 1),
(15, 4, '1758119401936_6c9lwhwnz6l.jpeg', 'AdobeStock_645174 (1).jpeg', 'uploads/events/1758119401936_6c9lwhwnz6l.jpeg', 1984321, 'image/jpeg', '2025-09-17 14:30:01', 1);

-- Structure de la table events
DROP TABLE IF EXISTS `events`;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text,
  `date` date NOT NULL,
  `heure` varchar(10) DEFAULT NULL,
  `lieu` varchar(255) DEFAULT NULL,
  `publicCible` varchar(255) DEFAULT NULL,
  `photos` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `club_id` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_date` (`date`),
  KEY `fk_events_club_id` (`club_id`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Données de la table events
INSERT INTO `events` VALUES
(6, 'Assemblée Générale', 'Assemblée générale annuelle du club', '2024-03-19 23:00:00', '18:30', 'Salle des fêtes de Noveant', 'Tous membres', NULL, '2025-09-07 07:32:51', '2025-09-07 07:32:51', 1),
(7, 'Initiation Jeunes', 'Séance d\'initiation à la pétanque pour les jeunes', '2024-05-07 22:00:00', '16:00', 'Terrain municipal de Noveant', 'Jeunes 8-16 ans', '[]', '2025-09-07 07:32:51', '2025-09-08 04:30:24', 1),
(4, 'testdff', 'dsffffffffffffffffffffffff', '2025-09-17 22:00:00', '', 'noveantvv', 'Ouvert à tous', '[]', '2025-09-07 05:50:18', '2025-09-17 14:30:01', 1),
(8, 'Tournoi de Printemps', 'Tournoi annuel de pétanque pour tous les membres', '2024-04-12 22:00:00', '14:00', 'Terrain municipal de Noveant', 'Tous membres', '[]', '2025-09-07 07:33:16', '2025-09-10 05:18:47', 1),
(9, 'Assemblée Générale', 'Assemblée générale annuelle du club', '2024-03-19 23:00:00', '18:30', 'Salle des fêtes de Noveant', 'Tous membres', NULL, '2025-09-07 07:33:16', '2025-09-07 07:33:16', 1),
(10, 'Initiation Jeunes', 'Séance d\'initiation à la pétanque pour les jeunes', '2025-09-09 22:00:00', '16:00', 'Terrain municipal de Noveant', 'Jeunes 8-16 ans', '[]', '2025-09-07 07:33:16', '2025-09-17 05:42:05', 1);

-- Structure de la table home_carousel_images
DROP TABLE IF EXISTS `home_carousel_images`;
CREATE TABLE `home_carousel_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `home_content_id` int DEFAULT '1',
  `image_url` varchar(500) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `club_id` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `home_content_id` (`home_content_id`),
  KEY `fk_home_carousel_images_club_id` (`club_id`)
) ENGINE=MyISAM AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Données de la table home_carousel_images
INSERT INTO `home_carousel_images` VALUES
(20, 1, 'uploads/home-carousel/1757496989732_n8zu79znqs.jpeg', 'Nos terrains de qualité', 4, '2025-09-10 09:36:29', 1),
(19, 1, 'uploads/home-carousel/1757495961708_133ggy8oqmj.jpeg', 'Nos tournois et championnats', 3, '2025-09-10 09:19:21', 1),
(18, 1, 'uploads/home-carousel/1757495899101_vr1ypbrzc0o.jpeg', 'La passion de la pétanque', 2, '2025-09-10 09:18:19', 1),
(21, 1, 'uploads/home-carousel/1757497281255_ha5qgc727e5.jpeg', 'L\'art du jeu de boules', 5, '2025-09-10 09:41:21', 1);

-- Structure de la table home_content
DROP TABLE IF EXISTS `home_content`;
CREATE TABLE `home_content` (
  `id` int NOT NULL DEFAULT '1',
  `title` varchar(255) NOT NULL DEFAULT 'Bienvenue au Club de Pétanque de Noveant',
  `description` text,
  `schedules` text,
  `contact` text,
  `practical_info` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `location` text,
  `members` text,
  `club_title` varchar(255) DEFAULT 'Découvrez notre club',
  `club_description` text,
  `teams_content` text,
  `animations_content` text,
  `tournaments_content` text,
  `club_id` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_home_content_club_id` (`club_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Données de la table home_content
INSERT INTO `home_content` VALUES
(1, 'Bienvenue au Club de Pétanque', 'Noveant-sur-Moselle', 'Ouvert tous les jours', 'Test contact', 'Test info pratique', '2025-09-10 06:01:47', '2025-09-19 10:35:21', 'Veloroute Charles le téméraire
57680 Novéant-sur-Moselle, France', 'Plus de 80 licenciés
Toutes catégories d\'âge
 Ambiance conviviale', 'Découvrez notre club', 'Un club dynamique qui propose de nombreuses activités tout au long de l\'année', 'Découvrez nos équipes et leurs performances dans les différents championnats', 'Tournois, événements spéciaux et animations pour tous les âges.', 'Suivez nos résultats et classements dans les championnats régionaux.', 1);

-- Structure de la table member_types
DROP TABLE IF EXISTS `member_types`;
CREATE TABLE `member_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `description` text,
  `droits` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `club_id` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nom` (`nom`),
  KEY `fk_member_types_club_id` (`club_id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Données de la table member_types
INSERT INTO `member_types` VALUES
(1, 'Membre comité', 'Membre participant régulièrement aux activités', manage_members,view_stats,manage_teams, '2025-09-07 05:30:31', '2025-09-20 07:50:40', 1),
(7, 'Licencié', 'Licencié peut jouer et participer a toutes les activités du club', view_stats, '2025-09-20 07:48:39', '2025-09-20 07:48:58', 1),
(5, 'Président ', 'Le président dirige le club de pétanque et le commité il est investi de tous les pouvoirs', admin, '2025-09-07 06:25:37', '2025-09-10 05:44:34', 1),
(8, 'Secrétaire ', 'Le secrétaire s\'occupe de toute les taches administrative', manage_events,view_stats,manage_members,manage_teams, '2025-09-20 07:52:08', '2025-09-20 07:52:08', 1);

-- Structure de la table members
DROP TABLE IF EXISTS `members`;
CREATE TABLE `members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `adresse` text,
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `numero_licence` varchar(50) DEFAULT NULL,
  `date_entree` date DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `type_membre_id` int DEFAULT NULL,
  `photo_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `club_id` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `type_membre_id` (`type_membre_id`),
  KEY `fk_members_club_id` (`club_id`)
) ENGINE=MyISAM AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Données de la table members
INSERT INTO `members` VALUES
(19, 'pascaldddvvv', 'pascal', '17 Rue de Rosheim, 67000, Strasbourg, France', '0756994546', 'contact@modelias.com', '5151514', '2020-09-08 22:00:00', '1969-08-07 23:00:00', 2, 'uploads/members/1757481484804_y655rkk356.jpeg', '2025-09-07 08:48:58', '2025-09-10 05:18:04', 1),
(20, 'test', 'test', '17 Rue de Rosheim, 67000, Strasbourg, France', '0756994546', 'contact@modelias.com', 'dfdfsdfrser', '2025-09-06 22:00:00', '2020-02-07 23:00:00', 3, 'uploads/members/1757481502519_umd9cx3yeni.jpeg', '2025-09-07 08:54:44', '2025-09-10 05:18:22', 1),
(26, 'pascal', 'deba', NULL, '0101010101', 'foxest57@hotmail.com', NULL, NULL, NULL, 1, NULL, '2025-09-20 16:14:20', '2025-09-20 16:17:59', 1),
(24, 'napoli', 'raymonde', '17 Rue de Rosheim, 67000, Strasbourg, France', '0756994546', 'contact@modelias.com', NULL, NULL, NULL, 1, NULL, '2025-09-18 07:10:35', '2025-09-18 07:10:35', 1),
(27, 'test', 'test', NULL, '0101010101', 'contact@modelias.com', NULL, '2025-09-19 22:00:00', NULL, 1, NULL, '2025-09-20 16:20:32', '2025-09-20 16:20:32', 1);

-- Structure de la table membership_requests
DROP TABLE IF EXISTS `membership_requests`;
CREATE TABLE `membership_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `club_id` int NOT NULL DEFAULT '1',
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `surnom` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `numero_licence` varchar(50) DEFAULT NULL,
  `message` text,
  `type_demande` enum('spontanee','invitation') DEFAULT 'spontanee',
  `statut` enum('en_attente','approuvee','rejetee') DEFAULT 'en_attente',
  `date_naissance` date DEFAULT NULL,
  `adresse` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `date_traitement` timestamp NULL DEFAULT NULL,
  `traite_par_user_id` int DEFAULT NULL,
  `commentaire_traitement` text,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`(250)),
  KEY `idx_statut` (`statut`),
  KEY `idx_club_id` (`club_id`),
  KEY `traite_par_user_id` (`traite_par_user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Données de la table membership_requests
INSERT INTO `membership_requests` VALUES
(6, 1, 'pascal', 'deba', NULL, 'foxest57@hotmail.com', '0101010101', NULL, NULL, 'spontanee', 'approuvee', NULL, NULL, '2025-09-20 16:13:55', '2025-09-20 16:14:20', '2025-09-20 16:14:20', 2, NULL),
(2, 1, 'tessst', 'tessst', NULL, 'foxest57@gmail.com', '0780814222', NULL, NULL, 'spontanee', 'approuvee', NULL, NULL, '2025-09-20 15:29:23', '2025-09-20 15:29:36', '2025-09-20 15:29:36', 2, NULL),
(7, 1, 'test', 'test', NULL, 'contact@modelias.com', '0101010101', NULL, NULL, 'spontanee', 'approuvee', NULL, NULL, '2025-09-20 16:20:14', '2025-09-20 16:20:32', '2025-09-20 16:20:32', 2, NULL),
(8, 1, 'administrateur', 'Pascal', NULL, 'pascal.debailleul@hotmail.fr', '0756994545', NULL, NULL, 'spontanee', 'en_attente', NULL, NULL, '2025-09-21 09:26:10', '2025-09-21 09:26:10', NULL, NULL, NULL);

-- Structure de la table site_settings
DROP TABLE IF EXISTS `site_settings`;
CREATE TABLE `site_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `club_id` int NOT NULL DEFAULT '1',
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_setting_per_club` (`setting_key`,`club_id`),
  KEY `fk_site_settings_club` (`club_id`)
) ENGINE=MyISAM AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Données de la table site_settings
INSERT INTO `site_settings` VALUES
(1, 1, 'primary_color', '#425e9b', 'string', 'Couleur principale du site', '2025-09-19 07:03:03', '2025-09-21 15:18:16'),
(2, 1, 'site_name', 'Club de Pétanque', 'string', 'Nom du site', '2025-09-19 07:03:03', '2025-09-21 15:18:16'),
(3, 1, 'site_subtitle', 'Noveant sur moselle', 'string', 'Sous-titre du site', '2025-09-19 07:03:03', '2025-09-21 15:18:16'),
(4, 1, 'club_name', 'Club de Pétanque de Noveant', 'string', 'Nom officiel du club', '2025-09-19 07:03:03', '2025-09-21 15:18:16'),
(5, 1, 'ffpjp_id', '5701', 'string', 'Identifiant FFPJP du club', '2025-09-19 07:03:03', '2025-09-21 15:18:16'),
(6, 1, 'club_address', 'Noveant-sur-Moselle, France', 'string', 'Adresse du club', '2025-09-19 07:03:03', '2025-09-21 15:18:16'),
(7, 1, 'club_phone', '03.87.XX.XX.XX', 'string', 'Téléphone du club', '2025-09-19 07:03:03', '2025-09-21 15:18:16'),
(8, 1, 'club_email', 'contact@petanque-noveant.fr', 'string', 'Email de contact du club', '2025-09-19 07:03:03', '2025-09-21 15:18:16'),
(9, 1, 'facebook_url', '', 'string', 'Lien vers la page Facebook', '2025-09-19 07:03:03', '2025-09-21 15:18:16'),
(22, 3, 'phone_visible', 'true', 'boolean', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(10, 1, 'instagram_url', '', 'string', 'Lien vers le compte Instagram', '2025-09-19 07:03:03', '2025-09-21 15:18:16'),
(11, 1, 'logo_url', '', 'string', 'URL du logo du club', '2025-09-19 07:03:03', '2025-09-21 15:18:16'),
(24, 3, 'favicon_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(12, 1, 'favicon_url', '', 'string', 'URL du favicon du site', '2025-09-19 07:03:03', '2025-09-21 15:18:16'),
(23, 3, 'logo_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(13, 1, 'phone_visible', 'true', 'boolean', NULL, '2025-09-19 08:23:30', '2025-09-21 15:18:16'),
(14, 1, 'whatsapp_url', '', 'string', NULL, '2025-09-19 09:02:28', '2025-09-21 15:18:16'),
(15, 1, 'tiktok_url', '', 'string', NULL, '2025-09-19 09:02:28', '2025-09-21 15:18:16'),
(16, 1, 'club_description', 'Club convivial de pétanque à Noveant-sur-Moselle. Venez découvrir notre passion !', 'string', NULL, '2025-09-19 09:25:29', '2025-09-21 15:18:16'),
(20, 3, 'site_name', 'Club de Pétanque', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(21, 3, 'primary_color', '#425e9b', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(25, 3, 'facebook_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(26, 3, 'instagram_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(27, 3, 'whatsapp_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(28, 3, 'tiktok_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(29, 3, 'site_subtitle', 'Marseille', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(30, 3, 'club_name', 'Boule Marseillaise', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(31, 3, 'club_description', 'Le plus ancien club de pétanque de Marseille. Venez jouer sous le soleil provençal !', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(32, 3, 'club_address', '42 La Canebière, 13001 Marseille', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(33, 3, 'club_phone', '04.91.XX.XX.XX', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(34, 3, 'club_email', 'secretariat@boule-marseille.fr', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(35, 3, 'ffpjp_id', '1301', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(36, 4, 'site_name', 'Club de Pétanque', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(37, 4, 'primary_color', '#425e9b', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(38, 4, 'phone_visible', 'true', 'boolean', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(39, 4, 'logo_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(40, 4, 'favicon_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(41, 4, 'facebook_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(42, 4, 'instagram_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(43, 4, 'whatsapp_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(44, 4, 'tiktok_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(45, 4, 'site_subtitle', 'Toulouse', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(46, 4, 'club_name', 'AS Pétanque Toulousaine', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(47, 4, 'club_description', 'Association sportive de pétanque toulousaine. Venez découvrir la convivialité du Sud-Ouest !', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(48, 4, 'club_address', '88 Boulevard de Strasbourg, 31000 Toulouse', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(49, 4, 'club_phone', '05.61.XX.XX.XX', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(50, 4, 'club_email', 'contact@petanque-toulouse.fr', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(51, 4, 'ffpjp_id', '3104', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(52, 5, 'site_name', 'Club de Pétanque', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:25:20'),
(53, 5, 'primary_color', '#ea580c', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:25:20'),
(54, 5, 'phone_visible', 'true', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:25:20'),
(55, 5, 'logo_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:25:20'),
(56, 5, 'favicon_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:25:20'),
(57, 5, 'facebook_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:25:20'),
(58, 5, 'instagram_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:25:20'),
(59, 5, 'whatsapp_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:25:20'),
(60, 5, 'tiktok_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:25:20'),
(61, 5, 'site_subtitle', 'Nice', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:25:20'),
(62, 5, 'club_name', 'Club Bouliste Niçois', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:25:20'),
(63, 5, 'club_description', 'Club de pétanque niçois avec vue sur la Méditerranée. Cadre exceptionnel pour jouer !', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:25:20'),
(64, 5, 'club_address', '25 Promenade des Anglais, 06000 Nice', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:25:20'),
(65, 5, 'club_phone', '04.93.XX.XX.XX', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:25:20'),
(66, 5, 'club_email', 'secretariat@bouliste-nice.fr', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:25:20'),
(67, 5, 'ffpjp_id', '0605', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:25:20'),
(68, 6, 'site_name', 'Club de Pétanque', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:24:35'),
(69, 6, 'primary_color', '#059669', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:24:35'),
(70, 6, 'phone_visible', 'true', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:24:35'),
(71, 6, 'logo_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:24:35'),
(72, 6, 'favicon_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:24:35'),
(73, 6, 'facebook_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:24:35'),
(74, 6, 'instagram_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:24:35'),
(75, 6, 'whatsapp_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:24:35'),
(76, 6, 'tiktok_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:24:35'),
(77, 6, 'site_subtitle', 'Club Bouliste Niçois', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:24:35'),
(78, 6, 'club_name', 'Club Bouliste Niçois', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:24:35'),
(79, 6, 'club_description', 'Bienvenue au Club Bouliste Niçois. Rejoignez-nous pour partager notre passion de la pétanque !', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:24:35'),
(80, 6, 'club_address', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:24:35'),
(81, 6, 'club_phone', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:24:35'),
(82, 6, 'club_email', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:24:35'),
(83, 6, 'ffpjp_id', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:24:35'),
(84, 7, 'site_name', 'Club de Pétanque', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(85, 7, 'primary_color', '#425e9b', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(86, 7, 'phone_visible', 'true', 'boolean', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(87, 7, 'logo_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(88, 7, 'favicon_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(89, 7, 'facebook_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(90, 7, 'instagram_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(91, 7, 'whatsapp_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(92, 7, 'tiktok_url', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(93, 7, 'site_subtitle', 'Pétanque Club Strasbourgeois', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(94, 7, 'club_name', 'Pétanque Club Strasbourgeois', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(95, 7, 'club_description', 'Bienvenue au Pétanque Club Strasbourgeois. Rejoignez-nous pour partager notre passion de la pétanque !', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(96, 7, 'club_address', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(97, 7, 'club_phone', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(98, 7, 'club_email', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16'),
(99, 7, 'ffpjp_id', '', 'string', NULL, '2025-09-21 15:18:16', '2025-09-21 15:18:16');

-- Structure de la table team_members
DROP TABLE IF EXISTS `team_members`;
CREATE TABLE `team_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `team_id` int NOT NULL,
  `member_id` int NOT NULL,
  `role` varchar(100) DEFAULT 'Joueur',
  `joined_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_team_member` (`team_id`,`member_id`),
  KEY `idx_team_id` (`team_id`),
  KEY `idx_member_id` (`member_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Données de la table team_members
INSERT INTO `team_members` VALUES
(1, 1, 1, 'Capitaine', '2025-09-07 07:33:16'),
(2, 1, 2, 'Joueur', '2025-09-07 07:33:16'),
(3, 2, 3, 'Entraîneur', '2025-09-07 07:33:16'),
(4, 3, 1, 'Joueur', '2025-09-07 07:33:16');

-- Structure de la table teams
DROP TABLE IF EXISTS `teams`;
CREATE TABLE `teams` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text,
  `photo_url` varchar(500) DEFAULT NULL,
  `competition` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `club_id` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `idx_name` (`name`(250)),
  KEY `idx_category` (`category`),
  KEY `fk_teams_club_id` (`club_id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Données de la table teams
INSERT INTO `teams` VALUES
(1, 'Test Team Updated', 'Senior', 'Test description updated', 'uploads/teams/1757257821023_e7t4bgec47r.jpeg', 'championnat', '2025-09-07 07:33:16', '2025-09-17 15:20:08', 1),
(2, 'Les Jeunes Pousses', 'Junior', 'Équipe des jeunes talents du club', 'uploads/teams/1757258380925_8glsi26vhwa.jpeg', 'Coupe Régionale Jeunes', '2025-09-07 07:33:16', '2025-09-07 15:19:40', 1),
(3, 'Les Vétérans', 'veteran', 'Équipe des membres expérimentés', 'uploads/teams/1757305543222_55nkxlt2ge.jpeg', 'tournoi', '2025-09-07 07:33:16', '2025-09-08 04:25:43', 1),
(4, 'Test Team', 'Senior', 'Test description', 'uploads/teams/1758122611066_dievcd6gf3.jpeg', '', '2025-09-07 15:03:03', '2025-09-17 15:23:31', 1),
(5, 'Test Team FormData', 'veteran', 'Test avec FormData', 'uploads/teams/1758179796615_k7htk8xoo8d.jpeg', 'championnat', '2025-09-07 15:03:24', '2025-09-18 07:17:07', 1);

-- Structure de la table users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `club_id` int NOT NULL DEFAULT '1',
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `surnom` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `telephone` varchar(20) NOT NULL,
  `numero_licence` varchar(50) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('president','vice_president','secretaire','tresorier','membre','invite') DEFAULT 'membre',
  `statut` enum('actif','inactif','suspendu') DEFAULT 'actif',
  `photo_url` varchar(500) DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `adresse` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_super_admin` tinyint(1) DEFAULT '0' COMMENT 'Flag pour identifier les super administrateurs ayant accès à tous les clubs',
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`(250)),
  KEY `idx_role` (`role`),
  KEY `idx_statut` (`statut`),
  KEY `idx_club_id` (`club_id`),
  KEY `idx_is_super_admin` (`is_super_admin`)
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Données de la table users
INSERT INTO `users` VALUES
(7, 2, 'Test', 'Admin2', NULL, 'admin2@test.com', '', NULL, '', 'president', 'actif', NULL, NULL, NULL, '2025-09-21 08:38:35', '2025-09-21 08:38:35', 0),
(9, 3, 'foxest57', 'pascal', NULL, 'foxest57@gmail.com', '+33756994546', NULL, '$2b$12$RgEtehX0lysTUsX7DOMWKuFepw7Y2vP3j9Nb/0byhkw1J.ARqLCmu', 'president', 'actif', NULL, NULL, NULL, '2025-09-21 09:49:13', '2025-09-21 14:54:16', 1);

