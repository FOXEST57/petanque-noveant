import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env') });

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petanque_noveant',
};

// Validation de l'email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validation du mot de passe fort
function isStrongPassword(password) {
  // Au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
}

// Fonction principale
async function createSuperAdminSimple() {
  console.log('\n=== CRÉATION RAPIDE D\'UN COMPTE SUPER ADMINISTRATEUR ===\n');
  
  // Paramètres par défaut (vous pouvez les modifier ici)
  const userData = {
    nom: 'Super',
    prenom: 'Admin',
    email: 'superadmin@petanque-club.fr',
    telephone: '06.00.00.00.00',
    password: 'SuperAdmin123!',
    clubId: 1 // ID du club par défaut
  };
  
  // Permettre la personnalisation via les arguments de ligne de commande
  const args = process.argv.slice(2);
  if (args.length >= 5) {
    userData.nom = args[0];
    userData.prenom = args[1];
    userData.email = args[2];
    userData.telephone = args[3];
    userData.password = args[4];
    if (args[5]) userData.clubId = parseInt(args[5]);
  }
  
  console.log('Utilisation:');
  console.log('node create_super_admin_simple.js [nom] [prenom] [email] [telephone] [password] [clubId]');
  console.log('\nOu laissez vide pour utiliser les valeurs par défaut.\n');
  
  try {
    // Validation des données
    if (!isValidEmail(userData.email)) {
      console.log('❌ Format d\'email invalide:', userData.email);
      return;
    }
    
    if (!isStrongPassword(userData.password)) {
      console.log('❌ Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
      console.log('Mot de passe fourni:', userData.password);
      return;
    }
    
    // Connexion à la base de données
    console.log('Connexion à la base de données...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connexion réussie\n');
    
    // Vérifier que la colonne is_super_admin existe
    const [columns] = await connection.execute('DESCRIBE users');
    const hasSuperAdminColumn = columns.some(col => col.Field === 'is_super_admin');
    
    if (!hasSuperAdminColumn) {
      console.log('❌ Erreur: La colonne is_super_admin n\'existe pas dans la table users.');
      console.log('Veuillez d\'abord exécuter la migration super_admin.sql');
      await connection.end();
      return;
    }
    
    // Vérifier si l'email existe déjà
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?', [userData.email]
    );
    if (existingUsers.length > 0) {
      console.log('❌ Cet email existe déjà dans la base de données:', userData.email);
      await connection.end();
      return;
    }
    
    // Vérifier que le club existe
    const [clubs] = await connection.execute(
      'SELECT id, nom, ville FROM clubs WHERE id = ?', [userData.clubId]
    );
    if (clubs.length === 0) {
      console.log('❌ Club avec l\'ID', userData.clubId, 'introuvable.');
      console.log('Clubs disponibles:');
      const [allClubs] = await connection.execute('SELECT id, nom, ville FROM clubs ORDER BY nom');
      allClubs.forEach(club => {
        console.log(`- ID: ${club.id}, Nom: ${club.nom} (${club.ville})`);
      });
      await connection.end();
      return;
    }
    
    // Hashage du mot de passe
    console.log('Hashage du mot de passe...');
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(userData.password, saltRounds);
    
    // Récapitulatif
    console.log('\n=== RÉCAPITULATIF ===');
    console.log(`Nom: ${userData.nom}`);
    console.log(`Prénom: ${userData.prenom}`);
    console.log(`Email: ${userData.email}`);
    console.log(`Téléphone: ${userData.telephone}`);
    console.log(`Club par défaut: ${clubs[0].nom} (${clubs[0].ville})`);
    console.log(`Rôle: Super Administrateur`);
    
    // Insertion en base de données
    console.log('\nCréation du compte...');
    
    const [result] = await connection.execute(`
      INSERT INTO users (
        club_id, nom, prenom, email, telephone, 
        password_hash, role, is_super_admin, statut
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userData.clubId, userData.nom, userData.prenom, userData.email, userData.telephone,
      passwordHash, 'president', true, 'actif'
    ]);
    
    console.log('\n✅ Compte super administrateur créé avec succès!');
    console.log(`ID utilisateur: ${result.insertId}`);
    console.log('\n=== INFORMATIONS DE CONNEXION ===');
    console.log(`Email: ${userData.email}`);
    console.log(`Mot de passe: ${userData.password}`);
    console.log('\nCe compte aura accès à tous les clubs via une liste déroulante après connexion.');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

// Lancement du script
createSuperAdminSimple().catch(console.error);
