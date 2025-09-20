import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const EventCarousel = ({ images, eventTitle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef(null);
  const pauseTimeoutRef = useRef(null);

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
    // Fallback image if no images available
    return (
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
        <img 
          src={`https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=petanque%20event%20outdoor%20sport%20boules%20game%20competition&image_size=landscape_4_3`}
          alt={eventTitle || 'Événement de pétanque'}
          className="w-full h-full object-cover"
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
          src={images[currentIndex]?.file_path ? `${import.meta.env.VITE_API_URL}/${images[currentIndex].file_path}` : (images[currentIndex]?.url || images[currentIndex])}
          alt={`${eventTitle} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
          onError={(e) => {
            e.target.src = `https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=petanque%20event%20outdoor%20sport%20boules%20game%20competition&image_size=landscape_4_3`;
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