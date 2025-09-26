import mysql from 'mysql2/promise';

const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'petanque_noveant'
};

async function fixDatabaseStructure() {
    let connection;
    
    try {
        console.log('Connexion à la base de données...');
        connection = await mysql.createConnection(dbConfig);
        
        // Vérifier si la colonne fond_caisse existe dans la table clubs
        console.log('Vérification de l\'existence de la colonne fond_caisse dans clubs...');
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'petanque_noveant' 
            AND TABLE_NAME = 'clubs' 
            AND COLUMN_NAME = 'fond_caisse'
        `);
        
        if (columns.length > 0) {
            console.log('La colonne fond_caisse existe dans clubs. Suppression...');
            await connection.execute('ALTER TABLE clubs DROP COLUMN fond_caisse');
            console.log('✅ Colonne fond_caisse supprimée de la table clubs');
        } else {
            console.log('✅ La colonne fond_caisse n\'existe pas dans clubs');
        }
        
        // Vérifier la structure finale de clubs
        console.log('\nStructure finale de la table clubs:');
        const [clubsStructure] = await connection.execute('DESCRIBE clubs');
        clubsStructure.forEach(col => {
            console.log(`- ${col.Field}: ${col.Type}`);
        });
        
        // Vérifier que la table fond_caisse existe et contient des données
        console.log('\nVérification de la table fond_caisse:');
        const [fondCaisseStructure] = await connection.execute('DESCRIBE fond_caisse');
        console.log('Structure de fond_caisse:');
        fondCaisseStructure.forEach(col => {
            console.log(`- ${col.Field}: ${col.Type}`);
        });
        
        const [fondCaisseData] = await connection.execute('SELECT * FROM fond_caisse LIMIT 5');
        console.log('\nDonnées dans fond_caisse:');
        console.log(fondCaisseData);
        
        console.log('\n✅ Correction de la structure de la base de données terminée');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

fixDatabaseStructure();