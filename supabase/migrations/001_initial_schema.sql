-- Création de la table des utilisateurs (users)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('visitor', 'member', 'team_leader', 'admin')),
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création des index pour users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Activation RLS pour users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Création de la table des équipes (teams)
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    photo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création des index pour teams
CREATE INDEX idx_teams_category ON teams(category);

-- Activation RLS pour teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Création de la table des membres d'équipe (team_members)
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    position VARCHAR(50),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création des index pour team_members
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_team_id ON team_members(team_id);

-- Activation RLS pour team_members
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Création de la table des événements (events)
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('loto', 'repas', 'tournoi', 'championnat', 'autre')),
    event_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(200),
    max_participants INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création des index pour events
CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_type ON events(type);

-- Activation RLS pour events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Création de la table des inscriptions aux événements (event_registrations)
CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, event_id)
);

-- Création des index pour event_registrations
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);

-- Activation RLS pour event_registrations
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Création de la table des matchs (matches)
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team1_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    team2_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    team1_score INTEGER,
    team2_score INTEGER,
    match_date TIMESTAMP WITH TIME ZONE NOT NULL,
    championship VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activation RLS pour matches
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Création de la table des albums (albums)
CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activation RLS pour albums
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

-- Création de la table des photos (photos)
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    caption TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création des index pour photos
CREATE INDEX idx_photos_album_id ON photos(album_id);
CREATE INDEX idx_photos_event_id ON photos(event_id);

-- Activation RLS pour photos
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Permissions pour les rôles anon et authenticated
GRANT SELECT ON users TO anon;
GRANT ALL PRIVILEGES ON users TO authenticated;

GRANT SELECT ON teams TO anon;
GRANT ALL PRIVILEGES ON teams TO authenticated;

GRANT SELECT ON team_members TO anon;
GRANT ALL PRIVILEGES ON team_members TO authenticated;

GRANT SELECT ON events TO anon;
GRANT ALL PRIVILEGES ON events TO authenticated;

GRANT SELECT ON event_registrations TO authenticated;
GRANT ALL PRIVILEGES ON event_registrations TO authenticated;

GRANT SELECT ON matches TO anon;
GRANT ALL PRIVILEGES ON matches TO authenticated;

GRANT SELECT ON albums TO anon;
GRANT ALL PRIVILEGES ON albums TO authenticated;

GRANT SELECT ON photos TO anon;
GRANT ALL PRIVILEGES ON photos TO authenticated;

-- Insertion d'un administrateur par défaut
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES ('admin@petanque-noveant.fr', '$2b$10$hashedpassword', 'Admin', 'Club', 'admin');

-- Insertion d'équipes d'exemple
INSERT INTO teams (name, category, description) VALUES
('Les Vétérans', 'Vétérans', 'Équipe des joueurs expérimentés du club'),
('Les Jeunes Pousses', 'Juniors', 'Équipe de la relève du club'),
('Les Compétiteurs', 'Seniors', 'Équipe de compétition principale');

-- Insertion d'événements d'exemple
INSERT INTO events (title, description, type, event_date, location) VALUES
('Loto annuel', 'Grand loto du club avec de nombreux lots', 'loto', '2024-03-15 19:00:00+01', 'Salle des fêtes'),
('Repas champêtre', 'Repas convivial en plein air', 'repas', '2024-06-20 12:00:00+02', 'Terrain du club'),
('Tournoi de printemps', 'Tournoi interne du club', 'tournoi', '2024-04-10 14:00:00+02', 'Terrain du club');

-- Insertion d'albums d'exemple
INSERT INTO albums (title, description) VALUES
('Événements 2024', 'Photos des événements de l''année 2024'),
('Matchs de championnat', 'Photos des matchs de championnat'),
('Vie du club', 'Photos de la vie quotidienne du club');