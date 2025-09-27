-- Nouvelle table pour enregistrer les opérations du fond de caisse
-- Chaque opération = 1 ligne (contrairement à l'ancienne table qui avait 1 ligne par club)

CREATE TABLE IF NOT EXISTS fond_caisse_operations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_club INT NOT NULL,
    type_operation ENUM('credit', 'debit') NOT NULL COMMENT 'Type d\'opération: credit (banque vers caisse) ou debit (caisse vers banque)',
    montant DECIMAL(10,2) NOT NULL COMMENT 'Montant de l\'opération',
    description TEXT COMMENT 'Description de l\'opération (nom banque, etc.)',
    banque_id INT COMMENT 'ID de la banque concernée',
    user_id INT NOT NULL COMMENT 'Utilisateur qui a effectué l\'opération',
    date_operation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Index pour les performances (pas de clés étrangères pour éviter les problèmes)
    INDEX idx_club_date (id_club, date_operation),
    INDEX idx_type_operation (type_operation),
    INDEX idx_banque (banque_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrer les données existantes de l'ancienne table fond_caisse
-- (si elle contient des opérations à migrer)
INSERT INTO fond_caisse_operations (id_club, type_operation, montant, description, user_id)
SELECT 
    id_club,
    'credit' as type_operation,
    credit as montant,
    'Migration - Crédit initial' as description,
    1 as user_id  -- Utilisateur par défaut pour la migration
FROM fond_caisse 
WHERE credit > 0;

INSERT INTO fond_caisse_operations (id_club, type_operation, montant, description, user_id)
SELECT 
    id_club,
    'debit' as type_operation,
    debit as montant,
    'Migration - Débit initial' as description,
    1 as user_id  -- Utilisateur par défaut pour la migration
FROM fond_caisse 
WHERE debit > 0;

-- Vérification des données migrées
SELECT 
    fco.id_club, 
    c.nom as club_nom, 
    fco.type_operation, 
    fco.montant, 
    fco.description,
    fco.date_operation
FROM fond_caisse_operations fco
JOIN clubs c ON fco.id_club = c.id
ORDER BY fco.id_club, fco.date_operation;