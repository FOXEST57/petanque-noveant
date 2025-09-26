-- Script pour ajouter la colonne designation_principale à la table caisse_historique

USE petanque_noveant;

-- Ajouter la colonne designation_principale après la colonne description
ALTER TABLE caisse_historique 
ADD COLUMN designation_principale VARCHAR(100) NULL 
AFTER description;

-- Mettre à jour les enregistrements existants avec des désignations principales appropriées
UPDATE caisse_historique 
SET designation_principale = CASE 
    WHEN type_operation = 'credit' THEN 'Crédit membre'
    WHEN type_operation = 'ajout_especes' THEN 'Ajout espèces'
    WHEN type_operation = 'transfert' THEN 'Transfert'
    WHEN type_operation = 'fond' THEN 'Fond de caisse'
    WHEN type_operation = 'depense' THEN 'Dépense'
    WHEN type_operation = 'transfert_bancaire' THEN 'Transfert bancaire'
    ELSE 'Opération'
END
WHERE designation_principale IS NULL;