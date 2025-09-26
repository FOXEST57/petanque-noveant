-- Script SQL pour créer la table des comptes membres et leur historique

USE petanque_noveant;

-- Créer la table pour l'historique des comptes membres
CREATE TABLE IF NOT EXISTS membre_comptes_historique (
    id INT PRIMARY KEY AUTO_INCREMENT,
    club_id INT NOT NULL,
    membre_id INT NOT NULL,
    user_id INT NOT NULL COMMENT 'Utilisateur qui a effectué l''opération',
    type_operation ENUM('credit', 'debit', 'transfert_caisse_vers_compte', 'transfert_compte_vers_caisse') NOT NULL,
    montant DECIMAL(10,2) NOT NULL COMMENT 'Montant positif pour crédit, négatif pour débit',
    solde_avant DECIMAL(10,2) NOT NULL COMMENT 'Solde avant l''opération',
    solde_apres DECIMAL(10,2) NOT NULL COMMENT 'Solde après l''opération',
    description TEXT,
    reference_caisse_historique_id INT NULL COMMENT 'Référence vers l''opération correspondante dans caisse_historique',
    date_operation DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Index pour optimiser les requêtes
    INDEX idx_club_membre_date (club_id, membre_id, date_operation),
    INDEX idx_type_operation (type_operation),
    INDEX idx_date_operation (date_operation),
    
    -- Clés étrangères
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    FOREIGN KEY (membre_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (reference_caisse_historique_id) REFERENCES caisse_historique(id) ON DELETE SET NULL
);

-- Créer une vue pour faciliter les requêtes sur les soldes actuels des membres
CREATE OR REPLACE VIEW vue_soldes_membres AS
SELECT 
    m.id as membre_id,
    m.club_id,
    m.nom,
    m.prenom,
    m.pseudo,
    m.email,
    COALESCE(m.solde, 0.00) as solde_actuel,
    (
        SELECT COUNT(*) 
        FROM membre_comptes_historique mch 
        WHERE mch.membre_id = m.id
    ) as nombre_transactions,
    (
        SELECT MAX(mch.date_operation) 
        FROM membre_comptes_historique mch 
        WHERE mch.membre_id = m.id
    ) as derniere_transaction
FROM members m
WHERE m.club_id IS NOT NULL;

-- Créer une fonction pour calculer le solde d'un membre à une date donnée
DELIMITER //
CREATE FUNCTION IF NOT EXISTS calculer_solde_membre_a_date(
    p_membre_id INT,
    p_date_limite DATETIME
) RETURNS DECIMAL(10,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_solde DECIMAL(10,2) DEFAULT 0.00;
    
    SELECT COALESCE(SUM(montant), 0.00) INTO v_solde
    FROM membre_comptes_historique
    WHERE membre_id = p_membre_id 
    AND date_operation <= p_date_limite;
    
    RETURN v_solde;
END //
DELIMITER ;

-- Créer des triggers pour maintenir la cohérence des soldes
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_insert_membre_comptes_historique
AFTER INSERT ON membre_comptes_historique
FOR EACH ROW
BEGIN
    -- Mettre à jour le solde du membre dans la table members
    UPDATE members 
    SET solde = NEW.solde_apres 
    WHERE id = NEW.membre_id;
END //
DELIMITER ;

-- Insérer les données existantes depuis les opérations de crédit dans caisse_historique
INSERT INTO membre_comptes_historique (
    club_id, 
    membre_id, 
    user_id, 
    type_operation, 
    montant, 
    solde_avant, 
    solde_apres, 
    description, 
    reference_caisse_historique_id, 
    date_operation
)
SELECT 
    ch.club_id,
    ch.membre_id,
    ch.user_id,
    CASE 
        WHEN ch.type_operation = 'credit' THEN 'credit'
        WHEN ch.type_operation = 'transfert' AND ch.montant_encaissement > 0 THEN 'transfert_caisse_vers_compte'
        WHEN ch.type_operation = 'transfert' AND ch.montant_retrait > 0 THEN 'transfert_compte_vers_caisse'
        ELSE 'credit'
    END as type_operation,
    CASE 
        WHEN ch.montant_encaissement > 0 THEN ch.montant_encaissement
        WHEN ch.montant_retrait > 0 THEN -ch.montant_retrait
        ELSE ch.montant
    END as montant,
    0.00 as solde_avant, -- À recalculer si nécessaire
    0.00 as solde_apres, -- À recalculer si nécessaire
    ch.description,
    ch.id as reference_caisse_historique_id,
    ch.date_operation
FROM caisse_historique ch
WHERE ch.membre_id IS NOT NULL 
AND ch.type_operation IN ('credit', 'transfert')
AND NOT EXISTS (
    SELECT 1 FROM membre_comptes_historique mch 
    WHERE mch.reference_caisse_historique_id = ch.id
);

-- Recalculer les soldes avant et après pour les enregistrements insérés
UPDATE membre_comptes_historique mch
SET 
    solde_avant = (
        SELECT COALESCE(SUM(montant), 0.00)
        FROM membre_comptes_historique mch2
        WHERE mch2.membre_id = mch.membre_id 
        AND mch2.date_operation < mch.date_operation
        AND mch2.id < mch.id
    ),
    solde_apres = (
        SELECT COALESCE(SUM(montant), 0.00)
        FROM membre_comptes_historique mch3
        WHERE mch3.membre_id = mch.membre_id 
        AND (mch3.date_operation < mch.date_operation OR 
             (mch3.date_operation = mch.date_operation AND mch3.id <= mch.id))
    )
WHERE mch.solde_avant = 0.00 AND mch.solde_apres = 0.00;