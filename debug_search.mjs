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

async function debugSearch() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // 1. Vérifier tous les membres du club 2 (noveant)
    console.log('=== Tous les membres du club 2 (noveant) ===');
    const [allMembers] = await connection.execute(
      'SELECT id, prenom, nom, surnom, email, club_id FROM members WHERE club_id = 2'
    );
    console.table(allMembers);
    
    // 2. Recherche exacte par surnom
    console.log('\n=== Recherche exacte par surnom "PICASSO" ===');
    const [exactSearch] = await connection.execute(
      'SELECT id, prenom, nom, surnom, email, club_id FROM members WHERE club_id = 2 AND surnom = "PICASSO"'
    );
    console.table(exactSearch);
    
    // 3. Recherche insensible à la casse
    console.log('\n=== Recherche insensible à la casse par surnom "picasso" ===');
    const [caseInsensitive] = await connection.execute(
      'SELECT id, prenom, nom, surnom, email, club_id FROM members WHERE club_id = 2 AND LOWER(surnom) = LOWER("picasso")'
    );
    console.table(caseInsensitive);
    
    // 4. Recherche avec LIKE
    console.log('\n=== Recherche avec LIKE "%picasso%" ===');
    const [likeSearch] = await connection.execute(
      'SELECT id, prenom, nom, surnom, email, club_id FROM members WHERE club_id = 2 AND LOWER(surnom) LIKE LOWER("%picasso%")'
    );
    console.table(likeSearch);
    
    // 5. Vérifier les surnoms qui contiennent "pic"
    console.log('\n=== Surnoms contenant "pic" ===');
    const [picSearch] = await connection.execute(
      'SELECT id, prenom, nom, surnom, email, club_id FROM members WHERE club_id = 2 AND LOWER(surnom) LIKE LOWER("%pic%")'
    );
    console.table(picSearch);
    
    await connection.end();
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

debugSearch();