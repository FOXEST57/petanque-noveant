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

async function getUser() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute('SELECT id, club_id, email, role FROM users WHERE statut = "actif" LIMIT 1');
    console.log('Utilisateur trouvé:', rows[0]);
    await connection.end();
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

getUser();