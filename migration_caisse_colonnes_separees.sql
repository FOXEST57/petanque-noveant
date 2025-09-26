-- Migration pour séparer les colonnes montant en montant_encaissement et montant_retrait
-- Date: 2025-01-25

-- Étape 1: Ajouter les nouvelles colonnes
ALTER TABLE caisse_historique 
ADD COLUMN montant_encaissement DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN montant_retrait DECIMAL(10,2) DEFAULT 0.00;

-- Étape 2: Migrer les données existantes
-- Les montants positifs vont dans montant_encaissement
UPDATE caisse_historique 
SET montant_encaissement = montant 
WHERE montant > 0;

-- Les montants négatifs (en valeur absolue) vont dans montant_retrait
UPDATE caisse_historique 
SET montant_retrait = ABS(montant) 
WHERE montant < 0;

-- Les montants égaux à 0 restent à 0 dans les deux colonnes (déjà par défaut)

-- Étape 3: Vérification des données migrées
-- Cette requête permet de vérifier que la migration s'est bien passée
SELECT 
    id,
    type_operation,
    montant as ancien_montant,
    montant_encaissement,
    montant_retrait,
    description,
    date_operation
FROM caisse_historique 
ORDER BY date_operation DESC 
LIMIT 10;

-- Étape 4: Une fois la migration vérifiée, on peut supprimer l'ancienne colonne
-- ATTENTION: Décommentez cette ligne seulement après avoir vérifié que tout fonctionne
-- ALTER TABLE caisse_historique DROP COLUMN montant;

-- Étape 5: Ajouter des contraintes pour s'assurer de la cohérence des données
-- Un enregistrement ne peut pas avoir à la fois un encaissement et un retrait
-- ALTER TABLE caisse_historique 
-- ADD CONSTRAINT chk_montant_exclusif 
-- CHECK ((montant_encaissement > 0 AND montant_retrait = 0) OR (montant_encaissement = 0 AND montant_retrait > 0) OR (montant_encaissement = 0 AND montant_retrait = 0));