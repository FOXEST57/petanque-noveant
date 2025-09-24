-- Insertion du club de démonstration
INSERT INTO clubs (nom, ville, subdomain, numero_ffpjp, adresse, telephone, email, created_at) 
VALUES ('Club Demo', 'Ville Demo', 'demo', '123456', '123 Rue Demo', '01.23.45.67.89', 'demo@club.fr', NOW())
ON DUPLICATE KEY UPDATE 
  nom = VALUES(nom),
  ville = VALUES(ville),
  numero_ffpjp = VALUES(numero_ffpjp),
  adresse = VALUES(adresse),
  telephone = VALUES(telephone),
  email = VALUES(email);

-- Vérification
SELECT * FROM clubs WHERE subdomain = 'demo';