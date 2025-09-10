-- Migration pour ajouter les tables home_content et home_carousel_images
-- Date: 2025-01-10

-- Table du contenu de la page d'accueil
CREATE TABLE IF NOT EXISTS home_content (
    id INT PRIMARY KEY DEFAULT 1,
    title VARCHAR(255) NOT NULL DEFAULT 'Bienvenue au Club de Pétanque de Noveant',
    description TEXT,
    schedules TEXT,
    contact TEXT,
    practical_info TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (id = 1) -- Assure qu'il n'y a qu'un seul enregistrement
);

-- Table des images du carrousel de la page d'accueil
CREATE TABLE IF NOT EXISTS home_carousel_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    home_content_id INT NOT NULL DEFAULT 1,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (home_content_id) REFERENCES home_content(id) ON DELETE CASCADE,
    INDEX idx_home_content_id (home_content_id),
    INDEX idx_display_order (display_order)
);

-- Insertion du contenu par défaut de la page d'accueil
INSERT IGNORE INTO home_content (id, title, description, schedules, contact, practical_info) VALUES
(1, 
 'Bienvenue au Club de Pétanque de Noveant', 
 'Découvrez notre club convivial situé au cœur de Noveant-sur-Moselle. Nous accueillons tous les passionnés de pétanque, débutants comme confirmés, dans une ambiance chaleureuse et sportive.',
 'Ouvert tous les jours de 14h à 18h\nEntraînements : Mardi et Jeudi 18h-20h\nCompétitions : Samedi après-midi',
 'Téléphone : 03 87 XX XX XX\nEmail : contact@petanque-noveant.fr\nAdresse : Place du Village, 57680 Noveant-sur-Moselle',
 'Parking gratuit disponible\nAccès handicapés\nVestiaires et sanitaires\nBuvette sur place');

SELECT 'Tables home_content et home_carousel_images créées avec succès!' as message;