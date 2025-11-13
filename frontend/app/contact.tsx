import { Pressable, StyleSheet, ScrollView, View, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ContactScreen() {
  const router = useRouter();

  const handlePhonePress = () => {
    Linking.openURL('tel:+97611123456');
  };

  const handleEmailPress = () => {
    Linking.openURL('mailto:info@mway.mn');
  };

  const handleMapPress = () => {
    // Open map app with address
    Linking.openURL('https://maps.google.com/?q=Ulaanbaatar');
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backIcon}>‹</ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>Холбоо барих</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Бидэнтэй холбогдох</ThemedText>
          </View>

          <Pressable
            style={({ pressed }) => [styles.contactItem, pressed && styles.contactItemPressed]}
            onPress={handlePhonePress}
          >
            <View style={styles.contactIcon}>
              <ThemedText style={styles.contactIconText}>📞</ThemedText>
            </View>
            <View style={styles.contactContent}>
              <ThemedText style={styles.contactLabel}>Утас</ThemedText>
              <ThemedText style={styles.contactValue}>+976 11 123456</ThemedText>
            </View>
            <ThemedText style={styles.contactArrow}>›</ThemedText>
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={({ pressed }) => [styles.contactItem, pressed && styles.contactItemPressed]}
            onPress={handleEmailPress}
          >
            <View style={styles.contactIcon}>
              <ThemedText style={styles.contactIconText}>✉️</ThemedText>
            </View>
            <View style={styles.contactContent}>
              <ThemedText style={styles.contactLabel}>Имэйл</ThemedText>
              <ThemedText style={styles.contactValue}>info@mway.mn</ThemedText>
            </View>
            <ThemedText style={styles.contactArrow}>›</ThemedText>
          </Pressable>

          <View style={styles.divider} />

          <Pressable
            style={({ pressed }) => [styles.contactItem, pressed && styles.contactItemPressed]}
            onPress={handleMapPress}
          >
            <View style={styles.contactIcon}>
              <ThemedText style={styles.contactIconText}>📍</ThemedText>
            </View>
            <View style={styles.contactContent}>
              <ThemedText style={styles.contactLabel}>Хаяг</ThemedText>
              <ThemedText style={styles.contactValue}>Улаанбаатар хот</ThemedText>
            </View>
            <ThemedText style={styles.contactArrow}>›</ThemedText>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Ажлын цаг</ThemedText>
          </View>
          <View style={styles.hoursRow}>
            <ThemedText style={styles.hoursLabel}>Даваа - Баасан:</ThemedText>
            <ThemedText style={styles.hoursValue}>09:00 - 18:00</ThemedText>
          </View>
          <View style={styles.hoursRow}>
            <ThemedText style={styles.hoursLabel}>Бямба:</ThemedText>
            <ThemedText style={styles.hoursValue}>10:00 - 16:00</ThemedText>
          </View>
          <View style={styles.hoursRow}>
            <ThemedText style={styles.hoursLabel}>Ням:</ThemedText>
            <ThemedText style={styles.hoursValue}>Амралтын өдөр</ThemedText>
          </View>
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#111827',
    fontWeight: 'bold',
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
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  contactItemPressed: {
    opacity: 0.7,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactIconText: {
    fontSize: 20,
  },
  contactContent: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  contactArrow: {
    fontSize: 20,
    color: '#9ca3af',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  hoursLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  hoursValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
});

