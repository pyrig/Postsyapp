import { Hashtag, TrendingTopic } from '@/types/hashtag';

export function extractHashtags(content: string): string[] {
  const hashtagRegex = /#[a-zA-Z0-9_]+/g;
  const matches = content.match(hashtagRegex);
  return matches ? matches.map(tag => tag.toLowerCase()) : [];
}

export function calculateTrendingScore(hashtag: Hashtag): number {
  const now = new Date();
  const lastUsed = new Date(hashtag.lastUsed);
  const hoursAgo = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60);
  
  // Recency factor (more recent = higher score)
  const recencyFactor = Math.max(0, 1 - (hoursAgo / 24));
  
  // Usage frequency factor
  const frequencyFactor = Math.log(hashtag.count + 1);
  
  // Combine factors
  return frequencyFactor * (1 + recencyFactor * 2);
}

export function getTrendingTopics(hashtags: Hashtag[], limit: number = 10): TrendingTopic[] {
  return hashtags
    .map(hashtag => ({
      hashtag,
      score: calculateTrendingScore(hashtag),
      rank: 0,
      isHot: hashtag.count > 5 && calculateTrendingScore(hashtag) > 3
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item, index) => ({
      ...item,
      rank: index + 1
    }));
}

export function formatHashtagForDisplay(tag: string): string {
  return tag.startsWith('#') ? tag : `#${tag}`;
}

export function getHashtagColor(rank: number): string {
  if (rank <= 3) return '#FF6B6B'; // Hot red for top 3
  if (rank <= 6) return '#FFD93D'; // Warm yellow for 4-6
  return '#00FFFF'; // Default cyan
}