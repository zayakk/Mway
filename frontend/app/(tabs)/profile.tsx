import { useState } from 'react';
import { Alert, Pressable, StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/lib/auth';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    if (!user) {
      Alert.alert('Алдаа', 'Хэрэглэгч нэвтрээгүй байна');
      return;
    }

    Alert.alert(
      'Гарах',
      'Та системээс гарахдаа итгэлтэй байна уу?',
      [
        { 
          text: 'Цуцлах', 
          style: 'cancel',
        },
        {
          text: 'Гарах',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await logout();
              // Small delay to ensure state updates
              setTimeout(() => {
                setLoading(false);
                router.replace('/login');
              }, 200);
            } catch (e: any) {
              setLoading(false);
              Alert.alert('Алдаа', e?.message ?? 'Гарах амжилтгүй боллоо');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleNotifications = () => {
    router.push('/notifications');
  };

  const handleLanguage = () => {
    router.push('/language');
  };

  const handlePrivacy = () => {
    router.push('/privacy');
  };

  const handleFAQs = () => {
    router.push('/faqs');
  };

  const handleContact = () => {
    router.push('/contact');
  };

  const handleAbout = () => {
    router.push('/about');
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Профайл</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>{user?.name || 'Хэрэглэгч'}</ThemedText>
            <ThemedText style={styles.profileEmail}>{user?.email || '—'}</ThemedText>
          </View>
        </View>

        {/* Account Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Хэрэглэгчийн мэдээлэл</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Нэр:</ThemedText>
            <ThemedText style={styles.infoValue}>{user?.name || '—'}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Имэйл:</ThemedText>
            <ThemedText style={styles.infoValue}>{user?.email || '—'}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.infoLabel}>Хэрэглэгчийн дугаар:</ThemedText>
            <ThemedText style={styles.infoValue}>{user?.id || '—'}</ThemedText>
          </View>
        </View>

        {/* Settings Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Тохиргоо</ThemedText>
          </View>
          <Pressable 
            style={({ pressed }) => [styles.settingItem, pressed && styles.settingItemPressed]}
            onPress={handleNotifications}
          >
            <ThemedText style={styles.settingLabel}>🔔 Мэдэгдэл</ThemedText>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </Pressable>
          <View style={styles.divider} />
          <Pressable 
            style={({ pressed }) => [styles.settingItem, pressed && styles.settingItemPressed]}
            onPress={handleLanguage}
          >
            <ThemedText style={styles.settingLabel}>🌐 Хэл</ThemedText>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </Pressable>
          <View style={styles.divider} />
          <Pressable 
            style={({ pressed }) => [styles.settingItem, pressed && styles.settingItemPressed]}
            onPress={handlePrivacy}
          >
            <ThemedText style={styles.settingLabel}>🔒 Нууцлал</ThemedText>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </Pressable>
        </View>

        {/* Help Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Тусламж</ThemedText>
          </View>
          <Pressable 
            style={({ pressed }) => [styles.settingItem, pressed && styles.settingItemPressed]}
            onPress={handleFAQs}
          >
            <ThemedText style={styles.settingLabel}>❓ Түгээмэл асуултууд</ThemedText>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </Pressable>
          <View style={styles.divider} />
          <Pressable 
            style={({ pressed }) => [styles.settingItem, pressed && styles.settingItemPressed]}
            onPress={handleContact}
          >
            <ThemedText style={styles.settingLabel}>📞 Холбоо барих</ThemedText>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </Pressable>
          <View style={styles.divider} />
          <Pressable 
            style={({ pressed }) => [styles.settingItem, pressed && styles.settingItemPressed]}
            onPress={handleAbout}
          >
            <ThemedText style={styles.settingLabel}>ℹ️ Бидний тухай</ThemedText>
            <ThemedText style={styles.settingArrow}>›</ThemedText>
          </Pressable>
        </View>
      </ScrollView>

      {/* Logout Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleLogout}
          style={[
            styles.logoutButton,
            loading && styles.logoutButtonDisabled
          ]}
          disabled={loading}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.logoutButtonText}>
            {loading ? 'Гараж байна...' : 'Гарах'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    alignItems: 'center',
    gap: 4,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileEmail: {
    fontSize: 16,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingItemPressed: {
    opacity: 0.7,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#111827',
  },
  settingArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
    zIndex: 10,
    elevation: 5,
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 56,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

