import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant',
};

const JWT_SECRET = 'votre-cle-secrete-jwt-tres-longue-et-complexe-changez-moi-dev-2024';

async function getValidToken() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Récupérer un utilisateur admin
    const [users] = await connection.execute(
      'SELECT id, email, club_id, role FROM users WHERE role IN ("president", "vice_president") LIMIT 1'
    );
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur admin trouvé');
      return;
    }
    
    const user = users[0];
    console.log('✅ Utilisateur trouvé:', user);
    
    // Créer un token JWT valide
    const token = jwt.sign(
      { 
        userId: user.id, 
        clubId: user.club_id || 1,
        email: user.email, 
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('✅ Token JWT créé:', token);
    
    await connection.end();
    return token;
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

getValidToken();