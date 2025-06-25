import Image from "next/image";
import { useState, useEffect } from "react";

interface ImagesGridProps {
  images: string[];
  isTransitioning?: boolean;
}

interface ImageLoadState {
  [key: string]: boolean;
}

export default function ImagesGrid({ images, isTransitioning = false }: ImagesGridProps) {
  const [loadedImages, setLoadedImages] = useState<ImageLoadState>({});
  const [showImages, setShowImages] = useState(true);

  // Reset loading state when images change
  useEffect(() => {
    if (images.length > 0) {
      setLoadedImages({});
      setShowImages(false);
      
      // Small delay to show loading state before starting image loads
      const timer = setTimeout(() => setShowImages(true), 150);
      return () => clearTimeout(timer);
    }
  }, [images]);

  // Check if all images are loaded
  const allImagesLoaded = images.length > 0 && images.every(src => loadedImages[src]);

  const handleImageLoad = (src: string) => {
    setLoadedImages(prev => ({ ...prev, [src]: true }));
  };

  const handleImageError = (src: string) => {
    console.warn(`Failed to load image: ${src}`);
    setLoadedImages(prev => ({ ...prev, [src]: true })); // Mark as "loaded" to prevent infinite loading
  };

  // Enhanced loading skeleton component
  const ImageSkeleton = ({ index }: { index: number }) => (
    <div 
      className="w-full aspect-square rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center"
      style={{
        animationDelay: `${index * 100}ms`, // Stagger the pulse animation
      }}
    >
      <div className="text-gray-400 text-xs font-medium">
        {isTransitioning ? 'Loading...' : 'Image loading...'}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 gap-2 w-full mt-8 mb-4">
      {images.map((src, i) => (
        <div key={`${src}-${i}`} className="relative w-full aspect-square">
          {/* Loading skeleton - shown when transitioning or image not loaded */}
          {(isTransitioning || !loadedImages[src]) && (
            <div className="absolute inset-0 z-10">
              <ImageSkeleton index={i} />
            </div>
          )}
          
          {/* Actual image - only rendered when we want to show images */}
          {showImages && (
            <Image
              src={src}
              alt={`puzzle-img-${i}`}
              width={120}
              height={120}
              className={`rounded-xl shadow w-full aspect-square object-cover transition-all duration-500 ease-in-out ${
                loadedImages[src] && !isTransitioning 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-95'
              }`}
              onLoad={() => handleImageLoad(src)}
              onError={() => handleImageError(src)}
              priority={i < 2} // Prioritize loading first 2 images
            />
          )}
          
          {/* Success indicator when image loads */}
          {loadedImages[src] && !isTransitioning && (
            <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full opacity-75 animate-ping"></div>
          )}
        </div>
      ))}
    </div>
  );
}
