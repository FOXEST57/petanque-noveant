-- Création de la base de données MySQL pour l'application Pétanque Noveant
-- Exécutez ce script en tant qu'administrateur MySQL

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS petanque_noveant CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE petanque_noveant;

-- Créer l'utilisateur si nécessaire (optionnel)
-- CREATE USER IF NOT EXISTS 'petanque_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
-- GRANT ALL PRIVILEGES ON petanque_noveant.* TO 'petanque_user'@'localhost';
-- FLUSH PRIVILEGES;

-- Afficher un message de confirmation
SELECT 'Base de données petanque_noveant créée avec succès!' AS message;