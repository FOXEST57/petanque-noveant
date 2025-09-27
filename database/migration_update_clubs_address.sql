-- Migration pour séparer les champs d'adresse dans la table clubs
-- Date: 2025-01-27
-- Description: Remplace le champ 'adresse' par 'numero_rue', 'nom_rue' et 'code_postal'

USE petanque_noveant;

-- Ajouter les nouveaux champs d'adresse
ALTER TABLE clubs 
ADD COLUMN numero_rue VARCHAR(10) DEFAULT NULL COMMENT 'Numéro de rue',
ADD COLUMN nom_rue VARCHAR(255) DEFAULT NULL COMMENT 'Nom de la rue',
ADD COLUMN code_postal VARCHAR(5) DEFAULT NULL COMMENT 'Code postal';

COMMIT;

-- Migrer les données existantes (extraction basique depuis le champ adresse)
-- Note: Cette migration fait une extraction basique, les données devront être vérifiées manuellement
UPDATE clubs SET 
    numero_rue = CASE 
        WHEN adresse LIKE '%,%' THEN 
            TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(adresse, ' ', 1), ',', 1))
        ELSE 
            TRIM(SUBSTRING_INDEX(adresse, ' ', 1))
    END,
    nom_rue = CASE 
        WHEN adresse LIKE '%,%' THEN 
            TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(adresse, ',', 1), ' ', -1))
        ELSE 
            TRIM(SUBSTRING(adresse, LOCATE(' ', adresse) + 1, 
                LOCATE(',', CONCAT(adresse, ',')) - LOCATE(' ', adresse) - 1))
    END,
    code_postal = CASE 
        WHEN adresse LIKE '%,%' THEN 
            TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(adresse, ',', 2), ' ', 1))
        ELSE NULL
    END
WHERE adresse IS NOT NULL AND adresse != '';

COMMIT;

-- Supprimer l'ancien champ adresse après migration
-- ALTER TABLE clubs DROP COLUMN adresse;

-- Ajouter des index pour optimiser les recherches
ALTER TABLE clubs 
ADD INDEX idx_code_postal (code_postal),
ADD INDEX idx_ville_code_postal (ville, code_postal);

COMMIT;

-- Afficher le résultat de la migration
SELECT 
    id,
    nom,
    ville,
    numero_rue,
    nom_rue,
    code_postal,
    adresse as ancienne_adresse
FROM clubs 
ORDER BY id;

SELECT 'Migration des champs d\'adresse terminée. Vérifiez les données et supprimez le champ adresse si tout est correct.' as message;