export interface Hashtag {
  id: string;
  tag: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
  posts: string[]; // Array of post IDs
  createdAt: string;
  lastUsed: string;
}

export interface TrendingTopic {
  hashtag: Hashtag;
  score: number;
  rank: number;
  isHot: boolean;
}