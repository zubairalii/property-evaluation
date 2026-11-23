import { LinearGradient } from 'expo-linear-gradient';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
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
  centered = false,
  style,
  ...rest
}: {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  /** Vertically balance short screens (login / register) instead of pinning to the top. */
  centered?: boolean;
  style?: StyleProp<ViewStyle>;
} & ScrollViewProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const pad = {
    paddingTop: centered ? Math.max(insets.top, spacing.sm) + spacing.md : Math.max(insets.top, spacing.md) + spacing.lg,
    paddingHorizontal: padded ? spacing.lg : 0,
    paddingBottom: Math.max(insets.bottom, spacing.md) + spacing.xxl,
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={[palette.mist, palette.background, '#F8FBFD']} style={StyleSheet.absoluteFill} />
      {scroll ? (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            centered && styles.centered,
            centered && { minHeight: height - insets.top - insets.bottom },
            pad,
            style,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...rest}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, centered && styles.centered, pad, style]}>{children}</View>
      )}
    </View>
  );
}

export function AuthPanel({ children }: { children: React.ReactNode }) {
  return <View style={styles.panel}>{children}</View>;
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
  centered: {
    justifyContent: 'center',
  },
  panel: {
    gap: spacing.md,
    borderRadius: 28,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.line,
    padding: spacing.lg,
    shadowColor: palette.navy,
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
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
