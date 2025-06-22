import { useEffect, useCallback, useMemo } from 'react';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { ToriiQueryBuilder, MemberClause, AndComposeClause } from '@dojoengine/sdk';
import { useEntityQuery, useModels, useModel } from '@dojoengine/sdk/react';
import { getEntityIdFromKeys } from '@dojoengine/utils';
import { BigNumberish } from 'starknet';

// Utility function to decode hex string to ASCII
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

  // Transform puzzles data for easier use
  const activePuzzles = useMemo(() => {
    console.log('🔍 Raw puzzles from store:', puzzles);
    
    return Object.entries(puzzles).map(([entityId, puzzleContainer]) => {
      console.log('🧩 Processing puzzle:', { entityId, puzzleContainer });
      
      // The puzzle data is nested under a hex key
      const puzzleKeys = Object.keys(puzzleContainer || {});
      console.log('🔑 Available puzzle keys:', puzzleKeys);
      
      // Get the actual puzzle data from the first (and likely only) hex key
      const puzzleData = puzzleKeys.length > 0 ? (puzzleContainer as any)[puzzleKeys[0]] : null;
      
      if (!puzzleData) {
        console.warn('❌ No puzzle data found for entity:', entityId);
        return {
          entityId,
          imageUrls: []
        };
      }
      
      console.log('📋 Puzzle data fields:', Object.keys(puzzleData));
      console.log('🖼️ Raw image_hashes:', puzzleData.image_hashes);
      
      // Decode hex-encoded image hashes to actual filenames
      const imageUrls = (puzzleData.image_hashes || []).map((hexHash: string) => {
        const filename = hexToAscii(hexHash);
        console.log('🔄 Decoded hash:', { hex: hexHash, filename });
        return convertHashToCloudinaryUrl(filename);
      });
      
      console.log('🖼️ Final imageUrls:', imageUrls);
      
      return {
        entityId,
        ...puzzleData,
        imageUrls
      };
    });
  }, [puzzles]);

  return {
    puzzles: activePuzzles,
    isLoading: Object.keys(puzzles).length === 0,
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
    
    console.log('🧩 Single puzzle data:', puzzle);
    
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

// Utility function to convert hash to Cloudinary URL
function convertHashToCloudinaryUrl(hash: string): string {
  console.log('🖼️ Converting hash to URL:', hash);
  
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

// Debug hook to monitor puzzle creation
export function usePuzzleDebug() {
  const { puzzles, isLoading } = usePuzzles();
  
  useEffect(() => {
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
  }, [puzzles, isLoading]);
  
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

