-- Création de la table fond_caisse pour isoler la gestion du fond de caisse
CREATE TABLE IF NOT EXISTS fond_caisse (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_club INT NOT NULL,
    credit DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Montants crédités (transferts banque vers caisse)',
    debit DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Montants débités (transferts caisse vers banque)',
    solde DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Solde actuel du fond de caisse',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_club) REFERENCES clubs(id) ON DELETE CASCADE,
    UNIQUE KEY unique_club (id_club)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion des données existantes depuis la table clubs
INSERT INTO fond_caisse (id_club, solde)
SELECT id, COALESCE(fond_caisse, 0.00) as solde
FROM clubs
ON DUPLICATE KEY UPDATE 
    solde = VALUES(solde);

-- Vérification des données insérées
SELECT fc.id_club, c.nom as club_nom, fc.credit, fc.debit, fc.solde
FROM fond_caisse fc
JOIN clubs c ON fc.id_club = c.id
ORDER BY fc.id_club;