-- Migration pour ajouter les champs de profil utilisateur
-- Date: 2025-01-21
-- Description: Ajout des champs d'adresse détaillée et de solde de compte à la table users

-- ========================================
-- 1. AJOUT DES CHAMPS D'ADRESSE
-- ========================================

-- Ajouter les champs d'adresse détaillée
ALTER TABLE users 
ADD COLUMN numero_rue VARCHAR(10) DEFAULT NULL COMMENT 'Numéro de rue',
ADD COLUMN rue VARCHAR(255) DEFAULT NULL COMMENT 'Nom de la rue',
ADD COLUMN code_postal VARCHAR(10) DEFAULT NULL COMMENT 'Code postal',
ADD COLUMN ville VARCHAR(100) DEFAULT NULL COMMENT 'Ville';

-- ========================================
-- 2. AJOUT DU CHAMP SOLDE
-- ========================================

-- Ajouter le champ solde de compte
ALTER TABLE users 
ADD COLUMN solde DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Solde du compte utilisateur en euros';

-- Créer un index sur le solde pour optimiser les requêtes
ALTER TABLE users ADD INDEX idx_solde (solde);

-- ========================================
-- 3. VÉRIFICATIONS
-- ========================================

-- Vérifier que les colonnes ont été ajoutées
DESCRIBE users;

-- Afficher un message de confirmation
SELECT 'Migration des champs de profil utilisateur terminée avec succès!' as message;