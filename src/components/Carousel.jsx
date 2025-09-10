import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  // Fallback images if API fails
  const fallbackImages = [
    {
      src: '/image/AdobeStock_101893331.jpeg',
      alt: 'Joueurs de pétanque en action',
      caption: 'La passion de la pétanque'
    },
    {
      src: '/image/AdobeStock_108030161.jpeg',
      alt: 'Terrain de pétanque',
      caption: 'Nos terrains de qualité'
    },
    {
      src: '/image/AdobeStock_114710176.jpeg',
      alt: 'Boules de pétanque',
      caption: 'L\'art du jeu de boules'
    },
    {
      src: '/image/AdobeStock_133397076.jpeg',
      alt: 'Compétition de pétanque',
      caption: 'Nos tournois et championnats'
    },
    {
      src: '/image/AdobeStock_645053.jpeg',
      alt: 'Convivialité au club',
      caption: 'L\'esprit club avant tout'
    }
  ]

  // Fetch carousel images from API
  useEffect(() => {
    const fetchCarouselImages = async () => {
      try {
        console.log('Fetching carousel images from API...')
        const response = await fetch('/api/home-content')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('API Response:', data)
        
        if (data.data && data.data.carouselImages && data.data.carouselImages.length > 0) {
          const apiImages = data.data.carouselImages.map((imgObj, index) => ({
            src: imgObj.image_url.startsWith('uploads/') ? `/${imgObj.image_url}` : imgObj.image_url,
            alt: `Image du carrousel ${index + 1}`,
            caption: `Image ${index + 1}`
          }))
          console.log('Setting API images:', apiImages)
          setImages(apiImages)
        } else {
          console.log('No carousel images from API, using fallback')
          setImages(fallbackImages)
        }
      } catch (error) {
        console.error('Error fetching carousel images:', error)
        setImages(fallbackImages)
      } finally {
        setLoading(false)
      }
    }

    fetchCarouselImages()
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || images.length <= 1) return

    const interval = setInterval(() => {
      nextSlide()
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, currentSlide, images.length])

  // Pause auto-play on hover/touch
  const handleMouseEnter = () => setIsAutoPlaying(false)
  const handleMouseLeave = () => setIsAutoPlaying(true)

  // Touch/swipe functionality
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setIsAutoPlaying(false)
  }

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      nextSlide()
    } else if (isRightSwipe) {
      prevSlide()
    }
    
    setIsAutoPlaying(true)
  }

  // Show loading state
  if (loading) {
    return (
      <div className="relative w-full h-96 md:h-[500px] lg:h-[600px] overflow-hidden rounded-lg shadow-lg bg-gray-200 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Chargement des images...</div>
      </div>
    )
  }

  // Show message if no images
  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-96 md:h-[500px] lg:h-[600px] overflow-hidden rounded-lg shadow-lg bg-gray-200 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Aucune image disponible</div>
      </div>
    )
  }

  return (
    <div 
      className="relative w-full h-96 md:h-[500px] lg:h-[600px] overflow-hidden rounded-lg shadow-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Images */}
      <div className="relative w-full h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            {/* Overlay with caption */}
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-end">
              <div className="p-6 text-white">
                <h3 className="text-xl md:text-2xl font-bold mb-2">
                  {image.caption}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation arrows - only show if more than one image */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200 shadow-lg"
            aria-label="Image précédente"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all duration-200 shadow-lg"
            aria-label="Image suivante"
          >
            <ChevronRight className="w-6 h-6 text-gray-800" />
          </button>
        </>
      )}

      {/* Dots indicator - only show if more than one image */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-white scale-110'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Aller à l'image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Carousel