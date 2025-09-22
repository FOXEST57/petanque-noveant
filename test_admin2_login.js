import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Configuration de la base de données
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant'
};

const JWT_SECRET = 'your-secret-key-here';

async function testAdmin2Login() {
  let connection;
  
  try {
    console.log('🔍 Test de connexion avec Admin2...');
    
    // Connexion à la base de données
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion à la base de données établie');
    
    // Vérifier l'existence d'Admin2
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE email = ?',
      ['admin2@test.com']
    );
    
    if (users.length === 0) {
      console.log('❌ Utilisateur Admin2 non trouvé');
      return;
    }
    
    const admin2 = users[0];
    console.log('✅ Utilisateur Admin2 trouvé:', {
      id: admin2.id,
      email: admin2.email,
      prenom: admin2.prenom,
      nom: admin2.nom,
      role: admin2.role,
      club_id: admin2.club_id
    });
    
    // Test de connexion avec le mot de passe
    const testPassword = 'admin123';
    const isPasswordValid = await bcrypt.compare(testPassword, admin2.password);
    
    if (!isPasswordValid) {
      console.log('❌ Mot de passe incorrect pour Admin2');
      console.log('🔧 Mise à jour du mot de passe...');
      
      // Hasher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      // Mettre à jour le mot de passe
      await connection.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, admin2.id]
      );
      
      console.log('✅ Mot de passe mis à jour');
    } else {
      console.log('✅ Mot de passe valide');
    }
    
    // Générer un token JWT
    const token = jwt.sign(
      { 
        userId: admin2.id, 
        email: admin2.email, 
        role: admin2.role,
        club_id: admin2.club_id 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('✅ Token JWT généré:', token.substring(0, 50) + '...');
    
    // Vérifier les permissions d'admin
    const isAdmin = admin2.role === 'president' || admin2.role === 'vice_president';
    console.log('🔐 Permissions admin:', isAdmin ? '✅ OUI' : '❌ NON');
    
    // Vérifier l'isolation par club
    console.log('🏛️ Club ID:', admin2.club_id);
    
    // Tester l'accès aux données du club
    const [