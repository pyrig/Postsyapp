import { useState, useEffect } from 'react';
import { Echo } from '@/types/echo';
import { generatePseudonym } from '@/utils/pseudonym';
import { moderateContent } from '@/utils/moderation';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';

// Start with empty array - no mock data
const mockEchos: Echo[] = [];

export function useEchos() {
  const [echos, setEchos] = useState<Echo[]>(mockEchos);
  const [loading, setLoading] = useState(false);
  const { currentLocation } = useLocation();
  const { user } = useAuth();

  const refreshEchos = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // No longer add random mock echos - only show real user posts
    setLoading(false);
  };

  const createEcho = async (content: string) => {
    const moderationResult = await moderateContent(content);
    
    if (!moderationResult.isAllowed) {
      throw new Error(moderationResult.reason);
    }

    // Use the user's handle as the pseudonym, or generate one if not available
    const pseudonym = user?.handle ? `@${user.handle}` : generatePseudonym();

    const newEcho: Echo = {
      id: Date.now().toString(),
      content,
      pseudonym,
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