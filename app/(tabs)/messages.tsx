import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle, Clock, Trash2, Lock } from 'lucide-react-native';
import { useEphemeralMessages } from '@/hooks/useEphemeralMessages';
import { formatTimestamp } from '@/utils/time';
import { useState } from 'react';
import { EphemeralChatWindow } from '@/components/EphemeralChatWindow';

export default function Messages() {
  const { 
    notifications, 
    conversations,
    getConversation,
    markNotificationAsRead,
    clearAllNotifications,
    sendMessage,
  } = useEphemeralMessages();
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleNotificationPress = (notificationId: string, conversationId: string) => {
    markNotificationAsRead(notificationId);
    setSelectedConversationId(conversationId);
  };

  const handleSendMessage = async (content: string): Promise<boolean> => {
    if (!selectedConversationId) return false;
    return await sendMessage(selectedConversationId, content);
  };

  const selectedConversation = selectedConversationId 
    ? getConversation(selectedConversationId) 
    : null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_message':
        return <MessageCircle size={20} color="#00FFFF" />;
      case 'conversation_expired':
        return <Clock size={20} color="#F59E0B" />;
      case 'conversation_limit_reached':
        return <Lock size={20} color="#F56565" />;
      default:
        return <MessageCircle size={20} color="#718096" />;
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'new_message':
        return 'New private message';
      case 'conversation_expired':
        return 'Conversation expired';
      case 'conversation_limit_reached':
        return 'Message limit reached';
      default:
        return 'Notification';
    }
  };

  const getNotificationDescription = (notification: any) => {
    switch (notification.type) {
      case 'new_message':
        return `From ${notification.senderHandle}`;
      case 'conversation_expired':
        return 'Conversation has expired after 24 hours';
      case 'conversation_limit_reached':
        return 'Maximum exchanges reached';
      default:
        return '';
    }
  };

  // Group messages by conversation
  const allMessages = conversations.flatMap(conv => 
    conv.messages.map(msg => ({
      ...msg,
      conversation: conv,
    }))
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Messages</Text>
          {(notifications.length > 0 || conversations.length > 0) && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearAllNotifications}
            >
              <Trash2 size={20} color="#718096" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.subtitle}>
          All your ephemeral conversations and messages
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Active Conversations */}
        {conversations.filter(c => c.isActive).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Conversations</Text>
            {conversations
              .filter(c => c.isActive)
              .map((conversation) => (
                <TouchableOpacity
                  key={conversation.id}
                  style={styles.conversationCard}
                  onPress={() => setSelectedConversationId(conversation.id)}
                >
                  <View style={styles.conversationHeader}>
                    <View style={styles.conversationInfo}>
                      <Lock size={16} color="#00FFFF" />
                      <Text style={styles.conversationTitle}>
                        {conversation.participantHandles.other}
                      </Text>
                    </View>
                    <View style={styles.conversationMeta}>
                      <Text style={styles.conversationTime}>
                        {formatTimestamp(conversation.lastActivity)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.conversationContext}>
                    About: {conversation.postContent}
                  </Text>
                  <View style={styles.conversationStats}>
                    <Text style={styles.conversationStat}>
                      {conversation.messages.length} messages
                    </Text>
                    <Text style={styles.conversationStat}>
                      {conversation.maxMessages - conversation.messageCount.user} exchanges left
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
          </View>
        )}

        {/* All Messages */}
        {allMessages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Messages</Text>
            <View style={styles.messagesList}>
              {allMessages.map((message) => (
                <TouchableOpacity
                  key={message.id}
                  style={styles.messageCard}
                  onPress={() => setSelectedConversationId(message.conversation.id)}
                >
                  <View style={styles.messageHeader}>
                    <View style={styles.messageInfo}>
                      <Text style={[
                        styles.messageHandle,
                        message.isFromCurrentUser && styles.currentUserHandle
                      ]}>
                        {message.senderHandle}
                      </Text>
                      <Text style={styles.messageTime}>
                        {formatTimestamp(message.timestamp)}
                      </Text>
                    </View>
                    <View style={styles.messageIndicator}>
                      {message.isFromCurrentUser ? (
                        <Text style={styles.sentIndicator}>Sent</Text>
                      ) : (
                        <Text style={styles.receivedIndicator}>Received</Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.messageContent} numberOfLines={2}>
                    {message.content}
                  </Text>
                  <Text style={styles.messageContext} numberOfLines={1}>
                    About: {message.conversation.postContent}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {conversations.length === 0 && notifications.length === 0 && (
          <View style={styles.emptyState}>
            <MessageCircle size={48} color="#4A5568" />
            <Text style={styles.emptyStateText}>No messages yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start private conversations from posts to see messages here
            </Text>
          </View>
        )}
      </ScrollView>

      <EphemeralChatWindow
        visible={!!selectedConversationId}
        conversation={selectedConversation}
        onClose={() => setSelectedConversationId(null)}
        onSendMessage={handleSendMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#2D3748',
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  conversationCard: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4A5568',
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  conversationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  conversationMeta: {
    alignItems: 'flex-end',
  },
  conversationTime: {
    fontSize: 12,
    color: '#718096',
  },
  conversationContext: {
    fontSize: 14,
    color: '#E2E8F0',
    marginBottom: 8,
    lineHeight: 20,
  },
  conversationStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  conversationStat: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  messagesList: {
    gap: 12,
  },
  messageCard: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#4A5568',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  messageInfo: {
    flex: 1,
  },
  messageHandle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 2,
  },
  currentUserHandle: {
    color: '#00FFFF',
  },
  messageTime: {
    fontSize: 12,
    color: '#718096',
  },
  messageIndicator: {
    alignItems: 'flex-end',
  },
  sentIndicator: {
    fontSize: 11,
    color: '#00FFFF',
    fontWeight: '500',
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  receivedIndicator: {
    fontSize: 11,
    color: '#F59E0B',
    fontWeight: '500',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  messageContent: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 6,
  },
  messageContext: {
    fontSize: 12,
    color: '#718096',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E2E8F0',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
});