export interface EphemeralMessage {
  id: string;
  conversationId: string;
  content: string;
  senderHandle: string;
  timestamp: string;
  isFromCurrentUser: boolean;
}

export interface EphemeralConversation {
  id: string;
  postId: string;
  postContent: string;
  participantHandles: {
    user: string;
    other: string;
  };
  messages: EphemeralMessage[];
  createdAt: string;
  expiresAt: string;
  messageCount: {
    user: number;
    other: number;
  };
  maxMessages: number;
  isActive: boolean;
  lastActivity: string;
}

export interface ActivityNotification {
  id: string;
  type: 'new_message' | 'conversation_expired' | 'conversation_limit_reached';
  conversationId: string;
  postContent: string;
  timestamp: string;
  isRead: boolean;
  senderHandle?: string;
}