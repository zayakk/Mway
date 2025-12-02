import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/lib/auth';
import { BrandColors } from '@/constants/theme';
import { Screen, ScreenHeader } from '@/components/ui/screen';


export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const performLogout = async () => {
    try {
      setLoading(true);
      await logout();
      setTimeout(() => {
        setLoading(false);
        router.replace('/login');
      }, 200);
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Алдаа', e?.message ?? 'Гарах амжилтгүй боллоо');
    }
  };

  const handleLogout = () => {
    if (!user) {
      Alert.alert('Алдаа', 'Хэрэглэгч нэвтрээгүй байна');
      return;
    }

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Та системээс гарахдаа итгэлтэй байна уу?');
      if (confirmed) {
        void performLogout();
      }
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
          onPress: () => {
            void performLogout();
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleHistory = () => {
    router.push('/history');
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
    <Screen scrollable>
      <ScreenHeader
        eyebrow="Profile"
        title="Миний мэдээлэл"
        subtitle="Өөрийн бүртгэлийн мэдээлэл болон тохиргоог удирдаарай."
      />

      <View style={styles.contentWrapper}>
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

          {/* Quick actions */}
          <View style={styles.quickActions}>
            <Pressable
              style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
              onPress={handleHistory}
            >
              <ThemedText style={styles.quickActionIcon}>🧾</ThemedText>
              <View>
                <ThemedText style={styles.quickActionLabel}>Захиалгын түүх</ThemedText>
                <ThemedText style={styles.quickActionHint}>Хамгийн сүүлд хийсэн аяллууд</ThemedText>
              </View>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
              onPress={handleNotifications}
            >
              <ThemedText style={styles.quickActionIcon}>🔔</ThemedText>
              <View>
                <ThemedText style={styles.quickActionLabel}>Мэдэгдэл</ThemedText>
                <ThemedText style={styles.quickActionHint}>Шинэ мэдээллүүдээ шалгах</ThemedText>
              </View>
            </Pressable>
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

        {/* Support Card */}
        <View style={styles.supportCard}>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.supportTitle}>Системээс гарах уу?</ThemedText>
            <ThemedText style={styles.supportText}>
              Дараагийн нэвтрэх үед таны мэдээллийг дахин баталгаажуулах болно.
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.supportButton, loading && styles.logoutButtonDisabled]}
            onPress={handleLogout}
            disabled={loading}
          >
            <ThemedText style={styles.supportButtonText}>
              {loading ? 'Гараж байна...' : 'Гарах'}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 20,
    gap: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  quickAction: {
    flex: 1,
    minWidth: 150,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  quickActionPressed: {
    opacity: 0.7,
  },
  quickActionIcon: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  quickActionHint: {
    fontSize: 13,
    color: '#64748b',
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
  supportCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    gap: 16,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#0f172a',
    opacity: 0.8,
  },
  supportButton: {
    backgroundColor: BrandColors.primary,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  supportButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    padding: 16,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    zIndex: 10,
    elevation: 5,
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 20,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
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

