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

async function checkPicasso() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Vérifier le membre PICASSO
    const [rows] = await connection.execute('SELECT id, prenom, nom, surnom, club_id FROM members WHERE surnom = "PICASSO"');
    console.log('Membre PICASSO:', rows[0]);
    
    // Vérifier quel club correspond à noveant
    const [clubs] = await connection.execute('SELECT id, nom, subdomain FROM clubs WHERE subdomain = "noveant"');
    console.log('Club noveant:', clubs[0]);
    
    // Vérifier tous les clubs
    const [allClubs] = await connection.execute('SELECT id, nom, subdomain FROM clubs');
    console.log('\nTous les clubs:');
    console.table(allClubs);
    
    await connection.end();
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

checkPicasso();