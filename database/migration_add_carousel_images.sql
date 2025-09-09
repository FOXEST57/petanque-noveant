-- Migration pour ajouter la table carousel_images
-- Table pour gérer les images du carrousel de la page d'accueil

CREATE TABLE IF NOT EXISTS carousel_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_display_order (display_order),
    INDEX idx_is_active (is_active)
);

-- Insertion de quelques images d'exemple
INSERT IGNORE INTO carousel_images (title, image_url, display_order, is_active) VALUES
('Image d\'accueil 1', '/image/fond.jpeg', 1, TRUE),
('Terrain de pétanque', '/image/AdobeStock_645053.jpeg', 2, TRUE),
('Compétition', '/image/AdobeStock_645162.jpeg', 3, TRUE);

SELECT 'Table carousel_images créée avec succès!' as message;