import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
};

async function checkUserClub() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Vérifier l'utilisateur ID 7
    console.log('=== Utilisateur ID 7 ===');
    const [user] = await connection.execute('SELECT * FROM users WHERE id = 7');
    console.log(user[0]);
    
    // Vérifier si cet utilisateur a accès au club 2
    console.log('\n=== Vérification de l\'accès au club ===');
    console.log(`Club ID de l'utilisateur: ${user[0]?.club_id}`);
    console.log(`Club requis: 2`);
    console.log(`Accès autorisé: ${user[0]?.club_id === 2 ? 'OUI' : 'NON'}`);
    
    await connection.end();
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

checkUserClub();