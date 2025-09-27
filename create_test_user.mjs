import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
});

console.log('👤 Création d\'un utilisateur de test');
console.log('===================================\n');

try {
  const email = 'test.transfert@noveant.com';
  const password = 'test123';
  const clubId = 2; // Club Noveant

  // Vérifier si l'utilisateur existe déjà
  const [existingUsers] = await connection.execute(
    'SELECT id FROM users WHERE email = ?',
    [email]
  );

  if (existingUsers.length > 0) {
    console.log('✅ Utilisateur existe déjà, mise à jour du mot de passe...');
    
    // Hasher le nouveau mot de passe
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Mettre à jour le mot de passe
    await connection.execute(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [passwordHash, email]
    );
    
    console.log(`✅ Mot de passe mis à jour pour ${email}`);
  } else {
    console.log('👤 Création d\'un nouvel utilisateur...');
    
    // Hasher le mot de passe
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Créer l'utilisateur
    const [result] = await connection.execute(
      `INSERT INTO users (club_id, nom, prenom, email, password_hash, role, statut) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [clubId, 'Test', 'Transfert', email, passwordHash, 'president', 'actif']
    );
    
    console.log(`✅ Utilisateur créé avec l'ID: ${result.insertId}`);
  }

  console.log('\n📋 Informations de connexion:');
  console.log(`   - Email: ${email}`);
  console.log(`   - Mot de passe: ${password}`);
  console.log(`   - Club: Noveant (ID: ${clubId})`);

  console.log('\n✅ Utilisateur de test prêt !');

} catch (error) {
  console.error('❌ Erreur:', error.message);
} finally {
  await connection.end();
}