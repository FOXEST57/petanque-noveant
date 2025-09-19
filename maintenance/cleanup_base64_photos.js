import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// Configuration de la base de données MySQL
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

async function cleanupBase64Photos() {
  let pool = null;
  
  try {
    console.log('🚀 Démarrage du nettoyage des photos base64...');
    
    // Créer le pool de connexions
    pool = mysql.createPool(dbConfig);
    
    // Test de connexion
    const connection = await pool.getConnection();
    console.log('✅ Connexion à la base de données MySQL établie.');
    connection.release();
    
    // Rechercher les membres avec des données base64
    console.log('🔍 Recherche des membres avec des données base64...');
    const [membersWithBase64] = await pool.execute(
      "SELECT id, nom, prenom, LEFT(photo_url, 50) as photo_preview FROM members WHERE photo_url LIKE 'data:image%'"
    );
    
    console.log(`📊 Trouvé ${membersWithBase64.length} membre(s) avec des données base64:`);
    
    if (membersWithBase64.length > 0) {
      // Afficher les membres concernés
      membersWithBase64.forEach(member => {
        console.log(`- ID: ${member.id}, Nom: ${member.nom} ${member.prenom}, Photo: ${member.photo_preview}...`);
      });
      
      // Nettoyer les données base64
      console.log('\n🧹 Nettoyage des données base64...');
      const [result] = await pool.execute(
        "UPDATE members SET photo_url = NULL WHERE photo_url LIKE 'data:image%'"
      );
      
      console.log(`✅ ${result.affectedRows} photo(s) nettoyée(s)`);
    } else {
      console.log('✅ Aucune donnée base64 trouvée dans la table members');
    }
    
    // Vérifier les autres tables qui pourraient contenir des données base64
    console.log('\n🔍 Vérification des autres tables...');
    
    // Vérifier la table teams
    const [teamsWithBase64] = await pool.execute(
      "SELECT id, name, LEFT(photo_url, 50) as photo_preview FROM teams WHERE photo_url LIKE 'data:image%'"
    );
    
    if (teamsWithBase64.length > 0) {
      console.log(`📊 Trouvé ${teamsWithBase64.length} équipe(s) avec des données base64`);
      teamsWithBase64.forEach(team => {
        console.log(`- ID: ${team.id}, Nom: ${team.name}, Photo: ${team.photo_preview}...`);
      });
      
      const [teamResult] = await pool.execute(
        "UPDATE teams SET photo_url = NULL WHERE photo_url LIKE 'data:image%'"
      );
      console.log(`✅ ${teamResult.affectedRows} photo(s) d'équipe nettoyée(s)`);
    } else {
      console.log('✅ Aucune donnée base64 trouvée dans la table teams');
    }
    
    // Vérifier la table drinks
    const [drinksWithBase64] = await pool.execute(
      "SELECT id, name, LEFT(image_url, 50) as image_preview FROM drinks WHERE image_url LIKE 'data:image%'"
    );
    
    if (drinksWithBase64.length > 0) {
      console.log(`📊 Trouvé ${drinksWithBase64.length} boisson(s) avec des données base64`);
      drinksWithBase64.forEach(drink => {
        console.log(`- ID: ${drink.id}, Nom: ${drink.name}, Image: ${drink.image_preview}...`);
      });
      
      const [drinkResult] = await pool.execute(
        "UPDATE drinks SET image_url = NULL WHERE image_url LIKE 'data:image%'"
      );
      console.log(`✅ ${drinkResult.affectedRows} image(s) de boisson nettoyée(s)`);
    } else {
      console.log('✅ Aucune donnée base64 trouvée dans la table drinks');
    }
    
    console.log('\n🎉 Nettoyage terminé avec succès!');
    
  } catch (error) {
    console.error('💥 Erreur lors du nettoyage:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.end();
      console.log('🔌 Connexion fermée.');
    }
  }
  
  process.exit(0);
}

// Exécuter le script
cleanupBase64Photos();