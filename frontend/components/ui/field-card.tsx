import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BrandColors } from '@/constants/theme';

type Props = {
  label: string;
  value?: string;
  placeholder?: string;
  icon?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  testID?: string;
};

export function FieldCard({
  label,
  value,
  placeholder = 'Сонгохоос эхлээрэй',
  icon,
  onPress,
  disabled,
  accessibilityLabel,
  testID,
}: Props) {
  const body = (
    <View style={[styles.card, disabled && styles.cardDisabled]}>
      <View style={styles.left}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <ThemedText style={[styles.value, !value && styles.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </ThemedText>
      </View>
      {icon}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || label}
        testID={testID}
      >
        {body}
      </Pressable>
    );
  }

  return body;
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 16,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.995 }],
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardDisabled: {
    opacity: 0.5,
  },
  left: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#94a3b8',
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  placeholder: {
    color: '#94a3b8',
    fontWeight: '500',
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: BrandColors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

