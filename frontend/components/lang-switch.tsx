import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/i18n';

export function LangSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <View style={styles.row}>
      <Chip label="MN" active={lang === 'mn'} onPress={() => setLang('mn')} />
      <Chip label="EN" active={lang === 'en'} onPress={() => setLang('en')} />
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.active]}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
  },
  active: {
    backgroundColor: '#e0f2fe',
    borderColor: '#38bdf8',
  },
});


