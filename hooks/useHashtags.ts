import { useState, useEffect } from 'react';
import { Hashtag, TrendingTopic } from '@/types/hashtag';
import { getTrendingTopics, extractHashtags } from '@/utils/hashtag';

// Mock hashtag data
const mockHashtags: Hashtag[] = [
  {
    id: '1',
    tag: '#campuslife',
    count: 24,
    trend: 'up',
    posts: ['1', '2', '3'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsed: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    tag: '#coffee',
    count: 18,
    trend: 'up',
    posts: ['2', '4'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsed: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    tag: '#nightthoughts',
    count: 15,
    trend: 'stable',
    posts: ['3', '5'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsed: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    tag: '#grateful',
    count: 12,
    trend: 'up',
    posts: ['4'],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    lastUsed: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    tag: '#study',
    count: 10,
    trend: 'down',
    posts: ['1', '3'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsed: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    tag: '#sunset',
    count: 8,
    trend: 'up',
    posts: ['1'],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    lastUsed: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    tag: '#music',
    count: 7,
    trend: 'stable',
    posts: ['2'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastUsed: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    tag: '#friendship',
    count: 6,
    trend: 'up',
    posts: ['4'],
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    lastUsed: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

export function useHashtags() {
  const [hashtags, setHashtags] = useState<Hashtag[]>(mockHashtags);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    updateTrendingTopics();
  }, [hashtags]);

  const updateTrendingTopics = () => {
    const trending = getTrendingTopics(hashtags, 10);
    setTrendingTopics(trending);
  };

  const addHashtagsFromPost = (content: string) => {
    const extractedTags = extractHashtags(content);
    if (extractedTags.length === 0) return;

    setHashtags(prev => {
      const updated = [...prev];
      const now = new Date().toISOString();

      extractedTags.forEach(tag => {
        const existingIndex = updated.findIndex(h => h.tag === tag);
        
        if (existingIndex >= 0) {
          // Update existing hashtag
          updated[existingIndex] = {
            ...updated[existingIndex],
            count: updated[existingIndex].count + 1,
            lastUsed: now,
            trend: 'up'
          };
        } else {
          // Create new hashtag
          const newHashtag: Hashtag = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            tag,
            count: 1,
            trend: 'up',
            posts: [],
            createdAt: now,
            lastUsed: now,
          };
          updated.push(newHashtag);
        }
      });

      return updated;
    });
  };

  const searchHashtags = (query: string): Hashtag[] => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase().replace('#', '');
    return hashtags.filter(hashtag => 
      hashtag.tag.toLowerCase().includes(searchTerm)
    ).sort((a, b) => b.count - a.count);
  };

  const getHashtagSuggestions = (query: string): string[] => {
    if (!query.trim()) return trendingTopics.slice(0, 5).map(t => t.hashtag.tag);
    
    const searchTerm = query.toLowerCase().replace('#', '');
    return hashtags
      .filter(hashtag => hashtag.tag.toLowerCase().includes(searchTerm))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map(h => h.tag);
  };

  const addToSearchHistory = (hashtag: string) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== hashtag);
      return [hashtag, ...filtered].slice(0, 10);
    });
  };

  const getPostsByHashtag = (hashtag: string) => {
    const tag = hashtags.find(h => h.tag === hashtag);
    return tag ? tag.posts : [];
  };

  return {
    hashtags,
    trendingTopics,
    loading,
    searchHistory,
    addHashtagsFromPost,
    searchHashtags,
    getHashtagSuggestions,
    addToSearchHistory,
    getPostsByHashtag,
    updateTrendingTopics,
  };
}