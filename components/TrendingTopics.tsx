import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { TrendingUp, Flame } from 'lucide-react-native';
import { TrendingTopic } from '@/types/hashtag';
import { getHashtagColor } from '@/utils/hashtag';
import { useEffect, useRef } from 'react';

interface TrendingTopicsProps {
  topics: TrendingTopic[];
  onHashtagPress: (hashtag: string) => void;
}

export function TrendingTopics({ topics, onHashtagPress }: TrendingTopicsProps) {
  if (topics.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <TrendingUp size={20} color="#00FFFF" />
          <Text style={styles.title}>Trending Now</Text>
        </View>
        <Text style={styles.subtitle}>Popular topics in your area</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {topics.map((topic, index) => (
          <TrendingHashtagPill
            key={topic.hashtag.id}
            topic={topic}
            onPress={() => onHashtagPress(topic.hashtag.tag)}
            isHot={topic.isHot}
            rank={topic.rank}
          />
        ))}
      </ScrollView>
    </View>
  );
}

interface TrendingHashtagPillProps {
  topic: TrendingTopic;
  onPress: () => void;
  isHot: boolean;
  rank: number;
}

function TrendingHashtagPill({ topic, onPress, isHot, rank }: TrendingHashtagPillProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isHot && rank <= 3) {
      // Pulse animation for top 3 hot topics
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    }
  }, [isHot, rank, pulseAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 1.05,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const backgroundColor = getHashtagColor(rank);
  const isTopThree = rank <= 3;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.pill,
          {
            backgroundColor: isTopThree ? backgroundColor : '#00FFFF',
            transform: [
              { scale: scaleAnim },
              { scale: isHot && isTopThree ? pulseAnim : 1 }
            ],
          },
          isTopThree && styles.hotPill,
        ]}
      >
        <View style={styles.pillContent}>
          {isHot && isTopThree && (
            <Flame size={14} color="#0a0a0f" style={styles.flameIcon} />
          )}
          <Text style={[
            styles.pillText,
            { color: isTopThree ? '#0a0a0f' : '#0a0a0f' }
          ]}>
            {topic.hashtag.tag}
          </Text>
          <View style={[
            styles.countBadge,
            { backgroundColor: isTopThree ? 'rgba(10, 10, 15, 0.2)' : 'rgba(10, 10, 15, 0.15)' }
          ]}>
            <Text style={[
              styles.countText,
              { color: isTopThree ? '#0a0a0f' : '#0a0a0f' }
            ]}>
              {topic.hashtag.count}
            </Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4A5568',
  },
  header: {
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 12,
    color: '#718096',
  },
  scrollView: {
    marginHorizontal: -4,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 8,
  },
  pill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  hotPill: {
    shadowColor: '#FF6B6B',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  pillContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flameIcon: {
    marginRight: 2,
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  countBadge: {
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});