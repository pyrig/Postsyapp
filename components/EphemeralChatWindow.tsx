import { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated
} from 'react-native';
import { X, Send, Lock, Clock, User } from 'lucide-react-native';
import { EphemeralConversation } from '@/types/message';
import { formatTimestamp } from '@/utils/time';

interface EphemeralChatWindowProps {
  visible: boolean;
  conversation: EphemeralConversation | null;
  onClose: () => void;
  onSendMessage: (content: string) => Promise<boolean>;
}

export function EphemeralChatWindow({ 
  visible, 
  conversation, 
  onClose, 
  onSendMessage 
}: EphemeralChatWindowProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (conversation?.messages.length) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [conversation?.messages.length]);

  if (!conversation) return null;

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    
    setSending(true);
    const success = await onSendMessage(message.trim());
    
    if (success) {
      setMessage('');
    }
    setSending(false);
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const expires = new Date(conversation.expiresAt);
    const diff = expires.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const userMessagesLeft = conversation.maxMessages - conversation.messageCount.user;
  const canSendMessage = userMessagesLeft > 0 && conversation.isActive;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {conversation.type === 'direct' ? (
                <User size={16} color="#00FFFF" />
              ) : (
                <Lock size={16} color="#00FFFF" />
              )}
              <Text style={styles.headerTitle}>
                {conversation.type === 'direct' 
                  ? `${conversation.participantHandles.other}`
                  : `${conversation.participantHandles.user} ↔ ${conversation.participantHandles.other}`
                }
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#E2E8F0" />
            </TouchableOpacity>
          </View>

          {/* Conversation Info */}
          <View style={styles.infoBar}>
            <View style={styles.infoLeft}>
              <Clock size={14} color="#718096" />
              <Text style={styles.infoText}>
                Expires in {getTimeRemaining()}
              </Text>
            </View>
            <Text style={styles.infoText}>
              {userMessagesLeft}/5 exchanges left
            </Text>
          </View>

          {/* Context */}
          {conversation.type === 'post' && conversation.postContent && (
            <View style={styles.contextBar}>
              <Text style={styles.contextLabel}>About:</Text>
              <Text style={styles.contextText}>{conversation.postContent}</Text>
            </View>
          )}

          {conversation.type === 'direct' && (
            <View style={styles.contextBar}>
              <Text style={styles.contextLabel}>Direct Conversation</Text>
              <Text style={styles.contextText}>
                Private ephemeral chat with {conversation.participantHandles.other}
              </Text>
            </View>
          )}

          {/* Messages */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {conversation.messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  msg.isFromCurrentUser ? styles.userMessage : styles.otherMessage,
                ]}
              >
                <Text style={[
                  styles.messageText,
                  msg.isFromCurrentUser ? styles.userMessageText : styles.otherMessageText,
                ]}>
                  {msg.content}
                </Text>
                <Text style={[
                  styles.messageTime,
                  msg.isFromCurrentUser ? styles.userMessageTime : styles.otherMessageTime,
                ]}>
                  {formatTimestamp(msg.timestamp)}
                </Text>
              </View>
            ))}
            
            {conversation.messages.length === 0 && (
              <View style={styles.emptyState}>
                {conversation.type === 'direct' ? (
                  <User size={32} color="#4A5568" />
                ) : (
                  <Lock size={32} color="#4A5568" />
                )}
                <Text style={styles.emptyStateText}>
                  {conversation.type === 'direct' 
                    ? 'Start your direct conversation'
                    : 'Start your ephemeral conversation'
                  }
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Messages will disappear after 24 hours or 5 exchanges
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Input */}
          <View style={styles.inputContainer}>
            {!canSendMessage && (
              <View style={styles.limitReached}>
                <Text style={styles.limitText}>
                  {userMessagesLeft === 0 
                    ? 'Message limit reached' 
                    : 'Conversation expired'
                  }
                </Text>
              </View>
            )}
            
            {canSendMessage && (
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.textInput}
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Type your message... (ephemeral)"
                  placeholderTextColor="#718096"
                  multiline
                  maxLength={500}
                  editable={!sending}
                />
                <View style={styles.inputFooter}>
                  <Text style={styles.characterCount}>
                    {message.length}/500
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      (!message.trim() || sending) && styles.sendButtonDisabled,
                    ]}
                    onPress={handleSend}
                    disabled={!message.trim() || sending}
                  >
                    <Send size={18} color={(!message.trim() || sending) ? '#718096' : '#1A202C'} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#2D3748',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
  },
  contextBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
  },
  contextLabel: {
    fontSize: 12,
    color: '#00FFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  contextText: {
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 40,
  },
  messageBubble: {
    maxWidth: '80%',
    marginBottom: 16,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#00FFFF',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#374151',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#1A202C',
  },
  otherMessageText: {
    color: '#FFFFFF',
  },
  messageTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  userMessageTime: {
    color: 'rgba(26, 32, 44, 0.7)',
  },
  otherMessageTime: {
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
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
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#2D3748',
    backgroundColor: '#1A202C',
  },
  limitReached: {
    padding: 20,
    alignItems: 'center',
  },
  limitText: {
    fontSize: 14,
    color: '#F56565',
    fontWeight: '500',
  },
  inputWrapper: {
    padding: 20,
  },
  textInput: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    maxHeight: 120,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#4A5568',
  },
  inputFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  characterCount: {
    fontSize: 12,
    color: '#718096',
  },
  sendButton: {
    backgroundColor: '#00FFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#2D3748',
  },
});