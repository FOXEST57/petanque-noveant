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

// Reproduire exactement la fonction getMembers
const getMembers = async (clubId = 1) => {
  const connection = await mysql.createConnection(dbConfig);
  
  const [rows] = await connection.execute(`
    SELECT m.*, mt.nom as type_nom,
           CASE WHEN u.id IS NOT NULL THEN 1 ELSE 0 END as has_user_account,
           COALESCE(m.solde, 0) as solde_compte
    FROM members m 
    LEFT JOIN member_types mt ON m.type_membre_id = mt.id 
    LEFT JOIN users u ON m.email = u.email AND u.statut = 'actif'
    WHERE m.club_id = ?
    ORDER BY m.nom, m.prenom
  `, [clubId]);
  
  await connection.end();
  return rows;
};

async function testGetMembers() {
  try {
    console.log('=== Test de la fonction getMembers pour le club 2 ===');
    const members = await getMembers(2);
    
    console.log(`Nombre total de membres: ${members.length}`);
    console.table(members.map(m => ({
      id: m.id,
      prenom: m.prenom,
      nom: m.nom,
      surnom: m.surnom,
      email: m.email
    })));
    
    // Recherche de PICASSO
    console.log('\n=== Recherche de PICASSO dans les résultats ===');
    const picassoMember = members.find(m => m.surnom === 'PICASSO');
    if (picassoMember) {
      console.log('✅ PICASSO trouvé:', picassoMember);
    } else {
      console.log('❌ PICASSO non trouvé');
    }
    
    // Test du filtrage comme dans l'API
    console.log('\n=== Test du filtrage avec "picasso" ===');
    const searchTerm = 'picasso';
    const filteredMembers = members.filter((member) => 
      member.prenom?.toLowerCase().includes(searchTerm) ||
      member.nom?.toLowerCase().includes(searchTerm) ||
      member.surnom?.toLowerCase().includes(searchTerm) ||
      member.email?.toLowerCase().includes(searchTerm)
    );
    
    console.log(`Membres filtrés: ${filteredMembers.length}`);
    console.table(filteredMembers.map(m => ({
      id: m.id,
      prenom: m.prenom,
      nom: m.nom,
      surnom: m.surnom,
      email: m.email
    })));
    
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

testGetMembers();