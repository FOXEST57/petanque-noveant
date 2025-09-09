-- Création de la table carousel_images pour gérer les images du carrousel de la page d'accueil
CREATE TABLE carousel_images (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    image_url VARCHAR(500) NOT NULL,
    order_position INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour optimiser les requêtes par ordre de position
CREATE INDEX idx_carousel_images_order ON carousel_images(order_position);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_carousel_images_updated_at
    BEFORE UPDATE ON carousel_images
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Activer RLS (Row Level Security)
ALTER TABLE carousel_images ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture à tous (anon et authenticated)
CREATE POLICY "Allow read access for all users" ON carousel_images
    FOR SELECT USING (true);

-- Politique pour permettre toutes les opérations aux utilisateurs authentifiés
CREATE POLICY "Allow all operations for authenticated users" ON carousel_images
    FOR ALL USING (auth.role() = 'authenticated');

-- Accorder les permissions aux rôles
GRANT SELECT ON carousel_images TO anon;
GRANT ALL PRIVILEGES ON carousel_images TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE carousel_images_id_seq TO authenticated;