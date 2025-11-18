import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

export function HapticTab({ style, ...props }: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      style={({ pressed }) => [
        style,
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 16,
          outlineStyle: 'none' as const,
        },
        pressed && { opacity: 0.7 },
      ]}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        props.onPressIn?.(ev);
      }}
    />
  );
}
