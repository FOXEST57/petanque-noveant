import fetch from 'node-fetch';

async function testImageAccess() {
  try {
    // Tester l'accès à une photo d'événement connue
    const testImageUrl = 'http://localhost:3007/uploads/events/1757305824933_qtdbuawgjy.jpeg';
    console.log('🔍 Test accès image:', testImageUrl);
    
    const response = await fetch(testImageUrl, {
      headers: {
        'Host': 'noveant.localhost:3007'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    console.log('Content-Length:', response.headers.get('content-length'));
    
    if (response.status === 200) {
      console.log('✅ Image accessible');
    } else {
      console.log('❌ Image non accessible');
    }
    
    // Tester aussi avec l'URL construite par EventCarousel
    const carouselUrl = 'http://localhost:3007/uploads/events/1757305824933_qtdbuawgjy.jpeg';
    console.log('\n🔍 Test URL EventCarousel:', carouselUrl);
    
    const carouselResponse = await fetch(carouselUrl, {
      headers: {
        'Host': 'noveant.localhost:3007'
      }
    });
    
    console.log('Status:', carouselResponse.status);
    console.log('Content-Type:', carouselResponse.headers.get('content-type'));
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testImageAccess();