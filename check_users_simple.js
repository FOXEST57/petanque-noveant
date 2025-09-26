import mysql from 'mysql2/promise';

async function checkUsers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'petanque_noveant'
    });

    const [clubs] = await connection.execute('SELECT id, nom, subdomain FROM clubs');
    
    console.log('Clubs disponibles:');
    clubs.forEach(club => {
      console.log(`- ID: ${club.id}, Nom: ${club.nom}, Sous-domaine: ${club.subdomain}`);
    });

    await connection.end();
  } catch (error) {
    console.error('Erreur:', error.message);
  }
}

checkUsers();