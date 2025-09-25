import fetch from 'node-fetch';

async function testUpdateEvent() {
  try {
    // Utiliser un token valide (vous devrez peut-être le remplacer)
    const response = await fetch('http://localhost:3007/api/events/9?club=noveant', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImNsdWJJZCI6MSwiaWF0IjoxNzU4NzgwNzI4LCJleHAiOjE3NTg4NjcxMjh9.YCJqJGJJhKJhGJhGJhGJhGJhGJhGJhGJhGJhGJhGJhG'
      },
      body: JSON.stringify({
        title: 'Test Event Updated',
        description: 'Test Description Updated',
        date: '2024-01-15',
        heure: '14:00',
        lieu: 'Test Location',
        publicCible: 'Tous',
        photos: []
      })
    });
    
    console.log('Status:', response.status);
    const result = await response.text();
    console.log('Response:', result);
    
    if (response.status === 500) {
      console.log('Erreur 500 détectée!');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testUpdateEvent();