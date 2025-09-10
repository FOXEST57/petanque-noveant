-- Migration pour créer la table home_content
CREATE TABLE IF NOT EXISTS home_content (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    carousel_images JSON,
    opening_hours TEXT,
    contact TEXT,
    practical_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insérer une ligne par défaut
INSERT INTO home_content (id, title, description, carousel_images, opening_hours, contact, practical_info) 
VALUES (
    1, 
    'Bienvenue au Club de Pétanque de Noveant', 
    'Découvrez notre club convivial et participez à nos activités tout au long de l\'année.', 
    '[]', 
    'Ouvert tous les jours de 14h à 18h', 
    'Téléphone: 03 87 XX XX XX\nEmail: contact@petanque-noveant.fr', 
    'Parking gratuit disponible\nAccès handicapés'
) 
ON DUPLICATE KEY UPDATE id=id;