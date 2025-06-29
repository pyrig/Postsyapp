export interface Echo {
  id: string;
  content: string;
  pseudonym: string;
  location: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
  replies: number;
}

export interface EchoChain {
  id: string;
  parentId?: string;
  content: string;
  pseudonym: string;
  location: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
  depth: number;
}