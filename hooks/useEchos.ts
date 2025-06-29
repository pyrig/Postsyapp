import { useState, useEffect } from 'react';
import { Echo } from '@/types/echo';
import { generatePseudonym } from '@/utils/pseudonym';
import { moderateContent } from '@/utils/moderation';
import { useLocation } from '@/hooks/useLocation';

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
  {
    id: '6',
    content: 'The way the morning light hits the old buildings downtown is absolutely magical. Makes me appreciate living in this city. #architecture #morning #beauty',
    pseudonym: 'Urban Explorer',
    location: 'Downtown',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    upvotes: 6,
    downvotes: 0,
    replies: 1,
  },
  {
    id: '7',
    content: 'Overheard someone say "kindness is free but priceless" at the bus stop. Simple words that hit different today. #wisdom #kindness #publictransport',
    pseudonym: 'Bus Stop Philosopher',
    location: 'University Square',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    upvotes: 18,
    downvotes: 1,
    replies: 4,
  },
  {
    id: '8',
    content: 'The local bookstore cat has claimed my favorite reading chair again. I guess I\'ll have to find a new spot. #books #cats #cozy #reading',
    pseudonym: 'Bookworm',
    location: 'Coffee District',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    upvotes: 11,
    downvotes: 0,
    replies: 6,
  },
];

export function useEchos() {
  const [echos, setEchos] = useState<Echo[]>(mockEchos);
  const [loading, setLoading] = useState(false);
  const { currentLocation } = useLocation();

  const refreshEchos = async () => {
    setLoading(true);
    // Simulate API call with some randomization
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    // Simulate new echos appearing
    if (Math.random() > 0.7) {
      const newEcho: Echo = {
        id: Date.now().toString(),
        content: generateRandomEcho(),
        pseudonym: generatePseudonym(),
        location: currentLocation || 'Nearby',
        timestamp: new Date().toISOString(),
        upvotes: Math.floor(Math.random() * 5),
        downvotes: Math.floor(Math.random() * 2),
        replies: Math.floor(Math.random() * 3),
      };
      setEchos(prev => [newEcho, ...prev]);
    }
    
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
      location: currentLocation || 'Campus Area',
      timestamp: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      replies: 0,
    };

    setEchos(prev => [newEcho, ...prev]);
  };

  const voteOnEcho = async (echoId: string, voteType: 'up' | 'down') => {
    setEchos(prev => prev.map(echo => {
      if (echo.id === echoId) {
        return {
          ...echo,
          upvotes: voteType === 'up' ? echo.upvotes + 1 : echo.upvotes,
          downvotes: voteType === 'down' ? echo.downvotes + 1 : echo.downvotes,
        };
      }
      return echo;
    }));
  };

  const replyToEcho = async (echoId: string) => {
    setEchos(prev => prev.map(echo => {
      if (echo.id === echoId) {
        return {
          ...echo,
          replies: echo.replies + 1,
        };
      }
      return echo;
    }));
  };

  return {
    echos,
    loading,
    refreshEchos,
    createEcho,
    voteOnEcho,
    replyToEcho,
  };
}

function generateRandomEcho(): string {
  const randomEchos = [
    'Just had the most interesting conversation with a stranger at the coffee shop. Sometimes the best connections happen unexpectedly. #connections #coffee #strangers',
    'The sunset tonight is painting the sky in colors I didn\'t know existed. Nature is the best artist. #sunset #nature #beauty',
    'Found a handwritten note in a library book from 1987. Someone was studying for finals just like me. Time is a circle. #library #time #studying',
    'The way people light up when they talk about their passions is beautiful. What makes you come alive? #passion #people #life',
    'Rainy days make everything feel more contemplative. Perfect weather for deep thoughts and warm drinks. #rain #contemplation #cozy',
    'Witnessed a random act of kindness today. A stranger helped an elderly person with groceries. Faith in humanity restored. #kindness #community #help',
  ];
  
  return randomEchos[Math.floor(Math.random() * randomEchos.length)];
}