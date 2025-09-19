-- Insertion des paramètres par défaut pour site_settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES
('primary_color', '#425e9b', 'string', 'Couleur principale du site'),
('site_name', 'Club de Pétanque', 'string', 'Nom du site'),
('site_subtitle', 'Bienvenue dans notre club', 'string', 'Sous-titre du site'),
('club_name', 'Club de Pétanque de Noveant', 'string', 'Nom officiel du club'),
('ffpjp_id', '', 'string', 'Identifiant FFPJP du club'),
('club_address', '', 'string', 'Adresse du club'),
('club_phone', '', 'string', 'Téléphone du club'),
('club_email', '', 'string', 'Email de contact du club'),
('facebook_url', '', 'string', 'Lien vers la page Facebook'),
('instagram_url', '', 'string', 'Lien vers le compte Instagram'),
('logo_url', '', 'string', 'URL du logo du club'),
('favicon_url', '', 'string', 'URL du favicon du site')
ON DUPLICATE KEY UPDATE 
    setting_value = VALUES(setting_value),
    updated_at = CURRENT_TIMESTAMP;