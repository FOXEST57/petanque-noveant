-- Création de la table banque
CREATE TABLE IF NOT EXISTS banque (
    id INT AUTO_INCREMENT PRIMARY KEY,
    club_id INT NOT NULL,
    nom VARCHAR(255) NOT NULL,
    adresse TEXT,
    iban VARCHAR(34),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE CASCADE,
    INDEX idx_club_id (club_id)
);

-- Insertion de la banque principale par défaut pour chaque club existant
INSERT INTO banque (club_id, nom, adresse, iban)
SELECT 
    id as club_id,
    'Banque Principale' as nom,
    'Adresse à renseigner' as adresse,
    'IBAN à renseigner' as iban
FROM clubs
WHERE NOT EXISTS (
    SELECT 1 FROM banque WHERE banque.club_id = clubs.id AND banque.nom = 'Banque Principale'
);