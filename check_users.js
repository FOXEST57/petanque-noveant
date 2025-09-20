import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant'
};

async function createAdminUser() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    // D'abord vérifier la structure de la table users
    const [tableStructure] = await connection.execute('DESCRIBE users');
    console.log('Structure de la table users:');
    tableStructure.forEach(col => console.log(`- ${col.Field} (${col.Type})`));
    
    // Vérifier tous les utilisateurs avec les champs disponibles
    const [users] = await connection.execute('SELECT * FROM users');
    console.log('Utilisateurs existants:', users);
    
    // Vérifier les demandes d'adhésion
    const [requests] = await connection.execute('SELECT id, nom, prenom, email, statut, created_at FROM membership_requests ORDER BY created_at DESC LIMIT 5');
    console.log('Dernières demandes d\'adhésion:', requests);
    
    // Créer un utilisateur admin avec mot de passe
    const adminEmail = 'admin@petanque-noveant.fr';
    const adminPassword = 'admin123'; // Mot de passe temporaire
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Vérifier si l'admin existe déjà
    const [existingAdmin] = await connection.execute('SELECT id FROM users WHERE email = ?', [adminEmail]);
    
    if (existingAdmin.length === 0) {
      // Créer un utilisateur admin avec les champs disponibles
      await connection.execute(
        'INSERT INTO users (email, password_hash, role, statut) VALUES (?, ?, ?, ?)',
        [adminEmail, hashedPassword, 'president', 'actif']
      );
      console.log('✅ Utilisateur admin créé avec succès!');
      console.log('📧 Email: admin@petanque-noveant.fr');
      console.log('🔑 Mot de passe: admin123');
      console.log('⚠️  Changez ce mot de passe après la première connexion!');
    } else {
      console.log('ℹ️  Un utilisateur admin existe déjà');
      
      // Mettre à jour le mot de passe si nécessaire
      await connection.execute(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [hashedPassword, adminEmail]
      );
      console.log('🔄 Mot de passe admin mis à jour');
      console.log('📧 Email: admin@petanque-noveant.fr');
      console.log('🔑 Mot de passe: admin123');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAdminUser();