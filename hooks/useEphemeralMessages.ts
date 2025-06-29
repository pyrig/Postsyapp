import { useState, useEffect } from 'react';
import { EphemeralConversation, EphemeralMessage, ActivityNotification } from '@/types/message';
import { generateConversationHandles } from '@/utils/ephemeralHandles';

export function useEphemeralMessages() {
  const [conversations, setConversations] = useState<EphemeralConversation[]>([]);
  const [notifications, setNotifications] = useState<ActivityNotification[]>([]);
  const [loading, setLoading] = useState(false);

  // Clean up expired conversations
  useEffect(() => {
    const cleanup = () => {
      const now = new Date();
      setConversations(prev => 
        prev.filter(conv => {
          const expired = new Date(conv.expiresAt) <= now;
          if (expired && conv.isActive) {
            // Add expiration notification
            addNotification({
              type: 'conversation_expired',
              conversationId: conv.id,
              postContent: conv.postContent || 'Direct conversation',
            });
          }
          return !expired;
        })
      );
    };

    const interval = setInterval(cleanup, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const addNotification = (notification: Omit<ActivityNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: ActivityNotification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50 notifications
  };

  const startConversation = async (postId: string, postContent: string): Promise<string> => {
    setLoading(true);
    
    try {
      const handles = generateConversationHandles();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      
      const newConversation: EphemeralConversation = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        postId,
        postContent: postContent.substring(0, 100) + (postContent.length > 100 ? '...' : ''),
        participantHandles: handles,
        messages: [],
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        messageCount: { user: 0, other: 0 },
        maxMessages: 5,
        isActive: true,
        lastActivity: now.toISOString(),
        type: 'post',
      };
      
      setConversations(prev => [newConversation, ...prev]);
      return newConversation.id;
    } finally {
      setLoading(false);
    }
  };

  const startDirectConversation = async (targetHandle: string): Promise<string> => {
    setLoading(true);
    
    try {
      // Check if conversation already exists with this user
      const existingConversation = conversations.find(conv => 
        conv.type === 'direct' && 
        conv.participantHandles.other === targetHandle &&
        conv.isActive
      );
      
      if (existingConversation) {
        return existingConversation.id;
      }

      const handles = generateConversationHandles();
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      
      const newConversation: EphemeralConversation = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        postId: '',
        postContent: '',
        participantHandles: {
          user: handles.user,
          other: targetHandle, // Use the actual target handle
        },
        messages: [],
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        messageCount: { user: 0, other: 0 },
        maxMessages: 5,
        isActive: true,
        lastActivity: now.toISOString(),
        type: 'direct',
      };
      
      setConversations(prev => [newConversation, ...prev]);
      return newConversation.id;
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (conversationId: string, content: string): Promise<boolean> => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation || !conversation.isActive) return false;
    
    // Check if user has reached message limit
    if (conversation.messageCount.user >= conversation.maxMessages) {
      addNotification({
        type: 'conversation_limit_reached',
        conversationId,
        postContent: conversation.postContent || 'Direct conversation',
      });
      return false;
    }
    
    const newMessage: EphemeralMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      conversationId,
      content: content.trim(),
      senderHandle: conversation.participantHandles.user,
      timestamp: new Date().toISOString(),
      isFromCurrentUser: true,
    };
    
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        const updatedConv = {
          ...conv,
          messages: [...conv.messages, newMessage],
          messageCount: {
            ...conv.messageCount,
            user: conv.messageCount.user + 1,
          },
          lastActivity: new Date().toISOString(),
        };
        
        // Simulate receiving a response (in real app, this would come from server)
        setTimeout(() => {
          simulateResponse(conversationId);
        }, 2000 + Math.random() * 3000);
        
        return updatedConv;
      }
      return conv;
    }));
    
    return true;
  };

  const simulateResponse = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (!conversation || !conversation.isActive) return;
    
    // Check if other user has reached message limit
    if (conversation.messageCount.other >= conversation.maxMessages) return;
    
    const responses = [
      "That's such an interesting perspective...",
      "I never thought about it that way before.",
      "Your story really resonated with me.",
      "Thanks for sharing that, it means a lot.",
      "I can relate to what you're saying.",
      "That's beautifully put.",
      "I appreciate you opening up about this.",
      "Your words are really thoughtful.",
      "Hello! Nice to connect with you.",
      "Thanks for reaching out, how are you?",
      "I'm glad we can chat like this.",
      "What's on your mind today?",
    ];
    
    const responseMessage: EphemeralMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      conversationId,
      content: responses[Math.floor(Math.random() * responses.length)],
      senderHandle: conversation.participantHandles.other,
      timestamp: new Date().toISOString(),
      isFromCurrentUser: false,
    };
    
    setConversations(prev => prev.map(conv => {
      if (conv.id === conversationId) {
        return {
          ...conv,
          messages: [...conv.messages, responseMessage],
          messageCount: {
            ...conv.messageCount,
            other: conv.messageCount.other + 1,
          },
          lastActivity: new Date().toISOString(),
        };
      }
      return conv;
    }));
    
    // Add notification for new message
    addNotification({
      type: 'new_message',
      conversationId,
      postContent: conversation.postContent || 'Direct conversation',
      senderHandle: conversation.participantHandles.other,
    });
  };

  const getConversation = (id: string): EphemeralConversation | undefined => {
    return conversations.find(c => c.id === id);
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getUnreadCount = (): number => {
    return notifications.filter(n => !n.isRead).length;
  };

  const closeConversation = (conversationId: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId ? { ...conv, isActive: false } : conv
      )
    );
  };

  return {
    conversations,
    notifications,
    loading,
    startConversation,
    startDirectConversation,
    sendMessage,
    getConversation,
    markNotificationAsRead,
    clearAllNotifications,
    getUnreadCount,
    closeConversation,
  };
}