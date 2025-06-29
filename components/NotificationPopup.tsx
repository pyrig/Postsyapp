import { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView,
  Animated,
  Dimensions
} from 'react-native';
import { X, MessageCircle, Clock, Lock, Bell } from 'lucide-react-native';
import { ActivityNotification } from '@/types/message';
import { formatTimestamp } from '@/utils/time';

interface NotificationPopupProps {
  visible: boolean;
  notifications: ActivityNotification[];
  onClose: () => void;
  onNotificationPress: (notificationId: string) => void;
}

const { height } = Dimensions.get('window');

export function NotificationPopup({ 
  visible, 
  notifications, 
  onClose, 
  onNotificationPress 
}: NotificationPopupProps) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_message':
        return <MessageCircle size={18} color="#00FFFF" />;
      case 'conversation_expired':
        return <Clock size={18} color="#F59E0B" />;
      case 'conversation_limit_reached':
        return <Lock size={18} color="#F56565" />;
      default:
        return <Bell size={18} color="#718096" />;
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

  const getNotificationDescription = (notification: ActivityNotification) => {
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Animated.View 
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim,
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.backdropTouch}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>

        <Animated.View 
          style={[
            styles.popup,
            {
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Bell size={20} color="#00FFFF" />
              <Text style={styles.title}>Recent Notifications</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#E2E8F0" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {notifications.length === 0 ? (
              <View style={styles.emptyState}>
                <Bell size={32} color="#4A5568" />
                <Text style={styles.emptyStateText}>No recent notifications</Text>
                <Text style={styles.emptyStateSubtext}>
                  You'll see activity from your private conversations here
                </Text>
              </View>
            ) : (
              <View style={styles.notificationsList}>
                {notifications.map((notification) => (
                  <TouchableOpacity
                    key={notification.id}
                    style={[
                      styles.notificationCard,
                      !notification.isRead && styles.unreadNotification,
                    ]}
                    onPress={() => onNotificationPress(notification.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.notificationIcon}>
                      {getNotificationIcon(notification.type)}
                    </View>
                    
                    <View style={styles.notificationContent}>
                      <Text style={styles.notificationTitle}>
                        {getNotificationTitle(notification.type)}
                      </Text>
                      <Text style={styles.notificationDescription}>
                        {getNotificationDescription(notification)}
                      </Text>
                      <Text style={styles.notificationContext} numberOfLines={1}>
                        About "{notification.postContent}"
                      </Text>
                      <Text style={styles.notificationTime}>
                        {formatTimestamp(notification.timestamp)}
                      </Text>
                    </View>
                    
                    {!notification.isRead && (
                      <View style={styles.unreadDot} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => {
                onClose();
                // Navigate to messages tab would be handled by parent
              }}
            >
              <Text style={styles.viewAllText}>View All Messages</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdropTouch: {
    flex: 1,
  },
  popup: {
    backgroundColor: '#1A202C',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.7,
    minHeight: height * 0.3,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#2D3748',
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
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  notificationsList: {
    gap: 12,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#2D3748',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#4A5568',
  },
  unreadNotification: {
    borderColor: '#00FFFF',
    backgroundColor: 'rgba(0, 255, 255, 0.05)',
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 13,
    color: '#E2E8F0',
    marginBottom: 4,
  },
  notificationContext: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  notificationTime: {
    fontSize: 11,
    color: '#718096',
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FFFF',
    marginTop: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E8F0',
    marginTop: 12,
    marginBottom: 6,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#2D3748',
  },
  viewAllButton: {
    backgroundColor: '#00FFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
  },
});