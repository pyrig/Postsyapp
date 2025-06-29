import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { MessageCircle, ChevronUp, ChevronDown, Share, Lock, Heart } from 'lucide-react-native';
import { Echo } from '@/types/echo';
import { formatTimestamp } from '@/utils/time';
import { generateAvatar } from '@/utils/avatar';
import { HashtagText } from '@/components/HashtagText';
import { useEphemeralMessages } from '@/hooks/useEphemeralMessages';
import { useEchos } from '@/hooks/useEchos';
import { useRef, useState } from 'react';

interface EchoCardProps {
  echo: Echo;
  onReply?: (echo: Echo) => void;
  onHashtagPress?: (hashtag: string) => void;
}

export function EchoCard({ echo, onReply, onHashtagPress }: EchoCardProps) {
  const avatar = generateAvatar(echo.pseudonym);
  const { startConversation } = useEphemeralMessages();
  const { voteOnEcho, replyToEcho } = useEchos();
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;

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
      Alert.alert(
        'Private Conversation Started',
        'You can now chat privately about this post. Check your Messages tab.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to start conversation. Please try again.');
    } finally {
      setIsStartingConversation(false);
    }
  };

  const handleVote = async (voteType: 'up' | 'down') => {
    if (userVote === voteType) return; // Prevent double voting
    
    try {
      await voteOnEcho(echo.id, voteType);
      setUserVote(voteType);
    } catch (error) {
      Alert.alert('Error', 'Failed to vote. Please try again.');
    }
  };

  const handleReply = async () => {
    try {
      await replyToEcho(echo.id);
      onReply?.(echo);
      Alert.alert('Reply Added', 'Your reply has been added to this post.');
    } catch (error) {
      Alert.alert('Error', 'Failed to reply. Please try again.');
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    
    // Animate heart
    Animated.sequence([
      Animated.timing(heartAnim, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleShare = () => {
    Alert.alert(
      'Share Post',
      'Share this anonymous post with others?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Share', onPress: () => {
          // In a real app, this would open share sheet
          Alert.alert('Shared!', 'Post shared successfully.');
        }}
      ]
    );
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
          onPress={handleReply}
        >
          <MessageCircle size={18} color="#718096" />
          <Text style={styles.actionText}>{echo.replies}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.actionButton,
            userVote === 'up' && styles.activeUpvote,
          ]}
          onPress={() => handleVote('up')}
        >
          <ChevronUp 
            size={18} 
            color={userVote === 'up' ? '#10B981' : '#718096'} 
          />
          <Text style={[
            styles.actionText,
            userVote === 'up' && styles.activeUpvoteText,
          ]}>
            {echo.upvotes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.actionButton,
            userVote === 'down' && styles.activeDownvote,
          ]}
          onPress={() => handleVote('down')}
        >
          <ChevronDown 
            size={18} 
            color={userVote === 'down' ? '#F56565' : '#718096'} 
          />
          <Text style={[
            styles.actionText,
            userVote === 'down' && styles.activeDownvoteText,
          ]}>
            {echo.downvotes}
          </Text>
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: heartAnim }] }}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleLike}
          >
            <Heart 
              size={18} 
              color={isLiked ? '#F56565' : '#718096'}
              fill={isLiked ? '#F56565' : 'none'}
            />
          </TouchableOpacity>
        </Animated.View>

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

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Share size={18} color="#718096" />
        </TouchableOpacity>
      </View>

      {echo.replies > 0 && (
        <TouchableOpacity style={styles.viewReplies} onPress={handleReply}>
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
  activeUpvote: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
  },
  activeDownvote: {
    backgroundColor: 'rgba(245, 101, 101, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 8,
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
  activeUpvoteText: {
    color: '#10B981',
    fontWeight: '600',
  },
  activeDownvoteText: {
    color: '#F56565',
    fontWeight: '600',
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