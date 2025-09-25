import { initDatabase, closeDatabase, getHomeCarouselImages } from '../src/lib/database.js';

// Script pour vérifier les données du carrousel pour le club noveant
const checkCarouselData = async () => {
  try {
    console.log('🔄 Initialisation de la base de données...');
    await initDatabase();
    
    // Vérifier les images du carrousel pour le club noveant (ID: 2)
    console.log('🔍 Vérification des images du carrousel pour le club noveant (ID: 2)...');
    const noveantImages = await getHomeCarouselImages(2);
    console.log(`✅ Trouvé ${noveantImages.length} images pour le club noveant`);
    
    if (noveantImages.length > 0) {
      console.log('\n📋 Images du carrousel pour le club noveant:');
      noveantImages.forEach((img, index) => {
        console.log(`  ${index + 1}. ID: ${img.id}, URL: ${img.image_url}, Titre: ${img.title || 'Aucun'}, Ordre: ${img.display_order}`);
      });
    } else {
      console.log('⚠️ Aucune image trouvée pour le club noveant');
    }
    
    // Vérifier aussi pour le club par défaut (ID: 1) pour comparaison
    console.log('\n🔍 Vérification des images du carrousel pour le club par défaut (ID: 1)...');
    const defaultImages = await getHomeCarouselImages(1);
    console.log(`✅ Trouvé ${defaultImages.length} images pour le club par défaut`);
    
    if (defaultImages.length > 0) {
      console.log('\n📋 Images du carrousel pour le club par défaut:');
      defaultImages.forEach((img, index) => {
        console.log(`  ${index + 1}. ID: ${img.id}, URL: ${img.image_url}, Titre: ${img.title || 'Aucun'}, Ordre: ${img.display_order}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
  } finally {
    await closeDatabase();
  }
};

// Exécuter la vérification
checkCarouselData();