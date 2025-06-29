import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MessageCircle, ChevronUp, ChevronDown, Share, Lock } from 'lucide-react-native';
import { Echo } from '@/types/echo';
import { formatTimestamp } from '@/utils/time';
import { generateAvatar } from '@/utils/avatar';
import { HashtagText } from '@/components/HashtagText';
import { useEphemeralMessages } from '@/hooks/useEphemeralMessages';
import { useRef, useState } from 'react';

interface EchoCardProps {
  echo: Echo;
  onReply?: (echo: Echo) => void;
  onHashtagPress?: (hashtag: string) => void;
}

export function EchoCard({ echo, onReply, onHashtagPress }: EchoCardProps) {
  const avatar = generateAvatar(echo.pseudonym);
  const { startConversation } = useEphemeralMessages();
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePrivateReply = async () => {
    if (isStartingConversation) return;
    
    setIsStartingConversation(true);
    
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await startConversation(echo.id, echo.content);
    } finally {
      setIsStartingConversation(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: avatar.color }]}>
            <Text style={styles.avatarText}>{avatar.shape}</Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.pseudonym}>{echo.pseudonym}</Text>
            <View style={styles.metadata}>
              <Text style={styles.location}>{echo.location}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.timestamp}>{formatTimestamp(echo.timestamp)}</Text>
            </View>
          </View>
        </View>
      </View>

      <HashtagText 
        style={styles.content}
        onHashtagPress={onHashtagPress}
      >
        {echo.content}
      </HashtagText>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onReply?.(echo)}
        >
          <MessageCircle size={18} color="#718096" />
          <Text style={styles.actionText}>{echo.replies}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <ChevronUp size={18} color="#718096" />
          <Text style={styles.actionText}>{echo.upvotes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <ChevronDown size={18} color="#718096" />
          <Text style={styles.actionText}>{echo.downvotes}</Text>
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity 
            style={[
              styles.actionButton,
              styles.privateButton,
              isStartingConversation && styles.privateButtonLoading,
            ]}
            onPress={handlePrivateReply}
            disabled={isStartingConversation}
          >
            <Lock size={18} color={isStartingConversation ? '#718096' : '#00FFFF'} />
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity style={styles.actionButton}>
          <Share size={18} color="#718096" />
        </TouchableOpacity>
      </View>

      {echo.replies > 0 && (
        <TouchableOpacity style={styles.viewReplies}>
          <Text style={styles.viewRepliesText}>
            View {echo.replies} {echo.replies === 1 ? 'reply' : 'replies'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4A5568',
  },
  header: {
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  userDetails: {
    flex: 1,
  },
  pseudonym: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    color: '#718096',
  },
  separator: {
    fontSize: 12,
    color: '#718096',
    marginHorizontal: 6,
  },
  timestamp: {
    fontSize: 12,
    color: '#718096',
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: '#E2E8F0',
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  privateButton: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  privateButtonLoading: {
    backgroundColor: 'rgba(113, 128, 150, 0.1)',
    borderColor: 'rgba(113, 128, 150, 0.3)',
  },
  actionText: {
    fontSize: 14,
    color: '#718096',
  },
  viewReplies: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#4A5568',
  },
  viewRepliesText: {
    fontSize: 14,
    color: '#00FFFF',
    fontWeight: '500',
  },
});