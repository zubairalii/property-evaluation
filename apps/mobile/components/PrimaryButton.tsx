import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, palette } from '@/lib/theme';

export function PrimaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  mode = 'contained',
  tone = 'navy',
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  mode?: 'contained' | 'outlined' | 'text';
  tone?: 'navy' | 'danger' | 'teal';
}) {
  const busy = loading || disabled;
  const background =
    tone === 'teal' ? palette.teal : tone === 'danger' ? palette.danger : palette.navy;
  const labelColor =
    mode === 'contained'
      ? '#fff'
      : tone === 'danger' && mode === 'text'
        ? palette.danger
        : palette.navy;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: busy, busy: loading }}
      disabled={busy}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        mode === 'contained' ? { backgroundColor: background } : null,
        mode === 'outlined' ? styles.outlined : null,
        mode === 'text' ? styles.textMode : null,
        busy ? styles.busy : null,
        pressed && !busy ? styles.pressed : null,
      ]}
    >
      <View style={styles.row}>
        {loading ? <ActivityIndicator color={labelColor} size="small" /> : null}
        <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    minHeight: 54,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlined: {
    borderColor: palette.line,
    borderWidth: 1.5,
    backgroundColor: palette.card,
  },
  textMode: {
    backgroundColor: 'transparent',
    minHeight: 48,
  },
  busy: {
    opacity: 0.88,
  },
  pressed: {
    opacity: 0.9,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    letterSpacing: 0.2,
    lineHeight: 22,
  },
});
