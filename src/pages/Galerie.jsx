import { useState, useEffect } from 'react'
import { Camera, Eye, Download } from 'lucide-react'
import { supabase } from '../lib/supabase'

const Galerie = () => {
  const [albums, setAlbums] = useState([])
  const [selectedAlbum, setSelectedAlbum] = useState(null)
  const [photos, setPhotos] = useState([])
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [photosLoading, setPhotosLoading] = useState(false)

  useEffect(() => {
    fetchAlbums()
  }, [])

  const fetchAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from('albums')
        .select(`
          *,
          photos(id)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAlbums(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des albums:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPhotos = async (albumId) => {
    setPhotosLoading(true)
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('album_id', albumId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPhotos(data || [])
    } catch (error) {
      console.error('Erreur lors du chargement des photos:', error)
    } finally {
      setPhotosLoading(false)
    }
  }

  const handleAlbumClick = (album) => {
    setSelectedAlbum(album)
    fetchPhotos(album.id)
  }

  const handleBackToAlbums = () => {
    setSelectedAlbum(null)
    setPhotos([])
    setSelectedPhoto(null)
  }

  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo)
  }

  const closePhotoModal = () => {
    setSelectedPhoto(null)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#425e9b] mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la galerie...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-[#425e9b] text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Galerie Photos
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Revivez les meilleurs moments de la vie du club à travers nos albums photos
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {!selectedAlbum ? (
            // Albums Grid
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Albums Photos
                </h2>
                <p className="text-gray-600">
                  Cliquez sur un album pour voir les photos
                </p>
              </div>
              
              {albums.length === 0 ? (
                <div className="text-center py-12">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Aucun album trouvé
                  </h3>
                  <p className="text-gray-600">
                    Les albums photos seront bientôt disponibles.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {albums.map((album) => (
                    <div
                      key={album.id}
                      onClick={() => handleAlbumClick(album)}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
                    >
                      <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                        {album.cover_photo_url ? (
                          <img
                            src={album.cover_photo_url}
                            alt={album.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <Camera className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-[#425e9b] transition-colors duration-200">
                          {album.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4">
                          {album.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>
                            {album.photos?.length || 0} photo{album.photos?.length !== 1 ? 's' : ''}
                          </span>
                          <span>
                            {formatDate(album.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // Photos Grid
            <div>
              <div className="mb-8">
                <button
                  onClick={handleBackToAlbums}
                  className="text-[#425e9b] hover:text-[#3a5287] font-medium mb-4 flex items-center"
                >
                  ← Retour aux albums
                </button>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedAlbum.title}
                </h2>
                
                <p className="text-gray-600">
                  {selectedAlbum.description}
                </p>
              </div>
              
              {photosLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#425e9b] mx-auto mb-4"></div>
                  <p className="text-gray-600">Chargement des photos...</p>
                </div>
              ) : photos.length === 0 ? (
                <div className="text-center py-12">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Aucune photo dans cet album
                  </h3>
                  <p className="text-gray-600">
                    Les photos seront bientôt ajoutées.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => openPhotoModal(photo)}
                      className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-200 aspect-square"
                    >
                      <img
                        src={photo.url}
                        alt={photo.title || 'Photo du club'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 flex items-center justify-center">
                        <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                      
                      {photo.title && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                          <p className="text-white text-sm font-medium truncate">
                            {photo.title}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closePhotoModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.title || 'Photo du club'}
              className="max-w-full max-h-full object-contain"
            />
            
            {selectedPhoto.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6">
                <h3 className="text-white text-lg font-semibold">
                  {selectedPhoto.title}
                </h3>
                {selectedPhoto.description && (
                  <p className="text-gray-300 mt-2">
                    {selectedPhoto.description}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Galerie