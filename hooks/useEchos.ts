import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Echo } from '@/types/echo';
import { generatePseudonym } from '@/utils/pseudonym';
import { moderateContent } from '@/utils/moderation';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/hooks/useAuth';

export function useEchos() {
  const [echos, setEchos] = useState<Echo[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentLocation } = useLocation();
  const { user } = useAuth();

  // Load saved posts from AsyncStorage on mount
  useEffect(() => {
    const loadSavedPosts = async () => {
      try {
        const savedPosts = await AsyncStorage.getItem('postsy_echos');
        if (savedPosts) {
          const parsedPosts = JSON.parse(savedPosts);
          setEchos(parsedPosts);
        }
      } catch (error) {
        console.error('Error loading saved posts:', error);
      }
    };

    loadSavedPosts();
  }, []);

  // Save posts to AsyncStorage whenever echos change
  useEffect(() => {
    const savePosts = async () => {
      try {
        await AsyncStorage.setItem('postsy_echos', JSON.stringify(echos));
      } catch (error) {
        console.error('Error saving posts:', error);
      }
    };

    if (echos.length > 0) {
      savePosts();
    }
  }, [echos]);

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

    // Use the user's handle as the pseudonym
    const pseudonym = user?.handle ? `@${user.handle}` : generatePseudonym();

    const newEcho: Echo = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content,
      pseudonym,
      location: currentLocation || 'Campus Area',
      timestamp: new Date().toISOString(),
      upvotes: 0,
      downvotes: 0,
      replies: 0,
    };

    console.log('Creating new echo:', newEcho); // Debug log
    setEchos(prev => {
      const updated = [newEcho, ...prev];
      console.log('Updated echos:', updated); // Debug log
      return updated;
    });
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