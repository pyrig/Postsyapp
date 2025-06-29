import { Text, StyleSheet } from 'react-native';
import { extractHashtags } from '@/utils/hashtag';

interface HashtagTextProps {
  children: string;
  style?: any;
  onHashtagPress?: (hashtag: string) => void;
}

export function HashtagText({ children, style, onHashtagPress }: HashtagTextProps) {
  const hashtags = extractHashtags(children);
  
  if (hashtags.length === 0) {
    return <Text style={style}>{children}</Text>;
  }

  // Split text and identify hashtag positions
  const parts = [];
  let lastIndex = 0;
  let text = children;

  hashtags.forEach(hashtag => {
    const index = text.indexOf(hashtag, lastIndex);
    if (index > lastIndex) {
      // Add text before hashtag
      parts.push({
        text: text.substring(lastIndex, index),
        isHashtag: false,
      });
    }
    
    // Add hashtag
    parts.push({
      text: hashtag,
      isHashtag: true,
    });
    
    lastIndex = index + hashtag.length;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      isHashtag: false,
    });
  }

  return (
    <Text style={style}>
      {parts.map((part, index) => (
        part.isHashtag ? (
          <Text
            key={index}
            style={styles.hashtag}
            onPress={() => onHashtagPress?.(part.text)}
          >
            {part.text}
          </Text>
        ) : (
          <Text key={index}>{part.text}</Text>
        )
      ))}
    </Text>
  );
}

const styles = StyleSheet.create({
  hashtag: {
    color: '#00FFFF',
    fontWeight: '600',
  },
});