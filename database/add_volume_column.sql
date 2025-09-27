-- Ajout du champ volume à la table drinks
ALTER TABLE drinks ADD COLUMN volume VARCHAR(50) DEFAULT NULL AFTER description;

-- Mise à jour de quelques boissons existantes avec des volumes par défaut
UPDATE drinks SET volume = '25 cl' WHERE name LIKE '%Bière%' OR name LIKE '%biere%';
UPDATE drinks SET volume = '15 cl' WHERE name LIKE '%Picon%';
UPDATE drinks SET volume = '12 cl' WHERE name LIKE '%Vin%' AND name LIKE '%Verre%';
UPDATE drinks SET volume = '75 cl' WHERE name LIKE '%Bouteille%' AND name LIKE '%Vin%';
UPDATE drinks SET volume = '50 cl' WHERE name LIKE '%Eau%';
UPDATE drinks SET volume = '5 cl' WHERE name LIKE '%Café%';
UPDATE drinks SET volume = '4 cl' WHERE name LIKE '%Pastis%';

-- Vérification de la structure de la table
DESCRIBE drinks;