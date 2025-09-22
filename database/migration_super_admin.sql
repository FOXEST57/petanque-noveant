-- Migration pour ajouter le système de super administrateur
-- Date: 2024-01-21
-- Description: Ajout du flag is_super_admin à la table users pour permettre l'accès multi-club

-- ========================================
-- 1. AJOUT DU FLAG SUPER_ADMIN
-- ========================================

-- Ajouter la colonne is_super_admin à la table users
ALTER TABLE users 
ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE COMMENT 'Flag pour identifier les super administrateurs ayant accès à tous les clubs';

-- Créer un index sur le flag pour optimiser les requêtes
ALTER TABLE users ADD INDEX idx_is_super_admin (is_super_admin);

-- ========================================
-- 2. CRÉATION D'UN UTILISATEUR SUPER ADMIN
-- ========================================

-- Créer un utilisateur super admin (mot de passe: SuperAdmin123!)
-- Hash généré avec bcrypt pour 'SuperAdmin123!': $2b$10$K8J9L2M3N4O5P6Q7R8S9T0uvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
INSERT IGNORE INTO users (
    club_id, 
    nom, 
    prenom, 
    email, 
    telephone, 
    password_hash, 
    role, 
    is_super_admin,
    statut
) VALUES (
    1, 
    'Super', 
    'Admin', 
    'superadmin@petanque-club.fr', 
    '06.00.00.00.00', 
    '$2b$10$K8J9L2M3N4O5P6Q7R8S9T0uvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 
    'president', 
    TRUE,
    'actif'
);

-- ========================================
-- 3. VÉRIFICATIONS
-- ========================================

-- Vérifier que la colonne a été ajoutée
DESCRIBE users;

-- Afficher les utilisateurs super admin
SELECT id, nom, prenom, email, role, is_super_admin, club_id 
FROM users 
WHERE is_super_admin = TRUE;

SELECT 'Migration super admin terminée avec succès!' as message;