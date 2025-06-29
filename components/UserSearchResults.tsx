import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { User, MessageCircle, Clock } from 'lucide-react-native';
import { generateAvatar } from '@/utils/avatar';

interface UserSearchResult {
  handle: string;
  lastSeen: string;
  isOnline: boolean;
  mutualConnections?: number;
}

interface UserSearchResultsProps {
  query: string;
  onUserSelect: (handle: string) => void;
}

// Mock user data - in a real app, this would come from an API
const mockUsers: UserSearchResult[] = [
  {
    handle: 'Wandering Scholar',
    lastSeen: '2 minutes ago',
    isOnline: true,
    mutualConnections: 3,
  },
  {
    handle: 'Jazz Listener',
    lastSeen: '15 minutes ago',
    isOnline: true,
    mutualConnections: 1,
  },
  {
    handle: 'Night Walker',
    lastSeen: '1 hour ago',
    isOnline: false,
    mutualConnections: 0,
  },
  {
    handle: 'Grateful Soul',
    lastSeen: '3 hours ago',
    isOnline: false,
    mutualConnections: 2,
  },
  {
    handle: 'Midnight Scholar',
    lastSeen: '5 hours ago',
    isOnline: false,
    mutualConnections: 1,
  },
  {
    handle: 'Curious Mind',
    lastSeen: '1 day ago',
    isOnline: false,
    mutualConnections: 0,
  },
  {
    handle: 'Silent Observer',
    lastSeen: '2 days ago',
    isOnline: false,
    mutualConnections: 4,
  },
  {
    handle: 'Thoughtful Voice',
    lastSeen: '3 days ago',
    isOnline: false,
    mutualConnections: 2,
  },
];

export function UserSearchResults({ query, onUserSelect }: UserSearchResultsProps) {
  // Filter users based on search query
  const filteredUsers = mockUsers.filter(user =>
    user.handle.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 8); // Limit to 8 results

  if (query.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.hint}>Type at least 2 characters to search for users</Text>
      </View>
    );
  }

  if (filteredUsers.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <User size={24} color="#4A5568" />
          <Text style={styles.emptyStateText}>No users found</Text>
          <Text style={styles.emptyStateSubtext}>
            Try searching with a different handle
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.resultsHeader}>
        {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
      </Text>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {filteredUsers.map((user) => {
          const avatar = generateAvatar(user.handle);
          
          return (
            <TouchableOpacity
              key={user.handle}
              style={styles.userCard}
              onPress={() => onUserSelect(user.handle)}
              activeOpacity={0.7}
            >
              <View style={styles.userInfo}>
                <View style={[styles.avatar, { backgroundColor: avatar.color }]}>
                  <Text style={styles.avatarText}>{avatar.shape}</Text>
                  {user.isOnline && <View style={styles.onlineIndicator} />}
                </View>
                
                <View style={styles.userDetails}>
                  <Text style={styles.userHandle}>{user.handle}</Text>
                  <View style={styles.userMeta}>
                    <Clock size={12} color="#718096" />
                    <Text style={styles.lastSeen}>
                      {user.isOnline ? 'Online' : `Last seen ${user.lastSeen}`}
                    </Text>
                  </View>
                  {user.mutualConnections > 0 && (
                    <Text style={styles.mutualConnections}>
                      {user.mutualConnections} mutual conversation{user.mutualConnections !== 1 ? 's' : ''}
                    </Text>
                  )}
                </View>
              </View>
              
              <View style={styles.actionButton}>
                <MessageCircle size={16} color="#00FFFF" />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    backgroundColor: '#2D3748',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4A5568',
    maxHeight: 300,
  },
  hint: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    padding: 20,
    fontStyle: 'italic',
  },
  resultsHeader: {
    fontSize: 12,
    color: '#718096',
    fontWeight: '500',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  scrollView: {
    maxHeight: 250,
  },
  scrollContent: {
    paddingBottom: 12,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#4A5568',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#2D3748',
  },
  userDetails: {
    flex: 1,
  },
  userHandle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  lastSeen: {
    fontSize: 12,
    color: '#718096',
  },
  mutualConnections: {
    fontSize: 11,
    color: '#00FFFF',
    fontWeight: '500',
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 255, 0.3)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
  },
});