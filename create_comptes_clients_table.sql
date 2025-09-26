-- Table pour gérer les comptes des clients/membres
-- Cette table permet de suivre les débits, crédits et soldes des comptes membres

CREATE TABLE IF NOT EXISTS comptes_clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    membre_id INT NOT NULL,
    club_id INT NOT NULL,
    
    -- Colonnes pour les mouvements
    debit DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Montant débité du compte',
    credit DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Montant crédité au compte',
    solde DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Solde actuel du compte',
    
    -- Informations sur la transaction
    type_operation ENUM('credit', 'debit', 'ajustement', 'transfert') NOT NULL,
    description TEXT COMMENT 'Description de l\'opération',
    reference VARCHAR(100) COMMENT 'Référence de la transaction (facture, etc.)',
    
    -- Métadonnées
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT COMMENT 'ID de l\'utilisateur qui a créé l\'opération',
    
    -- Clés étrangères
    FOREIGN KEY (membre_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Index pour les performances
    INDEX idx_membre_club (membre_id, club_id),
    INDEX idx_club_date (club_id, created_at),
    INDEX idx_type_operation (type_operation),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vue pour obtenir le solde actuel de chaque membre
CREATE OR REPLACE VIEW vue_soldes_membres AS
SELECT 
    m.id as membre_id,
    m.nom,
    m.prenom,
    m.email,
    m.club_id,
    COALESCE(SUM(cc.credit), 0) as total_credits,
    COALESCE(SUM(cc.debit), 0) as total_debits,
    COALESCE(SUM(cc.credit) - SUM(cc.debit), 0) as solde_calcule,
    m.solde as solde_membre_table,
    COUNT(cc.id) as nombre_operations,
    MAX(cc.updated_at) as derniere_operation
FROM members m
LEFT JOIN comptes_clients cc ON m.id = cc.membre_id
GROUP BY m.id, m.nom, m.prenom, m.email, m.club_id, m.solde;

-- Procédure stockée pour créditer un compte
DELIMITER //
CREATE PROCEDURE CrediterCompteClient(
    IN p_membre_id INT,
    IN p_club_id INT,
    IN p_montant DECIMAL(10,2),
    IN p_description TEXT,
    IN p_created_by INT
)
BEGIN
    DECLARE v_nouveau_solde DECIMAL(10,2);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Calculer le nouveau solde
    SELECT COALESCE(solde, 0) + p_montant INTO v_nouveau_solde
    FROM members 
    WHERE id = p_membre_id AND club_id = p_club_id;
    
    -- Insérer l'opération de crédit
    INSERT INTO comptes_clients (
        membre_id, club_id, credit, solde, type_operation, 
        description, created_by
    ) VALUES (
        p_membre_id, p_club_id, p_montant, v_nouveau_solde, 'credit',
        p_description, p_created_by
    );
    
    -- Mettre à jour le solde dans la table members
    UPDATE members 
    SET solde = v_nouveau_solde, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_membre_id AND club_id = p_club_id;
    
    COMMIT;
END //
DELIMITER ;

-- Procédure stockée pour débiter un compte
DELIMITER //
CREATE PROCEDURE DebiterCompteClient(
    IN p_membre_id INT,
    IN p_club_id INT,
    IN p_montant DECIMAL(10,2),
    IN p_description TEXT,
    IN p_created_by INT
)
BEGIN
    DECLARE v_solde_actuel DECIMAL(10,2);
    DECLARE v_nouveau_solde DECIMAL(10,2);
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Vérifier le solde actuel
    SELECT COALESCE(solde, 0) INTO v_solde_actuel
    FROM members 
    WHERE id = p_membre_id AND club_id = p_club_id;
    
    -- Vérifier si le solde est suffisant
    IF v_solde_actuel < p_montant THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Solde insuffisant pour cette opération';
    END IF;
    
    -- Calculer le nouveau solde
    SET v_nouveau_solde = v_solde_actuel - p_montant;
    
    -- Insérer l'opération de débit
    INSERT INTO comptes_clients (
        membre_id, club_id, debit, solde, type_operation, 
        description, created_by
    ) VALUES (
        p_membre_id, p_club_id, p_montant, v_nouveau_solde, 'debit',
        p_description, p_created_by
    );
    
    -- Mettre à jour le solde dans la table members
    UPDATE members 
    SET solde = v_nouveau_solde, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_membre_id AND club_id = p_club_id;
    
    COMMIT;
END //
DELIMITER ;

-- Trigger pour maintenir la cohérence des soldes
DELIMITER //
CREATE TRIGGER after_comptes_clients_insert
AFTER INSERT ON comptes_clients
FOR EACH ROW
BEGIN
    -- Recalculer le solde basé sur toutes les opérations
    UPDATE members m
    SET solde = (
        SELECT COALESCE(SUM(cc.credit) - SUM(cc.debit), 0)
        FROM comptes_clients cc
        WHERE cc.membre_id = NEW.membre_id
    )
    WHERE m.id = NEW.membre_id;
END //
DELIMITER ;