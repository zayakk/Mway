import { useState } from 'react';
import { Pressable, StyleSheet, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface FAQ {
  question: string;
  answer: string;
}

export default function FAQsScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs: FAQ[] = [
    {
      question: 'Онлайн захиалгын үйлчилгээ нь ямар нэмэлт шимтгэл байгаа эсэх?',
      answer: 'Онлайн захиалгын үйлчилгээ нь ямар ч нэмэлт шимтгэлгүй. Та зөвхөн автобусны тасалбарын үнэ төлөх шаардлагатай.',
    },
    {
      question: 'Захиалгаа хэрхэн цуцлах вэ?',
      answer: 'Захиалгаа цуцлахын тулд Профайл → Түүх хэсэгт очоод захиалгаа сонгоод цуцлах товч дараарай. Цуцлалтын хугацаа, нөхцөл нь аялалын төрөл, цаг хугацаанаас хамаарна.',
    },
    {
      question: 'Төлбөрийг хэрхэн төлөх вэ?',
      answer: 'Та захиалгын явцад төлбөрийг онлайн төлбөрийн системээр төлж болно. Бид бэлэн мөнгө, карт, банкны шилжүүлэг зэрэг олон төрлийн төлбөрийн арга хүлээн авдаг.',
    },
    {
      question: 'Захиалгын баталгаажуулалт хэрхэн ирдэг вэ?',
      answer: 'Захиалга амжилттай болсны дараа танд имэйл болон утасны мэдэгдэл илгээгдэнэ. Мөн та Профайл → Түүх хэсгээс захиалгаа харж болно.',
    },
    {
      question: 'Суудлыг хэрхэн сонгох вэ?',
      answer: 'Захиалгын явцад та автобусны суудлын зургийг харж, хүссэн суудлаа сонгож болно. Сонгосон суудлууд ногоон өнгөтэй харагдана.',
    },
    {
      question: 'Хэрэв аялал цуцлагдвал юу болох вэ?',
      answer: 'Хэрэв аялал цуцлагдвал танд мэдэгдэл илгээгдэх бөгөөд төлбөр бүрэн буцаагдана. Буцаан олголтын хугацаа нь төлбөрийн аргаас хамаарна.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backIcon}>‹</ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>Түгээмэл асуултууд</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqCard}>
            <Pressable
              style={({ pressed }) => [
                styles.faqHeader,
                pressed && styles.faqHeaderPressed,
              ]}
              onPress={() => toggleFAQ(index)}
            >
              <ThemedText style={styles.faqQuestion}>{faq.question}</ThemedText>
              <ThemedText style={styles.faqIcon}>
                {expandedIndex === index ? '▼' : '▶'}
              </ThemedText>
            </Pressable>
            {expandedIndex === index && (
              <View style={styles.faqAnswerContainer}>
                <ThemedText style={styles.faqAnswer}>{faq.answer}</ThemedText>
              </View>
            )}
          </View>
        ))}
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
    gap: 12,
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  faqHeaderPressed: {
    backgroundColor: '#f9fafb',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginRight: 12,
  },
  faqIcon: {
    fontSize: 12,
    color: '#6b7280',
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginTop: 12,
  },
});

