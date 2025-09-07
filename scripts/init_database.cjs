const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'petanque_noveant'
    });

    console.log('Connexion à MySQL établie');

    // Création des tables une par une
    const tables = [
      {
        name: 'member_types',
        sql: `CREATE TABLE IF NOT EXISTS member_types (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nom VARCHAR(100) NOT NULL UNIQUE,
          description TEXT,
          droits JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )`
      },
      {
        name: 'members',
        sql: `CREATE TABLE IF NOT EXISTS members (
          id INT AUTO_INCREMENT PRIMARY KEY,
          nom VARCHAR(100) NOT NULL,
          prenom VARCHAR(100) NOT NULL,
          adresse TEXT,
          telephone VARCHAR(20),
          email VARCHAR(255),
          numero_licence VARCHAR(50),
          date_entree DATE,
          date_naissance DATE,
          type_membre_id INT,
          photo_url VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (type_membre_id) REFERENCES member_types(id) ON DELETE SET NULL,
          INDEX idx_nom (nom),
          INDEX idx_prenom (prenom),
          INDEX idx_type_membre (type_membre_id)
        )`
      },
      {
        name: 'events',
        sql: `CREATE TABLE IF NOT EXISTS events (
          id INT AUTO_INCREMENT PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          date DATE NOT NULL,
          heure VARCHAR(10),
          lieu VARCHAR(255),
          publicCible VARCHAR(255),
          photos JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_date (date)
        )`
      },
      {
        name: 'event_photos',
        sql: `CREATE TABLE IF NOT EXISTS event_photos (
          id INT AUTO_INCREMENT PRIMARY KEY,
          event_id INT NOT NULL,
          filename VARCHAR(255) NOT NULL,
          original_name VARCHAR(255),
          file_path VARCHAR(500) NOT NULL,
          file_size INT,
          mime_type VARCHAR(100),
          upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
          INDEX idx_event_id (event_id)
        )`
      },
      {
        name: 'drinks',
        sql: `CREATE TABLE IF NOT EXISTS drinks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          description TEXT,
          image_url VARCHAR(500),
          stock INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_name (name)
        )`
      },
      {
        name: 'users',
        sql: `CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(100) NOT NULL UNIQUE,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('admin', 'member', 'guest') DEFAULT 'member',
          member_id INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
          INDEX idx_username (username),
          INDEX idx_email (email)
        )`
      },
      {
        name: 'teams',
        sql: `CREATE TABLE IF NOT EXISTS teams (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100),
          description TEXT,
          photo_url VARCHAR(500),
          competition VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_name (name),
          INDEX idx_category (category)
        )`
      },
      {
        name: 'team_members',
        sql: `CREATE TABLE IF NOT EXISTS team_members (
          id INT AUTO_INCREMENT PRIMARY KEY,
          team_id INT NOT NULL,
          member_id INT NOT NULL,
          role VARCHAR(100) DEFAULT 'Joueur',
          joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
          FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
          UNIQUE KEY unique_team_member (team_id, member_id),
          INDEX idx_team_id (team_id),
          INDEX idx_member_id (member_id)
        )`
      }
    ];

    // Créer chaque table
    for (const table of tables) {
      try {
        console.log(`Création de la table ${table.name}...`);
        await connection.execute(table.sql);
        console.log(`✓ Table ${table.name} créée`);
      } catch (error) {
        console.warn(`Avertissement pour ${table.name}:`, error.message);
      }
    }

    // Insertion des données de base
    console.log('\nInsertion des données de base...');
    
    // Types de membres
    await connection.execute(`
      INSERT IGNORE INTO member_types (nom, description, droits) VALUES
      ('Membre actif', 'Membre participant régulièrement aux activités', '{"vote": true, "competition": true}'),
      ('Membre honoraire', 'Ancien membre ayant rendu des services au club', '{"vote": true, "competition": false}'),
      ('Membre sympathisant', 'Personne soutenant le club sans participer activement', '{"vote": false, "competition": false}')
    `);
    console.log('✓ Types de membres insérés');

    // Membres d'exemple
    await connection.execute(`
      INSERT IGNORE INTO members (nom, prenom, adresse, telephone, email, numero_licence, date_entree, date_naissance, type_membre_id) VALUES
      ('Dupont', 'Jean', '123 Rue de la Paix, Noveant', '03.87.12.34.56', 'jean.dupont@email.com', 'LIC001', '2020-01-15', '1965-03-20', 1),
      ('Martin', 'Marie', '456 Avenue des Fleurs, Noveant', '03.87.65.43.21', 'marie.martin@email.com', 'LIC002', '2019-09-10', '1970-07-12', 1),
      ('Durand', 'Pierre', '789 Boulevard du Stade, Noveant', '03.87.98.76.54', 'pierre.durand@email.com', 'LIC003', '2021-03-05', '1958-11-30', 2)
    `);
    console.log('✓ Membres d\'exemple insérés');

    // Événements d'exemple
    await connection.execute(`
      INSERT IGNORE INTO events (title, description, date, heure, lieu, publicCible) VALUES
      ('Tournoi de Printemps', 'Tournoi annuel de pétanque pour tous les membres', '2024-04-15', '14:00', 'Terrain municipal de Noveant', 'Tous membres'),
      ('Assemblée Générale', 'Assemblée générale annuelle du club', '2024-03-20', '18:30', 'Salle des fêtes de Noveant', 'Tous membres'),
      ('Initiation Jeunes', 'Séance d''initiation à la pétanque pour les jeunes', '2024-05-10', '16:00', 'Terrain municipal de Noveant', 'Jeunes 8-16 ans')
    `);
    console.log('✓ Événements d\'exemple insérés');

    // Boissons d'exemple
    await connection.execute(`
      INSERT IGNORE INTO drinks (name, price, description, stock) VALUES
      ('Bière pression', 2.50, 'Bière locale à la pression', 50),
      ('Coca-Cola', 2.00, 'Boisson gazeuse', 30),
      ('Eau minérale', 1.50, 'Bouteille d''eau 50cl', 40),
      ('Café', 1.20, 'Café expresso', 100),
      ('Pastis', 3.00, 'Pastis traditionnel', 20)
    `);
    console.log('✓ Boissons d\'exemple insérées');

    // Équipes d'exemple
    const teams = [
      ['Les Boules d\'Or', 'Senior', 'Équipe principale du club composée des meilleurs joueurs', 'Championnat Départemental'],
      ['Les Jeunes Pousses', 'Junior', 'Équipe des jeunes talents du club', 'Coupe Régionale Jeunes'],
      ['Les Vétérans', 'Vétéran', 'Équipe des membres expérimentés', 'Tournoi des Vétérans']
    ];
    
    for (const team of teams) {
      await connection.execute(
        'INSERT IGNORE INTO teams (name, category, description, competition) VALUES (?, ?, ?, ?)',
        team
      );
    }
    console.log('✓ Équipes d\'exemple insérées');

    // Relations équipes-membres d'exemple
    await connection.execute(`
      INSERT IGNORE INTO team_members (team_id, member_id, role) VALUES
      (1, 1, 'Capitaine'),
      (1, 2, 'Joueur'),
      (2, 3, 'Entraîneur'),
      (3, 1, 'Joueur')
    `);
    console.log('✓ Relations équipes-membres insérées');

    // Vérification des tables créées
    const [tables_result] = await connection.execute('SHOW TABLES');
    console.log('\nTables dans la base de données:');
    tables_result.forEach(table => {
      console.log('-', Object.values(table)[0]);
    });

    await connection.end();
    console.log('\n✅ Initialisation terminée avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
}

initDatabase();