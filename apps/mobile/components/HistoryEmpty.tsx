import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { PrimaryButton } from '@/components/PrimaryButton';
import { fonts, palette, spacing } from '@/lib/theme';

export function HistoryEmpty({ onEvaluate }: { onEvaluate?: () => void }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>No evaluations yet</Text>
      <Text style={styles.copy}>Submit a property to see an AI valuation and investment recommendation.</Text>
      {onEvaluate ? <PrimaryButton label="Evaluate a property" onPress={onEvaluate} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: palette.card,
    borderRadius: 22,
    padding: spacing.lg,
    gap: 10,
    borderWidth: 1,
    borderColor: palette.line,
  },
  title: { color: palette.navy, fontFamily: fonts.display, fontSize: 20 },
  copy: { color: palette.muted, fontFamily: fonts.body, lineHeight: 21 },
});
