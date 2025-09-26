-- Ajout du champ solde à la table banque
ALTER TABLE banque ADD COLUMN solde DECIMAL(10,2) DEFAULT 0.00 AFTER iban;

-- Mise à jour de l'index pour inclure le solde si nécessaire
-- (Optionnel, selon les besoins de performance)