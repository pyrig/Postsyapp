import { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, Alert } from 'react-native';
import { X, MapPin, Send, Hash } from 'lucide-react-native';
import { useLocation } from '@/hooks/useLocation';
import { useEchos } from '@/hooks/useEchos';
import { useHashtags } from '@/hooks/useHashtags';
import { HashtagSuggestions } from '@/components/HashtagSuggestions';
import { extractHashtags } from '@/utils/hashtag';

interface PostModalProps {
  visible: boolean;
  onClose: () => void;
  onPost: () => void;
}

export function PostModal({ visible, onClose, onPost }: PostModalProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { currentLocation } = useLocation();
  const { createEcho } = useEchos();
  const { getHashtagSuggestions, addHashtagsFromPost } = useHashtags();

  const hashtags = extractHashtags(content);
  const hashtagCount = hashtags.length;
  const maxHashtags = 5;

  const handleContentChange = (text: string) => {
    setContent(text);
    
    // Show suggestions when user types # or when content is empty
    const shouldShowSuggestions = text.endsWith('#') || text === '' || text.includes('#');
    setShowSuggestions(shouldShowSuggestions);
  };

  const handleSuggestionPress = (hashtag: string) => {
    const cleanHashtag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    
    // If content ends with #, replace it with the selected hashtag
    if (content.endsWith('#')) {
      setContent(content.slice(0, -1) + cleanHashtag + ' ');
    } else {
      // Otherwise, append the hashtag
      setContent(content + (content.endsWith(' ') ? '' : ' ') + cleanHashtag + ' ');
    }
    setShowSuggestions(false);
  };

  const suggestions = getHashtagSuggestions(content);

  const handlePost = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something to share');
      return;
    }

    if (hashtagCount > maxHashtags) {
      Alert.alert('Error', `You can use a maximum of ${maxHashtags} hashtags per post`);
      return;
    }

    setLoading(true);
    try {
      await createEcho(content.trim());
      addHashtagsFromPost(content.trim());
      setContent('');
      setShowSuggestions(false);
      onPost();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to post your story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setContent('');
    setShowSuggestions(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <X size={24} color="#E2E8F0" />
          </TouchableOpacity>
          <Text style={styles.title}>Share Your Story</Text>
          <TouchableOpacity
            style={[styles.postButton, (!content.trim() || loading) && styles.postButtonDisabled]}
            onPress={handlePost}
            disabled={!content.trim() || loading}
          >
            <Send size={18} color={(!content.trim() || loading) ? '#718096' : '#1A202C'} />
          </TouchableOpacity>
        </View>

        <View style={styles.locationContainer}>
          <MapPin size={16} color="#718096" />
          <Text style={styles.locationText}>
            Sharing to {currentLocation || 'Nearby'}
          </Text>
        </View>

        <TextInput
          style={styles.textInput}
          placeholder="What's happening around you? Use #hashtags to join conversations..."
          placeholderTextColor="#718096"
          value={content}
          onChangeText={handleContentChange}
          multiline
          maxLength={280}
          autoFocus
        />

        {/* Hashtag Suggestions */}
        <HashtagSuggestions
          suggestions={suggestions}
          onSuggestionPress={handleSuggestionPress}
          visible={showSuggestions}
        />

        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.characterCount}>
              {content.length}/280
            </Text>
            {hashtagCount > 0 && (
              <View style={styles.hashtagCounter}>
                <Hash size={14} color={hashtagCount > maxHashtags ? '#F56565' : '#00FFFF'} />
                <Text style={[
                  styles.hashtagCountText,
                  hashtagCount > maxHashtags && styles.hashtagCountError
                ]}>
                  {hashtagCount}/{maxHashtags}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.anonymousNote}>
            Posted anonymously • Your identity remains private
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2D3748',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  postButton: {
    backgroundColor: '#00FFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  postButtonDisabled: {
    backgroundColor: '#2D3748',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  locationText: {
    fontSize: 14,
    color: '#718096',
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: '#FFFFFF',
    textAlignVertical: 'top',
    paddingVertical: 0,
  },
  footer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#2D3748',
    gap: 8,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  characterCount: {
    fontSize: 14,
    color: '#718096',
  },
  hashtagCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hashtagCountText: {
    fontSize: 14,
    color: '#00FFFF',
    fontWeight: '500',
  },
  hashtagCountError: {
    color: '#F56565',
  },
  anonymousNote: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },
});