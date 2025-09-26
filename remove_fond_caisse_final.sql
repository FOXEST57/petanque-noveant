-- Script pour supprimer définitivement la colonne fond_caisse de la table clubs
-- Cette colonne a été remplacée par la table fond_caisse

USE petanque_noveant;

-- Vérifier si la colonne existe avant de la supprimer
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = 'petanque_noveant' 
    AND TABLE_NAME = 'clubs' 
    AND COLUMN_NAME = 'fond_caisse'
);

-- Supprimer la colonne si elle existe
SET @sql = IF(@column_exists > 0, 
    'ALTER TABLE clubs DROP COLUMN fond_caisse', 
    'SELECT "Colonne fond_caisse n\'existe pas dans clubs" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Vérifier la structure finale
DESCRIBE clubs;