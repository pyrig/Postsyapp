import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Clock, MapPin, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { EchoCard } from '@/components/EchoCard';
import { PostModal } from '@/components/PostModal';
import { NotificationPopup } from '@/components/NotificationPopup';
import { useLocation } from '@/hooks/useLocation';
import { useEchos } from '@/hooks/useEchos';
import { useEphemeralMessages } from '@/hooks/useEphemeralMessages';

const { width } = Dimensions.get('window');

export default function MainFeed() {
  const router = useRouter();
  const { currentLocation } = useLocation();
  const { echos, loading, refreshEchos } = useEchos();
  const { notifications, getUnreadCount, markNotificationAsRead } = useEphemeralMessages();
  const [showPostModal, setShowPostModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [feedType, setFeedType] = useState<'new' | 'nearby'>('new');
  const [refreshing, setRefreshing] = useState(false);

  const unreadCount = getUnreadCount();

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshEchos();
    setRefreshing(false);
  };

  const filteredEchos = echos
    .filter(echo => {
      if (feedType === 'new') {
        return true; // Show all posts
      } else {
        // For nearby, show posts from current location or similar areas
        return echo.location === currentLocation || 
               echo.location.includes('Campus') || 
               echo.location.includes('Downtown');
      }
    })
    .sort((a, b) => {
      if (feedType === 'new') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else {
        // For nearby, prioritize by location match and recency
        const aLocationMatch = a.location === currentLocation ? 1 : 0;
        const bLocationMatch = b.location === currentLocation ? 1 : 0;
        
        if (aLocationMatch !== bLocationMatch) {
          return bLocationMatch - aLocationMatch;
        }
        
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

  const handleNotificationPress = (notificationId: string) => {
    markNotificationAsRead(notificationId);
    setShowNotifications(false);
    router.push('/(tabs)/messages');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => setShowNotifications(true)}
          >
            <Bell size={20} color="#E2E8F0" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.feedToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, feedType === 'new' && styles.toggleButtonActive]}
            onPress={() => setFeedType('new')}
          >
            <Clock size={16} color={feedType === 'new' ? '#1A202C' : '#718096'} />
            <Text style={[styles.toggleText, feedType === 'new' && styles.toggleTextActive]}>
              New
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, feedType === 'nearby' && styles.toggleButtonActive]}
            onPress={() => setFeedType('nearby')}
          >
            <MapPin size={16} color={feedType === 'nearby' ? '#1A202C' : '#718096'} />
            <Text style={[styles.toggleText, feedType === 'nearby' && styles.toggleTextActive]}>
              Nearby
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.feedContainer}>
          {filteredEchos.map((echo) => (
            <EchoCard key={echo.id} echo={echo} />
          ))}
          {filteredEchos.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                {feedType === 'nearby' ? (
                  <MapPin size={48} color="#4A5568" />
                ) : (
                  <Plus size={48} color="#4A5568" />
                )}
              </View>
              <Text style={styles.emptyStateText}>
                {feedType === 'nearby' ? 'No Nearby Stories' : 'No Stories Yet'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {feedType === 'nearby' 
                  ? `No stories found in ${currentLocation || 'your area'}. Be the first to share something from this location!`
                  : 'Be the first to share something in your area! Tap the + button below to create your first anonymous post.'
                }
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => setShowPostModal(true)}
              >
                <Plus size={20} color="#1A202C" />
                <Text style={styles.emptyStateButtonText}>
                  {feedType === 'nearby' ? 'Share from Here' : 'Create First Post'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowPostModal(true)}
      >
        <Plus size={28} color="#1A202C" />
      </TouchableOpacity>

      <PostModal
        visible={showPostModal}
        onClose={() => setShowPostModal(false)}
        onPost={refreshEchos}
      />

      <NotificationPopup
        visible={showNotifications}
        notifications={notifications.slice(0, 5)} // Show only recent 5
        onClose={() => setShowNotifications(false)}
        onNotificationPress={handleNotificationPress}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.3,
    height: 32,
    maxWidth: 120,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#2D3748',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#00FFFF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A202C',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  feedToggle: {
    flexDirection: 'row',
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 4,
  },
  toggleButtonActive: {
    backgroundColor: '#00FFFF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#718096',
  },
  toggleTextActive: {
    color: '#1A202C',
  },
  scrollView: {
    flex: 1,
  },
  feedContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2D3748',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#4A5568',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00FFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#00FFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});