import mysql from 'mysql2/promise';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant'
};

async function runMigration() {
  let connection;
  
  try {
    console.log('Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    
    // Vérifier si la colonne existe déjà
    console.log('Vérification de la structure de la table users...');
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM users LIKE 'is_super_admin'"
    );
    
    if (columns.length === 0) {
      console.log('Ajout de la colonne is_super_admin...');
      await connection.execute(
        "ALTER TABLE users ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE COMMENT 'Flag pour identifier les super administrateurs ayant accès à tous les clubs'"
      );
      
      console.log('Création de l\'index sur is_super_admin...');
      await connection.execute(
        "ALTER TABLE users ADD INDEX idx_is_super_admin (is_super_admin)"
      );
    } else {
      console.log('La colonne is_super_admin existe déjà.');
    }
    
    // Vérifier si l'utilisateur super admin existe
    console.log('Vérification de l\'utilisateur super admin...');
    const [existingUsers] = await connection.execute(
      "SELECT id FROM users WHERE email = 'superadmin@petanque-club.fr'"
    );
    
    if (existingUsers.length === 0) {
      console.log('Création de l\'utilisateur super admin...');
      // Générer un hash bcrypt pour le mot de passe 'SuperAdmin123!'
      const bcrypt = await import('bcrypt');
      const passwordHash = await bcrypt.hash('SuperAdmin123!', 10);
      
      await connection.execute(
        `INSERT INTO users (
          club_id, nom, prenom, email, telephone, password_hash, role, is_super_admin, statut
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [1, 'Super', 'Admin', 'superadmin@petanque-club.fr', '06.00.00.00.00', passwordHash, 'president', true, 'actif']
      );
    } else {
      console.log('Mise à jour de l\'utilisateur existant en super admin...');
      await connection.execute(
        "UPDATE users SET is_super_admin = TRUE WHERE email = 'superadmin@petanque-club.fr'"
      );
    }
    
    console.log('Migration terminée avec succès!');
    
    // Vérifier les résultats
    console.log('\nVérification des utilisateurs super admin:');
    const [superAdmins] = await connection.execute(
      'SELECT id, nom, prenom, email, role, is_super_admin, club_id FROM users WHERE is_super_admin = TRUE'
    );
    console.table(superAdmins);
    
    // Afficher tous les clubs disponibles
    console.log('\nClubs disponibles:');
    const [clubs] = await connection.execute(
      'SELECT id, nom, ville, subdomain FROM clubs ORDER BY nom'
    );
    console.table(clubs);
    
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();