import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { ToriiQueryBuilder, MemberClause, AndComposeClause } from '@dojoengine/sdk';
import { useEntityQuery, useModels, useModel } from '@dojoengine/sdk/react';
import { getEntityIdFromKeys } from '@dojoengine/utils';
import { BigNumberish } from 'starknet';

// Utility function to decode hex string to ASCII (moved outside component)
function hexToAscii(hex: string): string {
  try {
    // Remove 0x prefix if present
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    
    // Remove leading zeros
    const trimmedHex = cleanHex.replace(/^0+/, '');
    
    // Convert hex to ASCII
    let ascii = '';
    for (let i = 0; i < trimmedHex.length; i += 2) {
      const hexPair = trimmedHex.substr(i, 2);
      const charCode = parseInt(hexPair, 16);
      if (charCode > 0) { // Only add non-null characters
        ascii += String.fromCharCode(charCode);
      }
    }
    
    return ascii;
  } catch (error) {
    console.error('Error decoding hex to ASCII:', error, hex);
    return hex; // Return original if decode fails
  }
}

// Utility function to convert hash to Cloudinary URL (moved outside component)
function convertHashToCloudinaryUrl(hash: string): string {
  // If it's already a full URL (http/https), return as-is
  if (hash.startsWith('http')) {
    return hash;
  }
  
  // If it's a local path (starts with /), return as-is
  if (hash.startsWith('/')) {
    return hash;
  }
  
  // If it's just a filename, assume it's in the public folder
  if (hash.length > 0 && hash !== '0' && !hash.startsWith('0x')) {
    return `/${hash}`;
  }
  
  // Fallback placeholder
  return "/placeholder-image.png";
}

// Memoized puzzle transformation function
const transformPuzzleData = (puzzleContainer: any, entityId: string) => {
  // The puzzle data is nested under a hex key
  const puzzleKeys = Object.keys(puzzleContainer || {});
  
  // Get the actual puzzle data from the first (and likely only) hex key
  const puzzleData = puzzleKeys.length > 0 ? (puzzleContainer as any)[puzzleKeys[0]] : null;
  
  if (!puzzleData) {
    return {
      entityId,
      imageUrls: []
    };
  }
  
  // Decode hex-encoded image hashes to actual filenames
  const imageUrls = (puzzleData.image_hashes || []).map((hexHash: string) => {
    const filename = hexToAscii(hexHash);
    return convertHashToCloudinaryUrl(filename);
  });
  
  return {
    entityId,
    ...puzzleData,
    imageUrls
  };
};

// Hook for managing all puzzles
export function usePuzzles() {
  // Memoize query object to prevent recreation on every render
  const query = useMemo(() => 
    new ToriiQueryBuilder()
      .withClause(
        // Query for all puzzles by using a broader filter or remove the active filter
        MemberClause("quad_clue-Puzzle", "id", "Gte", 0).build()
      )
      .includeHashedKeys(), // CRITICAL: Needed for subscriptions
    []
  );

  // Query ALL puzzles (not just active ones) to get all data
  useEntityQuery(query);

  // Get all puzzles from the store
  const puzzles = useModels("quad_clue-Puzzle");

  // Use ref to track previous puzzles for deep comparison
  const prevPuzzlesRef = useRef<any>(null);
  const transformedPuzzlesRef = useRef<any[]>([]);
  
  // Transform puzzles data for easier use with optimized memoization
  const activePuzzles = useMemo(() => {
    // Create a stable string representation for comparison
    const puzzlesKeys = Object.keys(puzzles).sort();
    const puzzlesString = JSON.stringify(puzzlesKeys.map(key => [key, puzzles[key]]));
    
    // Only recalculate if puzzles actually changed
    if (prevPuzzlesRef.current === puzzlesString) {
      return transformedPuzzlesRef.current;
    }
    
    // Debug logging only when puzzles actually change
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Puzzles changed, recalculating...', puzzlesKeys.length, 'puzzles');
    }
    
    const transformed = Object.entries(puzzles).map(([entityId, puzzleContainer]) => {
      return transformPuzzleData(puzzleContainer, entityId);
    });
    
    // Update the refs with new data
    prevPuzzlesRef.current = puzzlesString;
    transformedPuzzlesRef.current = transformed;
    
    return transformed;
  }, [puzzles]);

  // Memoize loading state
  const isLoading = useMemo(() => Object.keys(puzzles).length === 0, [puzzles]);

  return {
    puzzles: activePuzzles,
    isLoading,
  };
}

// Hook for getting a specific puzzle
export function usePuzzle(puzzleId: BigNumberish) {
  const entityId = useMemo(() => {
    // Generate entity ID from puzzle ID (the key)
    return getEntityIdFromKeys([BigInt(puzzleId)]);
  }, [puzzleId]);

  const puzzle = useModel(entityId, "quad_clue-Puzzle");

  const puzzleWithImages = useMemo(() => {
    if (!puzzle) return null;
    
    // Handle the nested structure for single puzzle too
    const puzzleKeys = Object.keys(puzzle);
    const puzzleData = puzzleKeys.length > 0 ? (puzzle as any)[puzzleKeys[0]] : puzzle;
    
    const imageUrls = (puzzleData?.image_hashes || []).map((hexHash: string) => {
      const filename = hexToAscii(hexHash);
      return convertHashToCloudinaryUrl(filename);
    });
    
    return {
      ...puzzleData,
      imageUrls
    };
  }, [puzzle]);

  return puzzleWithImages;
}

// Debug hook to monitor puzzle creation (optimized)
export function usePuzzleDebug() {
  const { puzzles, isLoading } = usePuzzles();
  
  // Use ref to prevent excessive logging
  const lastLoggedCountRef = useRef(0);
  
  useEffect(() => {
    // Only log when puzzle count actually changes
    if (puzzles.length !== lastLoggedCountRef.current) {
      console.log('🧩 Puzzle Debug Update:', {
        totalPuzzles: puzzles.length,
        isLoading,
        puzzleIds: puzzles.map(p => p.entityId),
        latestPuzzle: puzzles[0] || null
      });
      
      // Log detailed info about the first puzzle for debugging
      if (puzzles.length > 0) {
        const firstPuzzle = puzzles[0];
        console.log('🔍 First puzzle details:', {
          entityId: firstPuzzle.entityId,
          allFields: Object.keys(firstPuzzle),
          image_hashes: (firstPuzzle as any).image_hashes,
          imageUrls: firstPuzzle.imageUrls,
          active: (firstPuzzle as any).active
        });
      }
      
      lastLoggedCountRef.current = puzzles.length;
    }
  }, [puzzles.length, isLoading]);
  
  return { puzzles, isLoading };
}

// Test data helper - use this to create test puzzles
export function getTestPuzzleData() {
  return [
    {
      imageHashes: [
        'paint1.png',
        'paint2.png', 
        'paint3.png',
        'paint4.png'
      ],
      answer: 'PAINT'
    },
    {
      imageHashes: [
        'brush1.png',
        'brush2.png',
        'brush3.png', 
        'brush4.png'
      ],
      answer: 'BRUSH'
    }
  ];
}

// Batch puzzle data helper - creates puzzles from the 10 folder directories
export function getBatchPuzzleData() {
  // Define the 10 puzzle folders in public directory (excluding 'sounds')
  const puzzleFolders = [
    {
      folder: 'Book',
      answer: 'BOOK',
      images: ['old_book.png', 'book_stack.png', 'Library.png', 'Glowing_pages.png']
    },
    {
      folder: 'Cold',
      answer: 'COLD',
      images: ['frozen_lake.jpg', 'ice_cubes.jpg', 'ice_mountains.png', 'winter.png']
    },
    {
      folder: 'Fire',
      answer: 'FIRE',
      images: ['volcano.png', 'matchstick.png', 'firefighter.png', 'campfire.png']
    },
    {
      folder: 'Happy',
      answer: 'HAPPY',
      images: ['Ballons_and_confetti.jpg', 'Jumping.jpg', 'Laughing_child.png', 'Smiling_group.png']
    },
    {
      folder: 'Light',
      answer: 'LIGHT',
      images: ['Flashlight.jpg', 'Forest_light.jpg', 'Light_bulb.jpeg', 'Sunrise.jpg']
    },
    {
      folder: 'Money',
      answer: 'MONEY',
      images: ['atm.jpg', 'coins.jpg', 'dollar_stack.jpg', 'wallet.jpg']
    },
    {
      folder: 'Music',
      answer: 'MUSIC',
      images: ['concert.jpg', 'Guitar.jpg', 'headphones.jpg', 'music_note.jpg']
    },
    {
      folder: 'Sky',
      answer: 'SKY',
      images: ['airplane.jpg', 'hot_air_balloon.jpg', 'night.jpg', 'sky.jpg']
    },
    {
      folder: 'Time',
      answer: 'TIME',
      images: ['Calendar.png', 'Clock.jpg', 'hour_glasss.png', 'watch.jpg']
    },
    {
      folder: 'Water',
      answer: 'WATER',
      images: ['Rain.png', 'Water_Glass.png', 'Waterfall.png', 'Waves.jpg']
    }
  ];

  // Convert to PuzzleData format with folder-based image paths
  return puzzleFolders.map(folder => ({
    image_hashes: folder.images.map(image => `${folder.folder}/${image}`),
    answer: folder.answer
  }));
}

