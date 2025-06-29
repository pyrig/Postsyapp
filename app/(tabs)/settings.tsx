import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LogOut, Shield, Bell, CircleHelp as HelpCircle, User } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';

export default function Settings() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display
    if (phone && phone.startsWith('+')) {
      // International format - just return as is
      return phone;
    } else if (phone && phone.length === 10) {
      // US format
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          }
        }
      ]
    );
  };

  const settingsItems = [
    {
      title: 'Account',
      subtitle: user?.email || 'Manage your account',
      icon: User,
      onPress: () => {},
    },
    {
      title: 'Privacy & Safety',
      subtitle: 'Content moderation, blocking',
      icon: Shield,
      onPress: () => {},
    },
    {
      title: 'Notifications',
      subtitle: 'Push notifications, alerts',
      icon: Bell,
      onPress: () => {},
    },
    {
      title: 'Help & Support',
      subtitle: 'FAQs, contact support',
      icon: HelpCircle,
      onPress: () => {},
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your Postsy experience</Text>
      </View>

      <View style={styles.content}>
        {/* User Info Section */}
        {user && (
          <View style={styles.userSection}>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <Text style={styles.userAvatarText}>
                  {user.email.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userEmail}>{user.email}</Text>
                {user.phoneNumber && (
                  <Text style={styles.userPhone}>
                    {formatPhoneNumber(user.phoneNumber)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        <View style={styles.settingsSection}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.settingsItem}
              onPress={item.onPress}
            >
              <View style={styles.settingsItemLeft}>
                <View style={styles.iconContainer}>
                  <item.icon size={20} color="#00FFFF" />
                </View>
                <View style={styles.settingsItemText}>
                  <Text style={styles.settingsItemTitle}>{item.title}</Text>
                  <Text style={styles.settingsItemSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.dangerSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#F56565" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Postsy v1.0.0</Text>
          <Text style={styles.footerText}>Anonymous storytelling for everyone</Text>
        </View>
      </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  userSection: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00FFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  userDetails: {
    flex: 1,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#718096',
  },
  settingsSection: {
    backgroundColor: '#2D3748',
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#4A5568',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A202C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 14,
    color: '#718096',
  },
  dangerSection: {
    marginTop: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2D3748',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F56565',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
  },
});