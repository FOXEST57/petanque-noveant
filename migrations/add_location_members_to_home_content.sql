-- Migration pour ajouter les colonnes location et members à la table home_content
-- Date: 2024-01-15

ALTER TABLE home_content 
ADD COLUMN location TEXT DEFAULT 'Terrain de pétanque de Noveant\n123 Rue de la Pétanque\n57680 Noveant-sur-Moselle\nFrance',
ADD COLUMN members TEXT DEFAULT 'Notre club compte actuellement 45 membres actifs\nNous accueillons tous les niveaux\nDe 16 à 85 ans\nAmbiance conviviale garantie';

-- Mettre à jour l'enregistrement existant avec des valeurs par défaut
UPDATE home_content 
SET 
  location = 'Terrain de pétanque de Noveant\n123 Rue de la Pétanque\n57680 Noveant-sur-Moselle\nFrance',
  members = 'Notre club compte actuellement 45 membres actifs\nNous accueillons tous les niveaux\nDe 16 à 85 ans\nAmbiance conviviale garantie'
WHERE id = 1;