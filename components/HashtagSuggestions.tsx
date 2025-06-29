import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Hash } from 'lucide-react-native';

interface HashtagSuggestionsProps {
  suggestions: string[];
  onSuggestionPress: (hashtag: string) => void;
  visible: boolean;
}

export function HashtagSuggestions({ suggestions, onSuggestionPress, visible }: HashtagSuggestionsProps) {
  if (!visible || suggestions.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suggested hashtags</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {suggestions.map((hashtag, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestion}
            onPress={() => onSuggestionPress(hashtag)}
            activeOpacity={0.7}
          >
            <Hash size={14} color="#718096" />
            <Text style={styles.suggestionText}>
              {hashtag.replace('#', '')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#4A5568',
  },
  title: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 8,
    fontWeight: '500',
  },
  scrollContent: {
    gap: 8,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A202C',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    marginRight: 8,
  },
  suggestionText: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '500',
  },
});