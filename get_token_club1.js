import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'petanque_noveant',
};

const JWT_SECRET = 'votre-cle-secrete-jwt-tres-longue-et-complexe-changez-moi-dev-2024';

async function getTokenClub1() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Récupérer un utilisateur admin du club 1
    const [users] = await connection.execute(
      'SELECT id, email, club_id, role FROM users WHERE club_id = 1 AND role IN ("president", "vice_president") LIMIT 1'
    );
    
    if (users.length === 0) {
      console.log('❌ Aucun utilisateur admin du club 1 trouvé');
      return;
    }
    
    const user = users[0];
    console.log('✅ Utilisateur du club 1 trouvé:', user);
    
    // Créer un token JWT valide pour le club 1
    const token = jwt.sign(
      { 
        userId: user.id, 
        clubId: user.club_id,
        email: user.email, 
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    console.log('✅ Token JWT pour le club 1:', token);
    
    await connection.end();
    return token;
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

getTokenClub1();