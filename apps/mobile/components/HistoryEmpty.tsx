import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { palette } from '@/lib/theme';

export function HistoryEmpty({ onEvaluate }: { onEvaluate?: () => void }) {
  return (
    <View style={styles.wrap}>
      <Text variant="titleMedium" style={styles.title}>
        No evaluations yet
      </Text>
      <Text style={styles.copy}>Submit a property to see an AI valuation and investment recommendation.</Text>
      {onEvaluate ? (
        <Button mode="contained" onPress={onEvaluate} style={styles.button}>
          Evaluate a property
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: palette.line,
  },
  title: { color: palette.navy, fontWeight: '700' },
  copy: { color: palette.muted, lineHeight: 20 },
  button: { marginTop: 8, borderRadius: 12 },
});
