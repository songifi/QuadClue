import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useEventQuery, useModels } from '@dojoengine/sdk/react';
import { ToriiQueryBuilder, KeysClause } from '@dojoengine/sdk';
import { useAccount } from '@starknet-react/core';
import { addAddressPadding } from 'starknet';
import { GuessSubmitted } from './typescript/models.gen';

export interface ProcessedGuessEvent {
  puzzle_id: string;
  player: string;
  is_correct: boolean;
  guess_length: number;
  timestamp: number;
  entityId: string;
  raw: any;
}

export interface PendingSubmission {
  id: string;           // unique submission ID  
  puzzleId: number;     // which puzzle
  guess: string;        // what was guessed
  timestamp: number;    // when submitted
  resolved: boolean;    // whether we found a matching event
}

export interface UseGuessSubmittedEventsReturn {
  // Event data
  events: ProcessedGuessEvent[];
  latestEvent: ProcessedGuessEvent | null;
  
  // Helper functions
  findEventForSubmission: (submission: PendingSubmission) => ProcessedGuessEvent | null;
  getEventsForPuzzle: (puzzleId: number) => ProcessedGuessEvent[];
  
  // Debug info
  isSubscribed: boolean;
  totalEvents: number;
}

export function useGuessSubmittedEvents(): UseGuessSubmittedEventsReturn {
  const { account } = useAccount();
  
  // Create event query for GuessSubmitted events for current player
  // Based on the contract: GuessSubmitted has keys [puzzle_id, player]
  const query = useMemo(() => {
    const playerAddress = account?.address ?? "0x0";
    const paddedAddress = addAddressPadding(playerAddress);
    
    console.log('🔔 Creating GuessSubmitted event query for player:', {
      original: playerAddress,
      padded: paddedAddress,
      hasAccount: !!account?.address
    });
    
    return new ToriiQueryBuilder()
      .withClause(
        KeysClause(
          ["quad_clue-GuessSubmitted"], // No fixed keys (we want all puzzle_ids)
          [undefined, paddedAddress], // Player address as variable key
          "FixedLen"
        ).build()
      )
      .includeHashedKeys();
  }, [account?.address]);

  // Subscribe to GuessSubmitted events using the correct event subscription
  useEventQuery(query);
  
  // Get raw events from the store
  const rawEvents = useModels("quad_clue-GuessSubmitted");
  
  // Use ref to track previous events for deep comparison
  const prevEventsRef = useRef<any>(null);
  const processedEventsRef = useRef<ProcessedGuessEvent[]>([]);
  
  // Process and transform raw events
  const processedEvents = useMemo(() => {
    // Create a stable string representation for comparison
    const eventsKeys = Object.keys(rawEvents).sort();
    const eventsString = JSON.stringify(eventsKeys.map(key => [key, rawEvents[key]]));
    
    // Only recalculate if events actually changed
    if (prevEventsRef.current === eventsString) {
      return processedEventsRef.current;
    }
    
    console.log('🔔 GuessSubmitted events changed, recalculating...', eventsKeys.length, 'events');
    
    const processed = Object.entries(rawEvents).map(([entityId, eventContainer]) => {
      // Extract event data from container
      const eventKeys = Object.keys(eventContainer || {});
      const eventData = eventKeys.length > 0 ? (eventContainer as any)[eventKeys[0]] : null;
      
      if (!eventData) {
        console.warn('⚠️ Empty event data for entity:', entityId);
        return null;
      }
      
      // Transform to our processed format
      const processed: ProcessedGuessEvent = {
        puzzle_id: eventData.puzzle_id?.toString() || '0',
        player: eventData.player?.toString() || '',
        is_correct: Boolean(eventData.is_correct),
        guess_length: Number(eventData.guess_length) || 0,
        timestamp: Number(eventData.timestamp) || 0,
        entityId,
        raw: eventData
      };
      
      console.log('🔔 Processed GuessSubmitted event:', {
        entityId,
        puzzle_id: processed.puzzle_id,
        player: processed.player,
        is_correct: processed.is_correct,
        timestamp: processed.timestamp
      });
      
      return processed;
    }).filter(Boolean) as ProcessedGuessEvent[];
    
    // Sort by timestamp (newest first)
    processed.sort((a, b) => b.timestamp - a.timestamp);
    
    // Update the refs with new data
    prevEventsRef.current = eventsString;
    processedEventsRef.current = processed;
    
    return processed;
  }, [rawEvents]);
  
  // Get latest event
  const latestEvent = useMemo(() => {
    return processedEvents.length > 0 ? processedEvents[0] : null;
  }, [processedEvents]);
  
  // Helper function to find event for a specific submission
  const findEventForSubmission = useCallback((submission: PendingSubmission): ProcessedGuessEvent | null => {
    if (!submission || !account?.address) return null;

    const paddedAccount = addAddressPadding(account.address).toLowerCase();
    
    // Find events that match the submission criteria
    const matchingEvents = processedEvents.filter(event => {
      const puzzleMatches = event.puzzle_id === submission.puzzleId.toString();
      const playerMatches = event.player.toLowerCase() === paddedAccount;

      // Δ = how much later the event is than the submission
    const delta = event.timestamp - submission.timestamp;

    /* An event is eligible only if
   – it is not older than the submission         (delta ≥ 0)
   – it arrived no more than 10 s afterwards     (delta ≤ 10)
*/
      
      // Event should be after submission (with some tolerance for blockchain timestamp variance)
      const timeMatches = delta >= 0 && delta <= 10;
      
      return puzzleMatches && playerMatches && timeMatches;
    });
    
    if (matchingEvents.length === 0) {
      console.log('🔍 No matching event found for submission:', {
        submissionId: submission.id,
        puzzleId: submission.puzzleId,
        submissionTime: submission.timestamp,
        availableEvents: processedEvents.length
      });
      return null;
    }
    
    // Return the most recent matching event
    const matchedEvent = matchingEvents[0];
    console.log('✅ Found matching event for submission:', {
      submissionId: submission.id,
      eventPuzzleId: matchedEvent.puzzle_id,
      eventIsCorrect: matchedEvent.is_correct,
      eventTimestamp: matchedEvent.timestamp
    });
    
    return matchedEvent;
  }, [processedEvents, account?.address]);
  
  // Helper function to get events for a specific puzzle
  const getEventsForPuzzle = useCallback((puzzleId: number): ProcessedGuessEvent[] => {
    return processedEvents.filter(event => event.puzzle_id === puzzleId.toString());
  }, [processedEvents]);
  
  // Debug logging for subscription status
  useEffect(() => {
    console.log('🔔 GuessSubmitted Events Hook Status:', {
      isSubscribed: !!account?.address,
      playerAddress: account?.address,
      totalEvents: processedEvents.length,
      latestEventTimestamp: latestEvent?.timestamp || 0,
      rawEventsKeys: Object.keys(rawEvents)
    });
  }, [account?.address, processedEvents.length, latestEvent?.timestamp, rawEvents]);
  
  return {
    events: processedEvents,
    latestEvent,
    findEventForSubmission,
    getEventsForPuzzle,
    isSubscribed: !!account?.address,
    totalEvents: processedEvents.length
  };
} 