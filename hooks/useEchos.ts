import { useState, useEffect } from 'react';
import { Echo } from '@/types/echo';
import { generatePseudonym } from '@/utils/pseudonym';
import { moderateContent } from '@/utils/moderation';

const mockEchos: Echo[] = [
  {
    id: '1',
    content: 'Just witnessed the most amazing #sunset from the library rooftop. Sometimes you need to look up from your books to see the beauty around you. #campuslife #grateful',
    pseudonym: 'Wandering Scholar',
    location: 'Campus Area',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    upvotes: 12,
    downvotes: 1,
    replies: 3,
  },
  {
    id: '2',
    content: 'The #coffee shop on Main Street is playing jazz #music and everyone seems to be in sync with it. Strangers are humming along. Beautiful moment. #downtown',
    pseudonym: 'Jazz Listener',
    location: 'Coffee District',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    upvotes: 8,
    downvotes: 0,
    replies: 1,
  },
  {
    id: '3',
    content: 'Does anyone else feel like time moves differently when you\'re walking through the park at night? Everything feels more profound in the darkness. #nightthoughts #philosophy',
    pseudonym: 'Night Walker',
    location: 'Park Central',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    upvotes: 15,
    downvotes: 2,
    replies: 7,
  },
  {
    id: '4',
    content: 'Lost my wallet today and a complete stranger found it and returned it with everything intact. Faith in humanity restored. #grateful #kindness #community',
    pseudonym: 'Grateful Soul',
    location: 'Downtown',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    upvotes: 24,
    downvotes: 0,
    replies: 5,
  },
  {
    id: '5',
    content: 'Late night #study session at the library. The quiet energy here is incredible. Everyone focused on their dreams. #campuslife #motivation',
    pseudonym: 'Midnight Scholar',
    location: 'Campus Area',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    upvotes: 9,
    downvotes: 0,
    replies: 2,
  },
];

export function useEchos() {
  const [echos, setEchos] = useState<Echo[]>(mockEchos);
  const [loading, setLoading] = useState(false);

  const refreshEchos = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const createEcho = async (content: string) => {
    const moderationResult = await moderateContent(content);
    
    if (!moderationResult.isAllowed) {
      throw new Error(moderationResult.reason);
    }

    const newEcho: Echo = {
      id: Date.now().toString(),
      content,
      pseudonym: generatePseudonym(),
      location: 'Campus Area', // Would use actual location
      timestamp: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      replies: 0,
    };

    setEchos(prev => [newEcho, ...prev]);
  };

  return {
    echos,
    loading,
    refreshEchos,
    createEcho,
  };
}