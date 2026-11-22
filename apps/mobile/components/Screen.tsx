import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { Text } from 'react-native-paper';
import { palette } from '@/lib/theme';

export function Screen({
  children,
  scroll = true,
  ...rest
}: { children: React.ReactNode; scroll?: boolean } & ScrollViewProps) {
  if (!scroll) {
    return <View style={styles.fill}>{children}</View>;
  }
  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" {...rest}>
      {children}
    </ScrollView>
  );
}

export function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.section}>{children}</Text>;
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: palette.background },
  content: { padding: 20, gap: 14, backgroundColor: palette.background, flexGrow: 1 },
  section: {
    marginTop: 8,
    color: palette.navy,
    fontSize: 16,
    fontWeight: '700',
  },
});
