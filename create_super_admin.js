import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import readline from 'readline';
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

// Interface pour les questions
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction pour poser une question
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

// Fonction pour masquer la saisie du mot de passe
function questionPassword(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    
    process.stdin.on('data', function(char) {
      char = char + '';
      
      switch(char) {
        case '\n':
        case '\r':
        case '\u0004': // Ctrl+D
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003': // Ctrl+C
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

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

// Validation du téléphone
function isValidPhone(phone) {
  const phoneRegex = /^(?:(?:\+33|0)[1-9](?:[0-9]{8})|(?:0[1-9](?:\.[0-9]{2}){4}))$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Fonction principale
async function createSuperAdmin() {
  console.log('\n=== CRÉATION D\'UN COMPTE SUPER ADMINISTRATEUR ===\n');
  console.log('Ce script vous permet de créer un compte super administrateur');
  console.log('qui aura accès à tous les clubs via une liste déroulante.\n');
  
  try {
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
      rl.close();
      return;
    }
    
    // Collecte des informations
    let nom, prenom, email, telephone, password, clubId;
    
    // Nom
    do {
      nom = await question('Nom: ');
      if (!nom.trim()) {
        console.log('❌ Le nom est obligatoire.');
      }
    } while (!nom.trim());
    
    // Prénom
    do {
      prenom = await question('Prénom: ');
      if (!prenom.trim()) {
        console.log('❌ Le prénom est obligatoire.');
      }
    } while (!prenom.trim());
    
    // Email
    do {
      email = await question('Email: ');
      if (!email.trim()) {
        console.log('❌ L\'email est obligatoire.');
      } else if (!isValidEmail(email)) {
        console.log('❌ Format d\'email invalide.');
      } else {
        // Vérifier si l'email existe déjà
        const [existingUsers] = await connection.execute(
          'SELECT id FROM users WHERE email = ?', [email]
        );
        if (existingUsers.length > 0) {
          console.log('❌ Cet email existe déjà dans la base de données.');
          email = '';
        }
      }
    } while (!email.trim() || !isValidEmail(email));
    
    // Téléphone
    do {
      telephone = await question('Téléphone (format: 06.12.34.56.78 ou +33612345678): ');
      if (!telephone.trim()) {
        console.log('❌ Le téléphone est obligatoire.');
      } else if (!isValidPhone(telephone)) {
        console.log('❌ Format de téléphone invalide.');
      }
    } while (!telephone.trim() || !isValidPhone(telephone));
    
    // Mot de passe
    do {
      password = await questionPassword('Mot de passe (min 8 car., maj, min, chiffre, spécial): ');
      if (!password.trim()) {
        console.log('❌ Le mot de passe est obligatoire.');
      } else if (!isStrongPassword(password)) {
        console.log('❌ Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
      }
    } while (!password.trim() || !isStrongPassword(password));
    
    // Confirmation du mot de passe
    const confirmPassword = await questionPassword('Confirmer le mot de passe: ');
    if (password !== confirmPassword) {
      console.log('❌ Les mots de passe ne correspondent pas.');
      await connection.end();
      rl.close();
      return;
    }
    
    // Sélection du club par défaut
    console.log('\n--- Sélection du club par défaut ---');
    const [clubs] = await connection.execute('SELECT id, nom, ville FROM clubs ORDER BY nom');
    
    if (clubs.length === 0) {
      console.log('❌ Aucun club trouvé dans la base de données.');
      await connection.end();
      rl.close();
      return;
    }
    
    console.log('\nClubs disponibles:');
    clubs.forEach((club, index) => {
      console.log(`${index + 1}. ${club.nom} (${club.ville}) - ID: ${club.id}`);
    });
    
    do {
      const clubChoice = await question('\nChoisissez le club par défaut (numéro): ');
      const clubIndex = parseInt(clubChoice.trim()) - 1;
      
      if (isNaN(clubIndex) || clubIndex < 0 || clubIndex >= clubs.length) {
        console.log('❌ Choix invalide. Veuillez entrer un numéro entre 1 et ' + clubs.length);
        clubId = null;
      } else {
        clubId = clubs[clubIndex].id;
        console.log(`✅ Club sélectionné: ${clubs[clubIndex].nom}`);
        break;
      }
    } while (!clubId);
    
    // Hashage du mot de passe
    console.log('\nHashage du mot de passe...');
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Récapitulatif
    console.log('\n=== RÉCAPITULATIF ===');
    console.log(`Nom: ${nom}`);
    console.log(`Prénom: ${prenom}`);
    console.log(`Email: ${email}`);
    console.log(`Téléphone: ${telephone}`);
    console.log(`Club par défaut: ${clubs.find(c => c.id === clubId).nom}`);
    console.log(`Rôle: Super Administrateur`);
    
    const confirm = await question('\nConfirmer la création du compte ? (oui/non): ');
    
    if (confirm.toLowerCase() !== 'oui' && confirm.toLowerCase() !== 'o') {
      console.log('❌ Création annulée.');
      await connection.end();
      rl.close();
      return;
    }
    
    // Insertion en base de données
    console.log('\nCréation du compte...');
    
    const [result] = await connection.execute(`
      INSERT INTO users (
        club_id, nom, prenom, email, telephone, 
        password_hash, role, is_super_admin, statut
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      clubId, nom, prenom, email, telephone,
      passwordHash, 'president', true, 'actif'
    ]);
    
    console.log('\n✅ Compte super administrateur créé avec succès!');
    console.log(`ID utilisateur: ${result.insertId}`);
    console.log('\n=== INFORMATIONS DE CONNEXION ===');
    console.log(`Email: ${email}`);
    console.log(`Mot de passe: [celui que vous avez saisi]`);
    console.log('\nCe compte aura accès à tous les clubs via une liste déroulante après connexion.');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    rl.close();
  }
}

// Gestion de l'interruption Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n❌ Création annulée par l\'utilisateur.');
  rl.close();
  process.exit(0);
});

// Lancement du script
createSuperAdmin().catch(console.error);