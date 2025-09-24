import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const EventCarousel = ({ images, eventTitle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef(null);
  const pauseTimeoutRef = useRef(null);

  // DEBUG: Log des images reçues
  console.log('🖼️ EventCarousel - Images reçues:', {
    eventTitle,
    images,
    imagesLength: images?.length,
    firstImage: images?.[0],
    apiUrl: import.meta.env.VITE_API_URL
  });

  // Auto-play functionality
  useEffect(() => {
    if (!images || images.length <= 1) return;

    const startAutoPlay = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      
      intervalRef.current = setInterval(() => {
        if (isAutoPlaying) {
          setCurrentIndex((prevIndex) => 
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
          );
        }
      }, 3500); // 3.5 seconds
    };

    if (isAutoPlaying) {
      startAutoPlay();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, [isAutoPlaying, images]);

  if (!images || images.length === 0) {
    // Fallback image if no images available - use a static petanque image
    return (
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
        <img 
          src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center"
          alt={eventTitle || 'Événement de pétanque'}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Ultimate fallback - a simple colored background with text
            const parent = e.target.parentElement;
            if (parent) {
              e.target.style.display = 'none';
              parent.innerHTML = `
                <div class="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  <div class="text-center">
                    <div class="text-2xl mb-2">🎯</div>
                    <div>${eventTitle || 'Événement de pétanque'}</div>
                  </div>
                </div>
              `;
            }
          }}
        />
      </div>
    );
  }

  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    
    // Resume auto-play after 5 seconds of inactivity
    pauseTimeoutRef.current = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 5000);
  };

  const nextSlide = () => {
    pauseAutoPlay();
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    pauseAutoPlay();
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    pauseAutoPlay();
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
      {/* Main image */}
      <div className="relative w-full h-full">
        <img
          src={(() => {
            const currentImage = images[currentIndex];
            let imageSrc = '';
            
            if (currentImage?.filename) {
              imageSrc = `${import.meta.env.VITE_API_URL}/uploads/events/${currentImage.filename}`;
            } else if (currentImage?.file_path) {
              imageSrc = `${import.meta.env.VITE_API_URL}${currentImage.file_path}`;
            } else {
              imageSrc = currentImage?.url || currentImage;
            }
            
            // DEBUG: Log de l'URL de l'image construite
            console.log('🖼️ EventCarousel - URL image construite:', {
              eventTitle,
              currentIndex,
              currentImage,
              imageSrc,
              apiUrl: import.meta.env.VITE_API_URL
            });
            
            return imageSrc;
          })()}
          alt={`${eventTitle} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => {
            // Use a static petanque image as fallback
            e.target.src = "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop&crop=center";
            e.target.onerror = () => {
              // Ultimate fallback - a simple colored background with text
              const parent = e.target.parentElement;
              if (parent) {
                e.target.style.display = 'none';
                parent.innerHTML = `
                  <div class="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                    <div class="text-center">
                      <div class="text-2xl mb-2">🎯</div>
                      <div>${eventTitle || 'Événement de pétanque'}</div>
                    </div>
                  </div>
                `;
              }
            };
          }}
        />
      </div>

      {/* Navigation arrows - only show if more than 1 image */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full transition-all duration-200"
            aria-label="Image précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1 rounded-full transition-all duration-200"
            aria-label="Image suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Dots indicator - only show if more than 1 image */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-white'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Aller à l'image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
};

export default EventCarousel;