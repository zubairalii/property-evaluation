import { LinearGradient } from 'expo-linear-gradient';
import {
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, palette, spacing } from '@/lib/theme';

export function Screen({
  children,
  scroll = true,
  padded = true,
  style,
  ...rest
}: {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
} & ScrollViewProps) {
  const insets = useSafeAreaInsets();
  const pad = {
    paddingTop: Math.max(insets.top, spacing.md) + spacing.lg,
    paddingHorizontal: padded ? spacing.lg : 0,
    paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.xxl,
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[palette.mist, palette.background, '#F8FBFD']} style={StyleSheet.absoluteFill} />
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, pad, style]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...rest}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, pad, style]}>{children}</View>
      )}
    </View>
  );
}

export function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.section}>{children}</Text>;
}

export function ScreenHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.header}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.background },
  fill: { flex: 1 },
  content: { gap: spacing.md, flexGrow: 1 },
  header: { gap: 8, marginBottom: spacing.sm },
  eyebrow: {
    color: palette.teal,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    color: palette.navy,
    fontFamily: fonts.displayBold,
    fontSize: 30,
    lineHeight: 36,
  },
  subtitle: {
    color: palette.muted,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  section: {
    marginTop: spacing.sm,
    marginBottom: 2,
    color: palette.navy,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
