-- Migration pour ajouter les tables nécessaires aux fonctionnalités Admin
-- Créé le: $(date)

-- Table des types de membres
CREATE TABLE IF NOT EXISTS member_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    description TEXT,
    droits JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des membres
CREATE TABLE IF NOT EXISTS members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    adresse TEXT,
    telephone VARCHAR(20),
    email VARCHAR(255),
    numero_licence VARCHAR(50) UNIQUE,
    date_entree DATE,
    date_naissance DATE,
    type_membre_id UUID REFERENCES member_types(id) ON DELETE SET NULL,
    photo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des concours
CREATE TABLE IF NOT EXISTS concours (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    prix_inscription DECIMAL(10,2) DEFAULT 0,
    prix_a_gagner DECIMAL(10,2) DEFAULT 0,
    statut VARCHAR(20) DEFAULT 'planifie' CHECK (statut IN ('planifie', 'en_cours', 'termine', 'annule')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des lotos
CREATE TABLE IF NOT EXISTS lotos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    prix_carton DECIMAL(10,2) DEFAULT 0,
    lots_a_gagner TEXT,
    statut VARCHAR(20) DEFAULT 'planifie' CHECK (statut IN ('planifie', 'en_cours', 'termine', 'annule')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des boissons
CREATE TABLE IF NOT EXISTS drinks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    description TEXT,
    image_url VARCHAR(500),
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Modifier la table events existante pour ajouter les photos
ALTER TABLE events ADD COLUMN IF NOT EXISTS photos JSONB DEFAULT '[]'::jsonb;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_members_type_membre_id ON members(type_membre_id);
CREATE INDEX IF NOT EXISTS idx_members_numero_licence ON members(numero_licence);
CREATE INDEX IF NOT EXISTS idx_concours_date ON concours(date);
CREATE INDEX IF NOT EXISTS idx_lotos_date ON lotos(date);
CREATE INDEX IF NOT EXISTS idx_drinks_name ON drinks(name);

-- Activer RLS (Row Level Security) sur toutes les nouvelles tables
ALTER TABLE member_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE concours ENABLE ROW LEVEL SECURITY;
ALTER TABLE lotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE drinks ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour member_types
CREATE POLICY "Allow read access for authenticated users" ON member_types
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow full access for authenticated users" ON member_types
    FOR ALL TO authenticated USING (true);

-- Politiques RLS pour members
CREATE POLICY "Allow read access for authenticated users" ON members
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow full access for authenticated users" ON members
    FOR ALL TO authenticated USING (true);

-- Politiques RLS pour concours
CREATE POLICY "Allow read access for all users" ON concours
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow full access for authenticated users" ON concours
    FOR ALL TO authenticated USING (true);

-- Politiques RLS pour lotos
CREATE POLICY "Allow read access for all users" ON lotos
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow full access for authenticated users" ON lotos
    FOR ALL TO authenticated USING (true);

-- Politiques RLS pour drinks
CREATE POLICY "Allow read access for all users" ON drinks
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow full access for authenticated users" ON drinks
    FOR ALL TO authenticated USING (true);

-- Permissions pour les rôles anon et authenticated
GRANT SELECT ON member_types TO anon;
GRANT ALL PRIVILEGES ON member_types TO authenticated;

GRANT SELECT ON members TO anon;
GRANT ALL PRIVILEGES ON members TO authenticated;

GRANT SELECT ON concours TO anon;
GRANT ALL PRIVILEGES ON concours TO authenticated;

GRANT SELECT ON lotos TO anon;
GRANT ALL PRIVILEGES ON lotos TO authenticated;

GRANT SELECT ON drinks TO anon;
GRANT ALL PRIVILEGES ON drinks TO authenticated;

-- Données d'exemple pour les types de membres
INSERT INTO member_types (nom, description, droits) VALUES
('Membre Actif', 'Membre participant régulièrement aux activités', '["participer_concours", "voter_assemblees"]'),
('Membre Bureau', 'Membre du bureau dirigeant', '["participer_concours", "voter_assemblees", "gerer_membres", "organiser_evenements"]'),
('Membre Honoraire', 'Ancien membre méritant', '["participer_concours", "acces_special"]'),
('Membre Jeune', 'Membre de moins de 18 ans', '["participer_concours_jeunes"]')
ON CONFLICT DO NOTHING;

-- Données d'exemple pour les boissons
INSERT INTO drinks (name, price, description, stock) VALUES
('Bière Pression', 2.50, 'Bière pression 25cl', 50),
('Pastis', 3.00, 'Pastis 4cl', 20),
('Café', 1.50, 'Café expresso', 100),
('Coca-Cola', 2.00, 'Coca-Cola 33cl', 30),
('Eau Minérale', 1.00, 'Bouteille d\'eau 50cl', 40),
('Vin Rouge', 3.50, 'Verre de vin rouge local', 15),
('Jus d\'Orange', 2.20, 'Jus d\'orange frais 25cl', 25)
ON CONFLICT DO NOTHING;

-- Données d'exemple pour les concours
INSERT INTO concours (nom, date, description, prix_inscription, prix_a_gagner, statut) VALUES
('Concours de Printemps', '2024-04-15', 'Concours annuel de printemps en doublettes', 15.00, 200.00, 'planifie'),
('Championnat Club', '2024-06-20', 'Championnat interne du club', 20.00, 350.00, 'planifie'),
('Concours de la Fête', '2024-08-15', 'Concours lors de la fête du village', 12.00, 150.00,