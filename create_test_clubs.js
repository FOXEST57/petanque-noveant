import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant'
};

const testClubs = [
  {
    nom: 'Pétanque Marseillaise',
    numero_ffpjp: '1302',
    subdomain: 'marseille',
    ville: 'Marseille',
    adresse: '45 Avenue du Prado, 13008 Marseille',
    telephone: '04.91.22.33.44',
    email: 'contact@petanque-marseille.fr',
    description: 'Club historique de pétanque marseillaise fondé en 1952. Ambiance provençale garantie !'
  },
  {
    nom: 'Boule Lyonnaise',
    numero_ffpjp: '6903',
    subdomain: 'lyon',
    ville: 'Lyon',
    adresse: '12 Rue de la République, 69002 Lyon',
    telephone: '04.78.55.66.77',
    email: 'info@boule-lyonnaise.fr',
    description: 'Club dynamique au cœur de Lyon, spécialisé dans la pétanque et la lyonnaise depuis 1968.'
  },
  {
    nom: 'AS Pétanque Toulousaine',
    numero_ffpjp: '3104',
    subdomain: 'toulouse',
    ville: 'Toulouse',
    adresse: '88 Boulevard de Strasbourg, 31000 Toulouse',
    telephone: '05.61.44.55.66',
    email: 'contact@petanque-toulouse.fr',
    description: 'Association sportive de pétanque toulousaine. Venez découvrir la convivialité du Sud-Ouest !'
  },
  {
    nom: 'Club Bouliste Niçois',
    numero_ffpjp: '0605',
    subdomain: 'nice',
    ville: 'Nice',
    adresse: '25 Promenade des Anglais, 06000 Nice',
    telephone: '04.93.77.88.99',
    email: 'secretariat@bouliste-nice.fr',
    description: 'Club de pétanque niçois avec vue sur la Méditerranée. Cadre exceptionnel pour jouer !'
  },
  {
    nom: 'Pétanque Club Strasbourgeois',
    numero_ffpjp: '6706',
    subdomain: 'strasbourg',
    ville: 'Strasbourg',
    adresse: '15 Place Kléber, 67000 Strasbourg',
    telephone: '03.88.11.22.33',
    email: 'admin@petanque-strasbourg.fr',
    description: 'Club alsacien de pétanque alliant tradition française et convivialité européenne depuis 1975.'
  }
];

async function createTestClubs() {
  let connection;
  
  try {
    console.log('Connexion à la base de données...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('Ajout des clubs de test...');
    
    for (const club of testClubs) {
      try {
        const [result] = await connection.execute(
          `INSERT INTO clubs (nom, numero_ffpjp, subdomain, ville, adresse, telephone, email, description) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            club.nom,
            club.numero_ffpjp,
            club.subdomain,
            club.ville,
            club.adresse,
            club.telephone,
            club.email,
            club.description
          ]
        );
        
        console.log(`✅ Club "${club.nom}" ajouté avec l'ID: ${result.insertId}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  Club "${club.nom}" existe déjà (numéro FFPJP ou sous-domaine en doublon)`);
        } else {
          console.error(`❌ Erreur lors de l'ajout du club "${club.nom}":`, error.message);
        }
      }
    }
    
    // Vérifier le nombre total de clubs
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM clubs');
    console.log(`\n📊 Nombre total de clubs dans la base: ${countResult[0].total}`);
    
    // Afficher tous les clubs
    const [clubs] = await connection.execute('SELECT id, nom, ville, numero_ffpjp FROM clubs ORDER BY id');
    console.log('\n📋 Liste des clubs:');
    clubs.forEach(club => {
      console.log(`   ${club.id}. ${club.nom} (${club.ville}) - ${club.numero_ffpjp}`);
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connexion fermée.');
    }
  }
}

// Exécuter le script
createTestClubs().then(() => {
  console.log('\n✨ Script terminé ! Vous pouvez maintenant tester la modale de sélection de club.');
}).catch(error => {
  console.error('💥 Erreur fatale:', error);
  process.exit(1);
});