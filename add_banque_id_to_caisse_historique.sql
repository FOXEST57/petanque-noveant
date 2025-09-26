-- Script SQL pour ajouter la colonne banque_id à la table caisse_historique

USE petanque_noveant;

-- Ajouter la colonne banque_id à la table caisse_historique si elle n'existe pas
ALTER TABLE caisse_historique 
ADD COLUMN IF NOT EXISTS banque_id INT NULL,
ADD CONSTRAINT fk_caisse_historique_banque 
FOREIGN KEY (banque_id) REFERENCES banque(id) ON DELETE SET NULL;

-- Créer un index sur banque_id pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_caisse_historique_banque_id ON caisse_historique(banque_id);

SELECT 'Colonne banque_id ajoutée à la table caisse_historique avec succès' as message;