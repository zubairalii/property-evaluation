import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';
import { fonts, palette } from '@/lib/theme';

interface Option {
  value: string;
  label: string;
}

export function SelectField({
  label,
  value,
  options,
  onChange,
  error,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value)?.label ?? 'Select';

  return (
    <View>
      <Pressable onPress={() => setOpen(true)}>
        <TextInput
          mode="outlined"
          label={label}
          value={selected}
          editable={false}
          pointerEvents="none"
          outlineColor={palette.line}
          activeOutlineColor={palette.teal}
          style={styles.input}
          right={<TextInput.Icon icon="chevron-down" />}
          error={Boolean(error)}
        />
      </Pressable>
      {error ? <HelperText type="error">{error}</HelperText> : null}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.title}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              ListEmptyComponent={<Text style={styles.empty}>No options available yet.</Text>}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={item.value === value ? styles.active : styles.optionText}>{item.label}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: palette.card },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 31, 51, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: palette.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 18,
  },
  title: {
    fontSize: 18,
    fontFamily: fonts.display,
    color: palette.navy,
    marginBottom: 8,
  },
  option: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.line,
  },
  optionText: { color: palette.ink, fontFamily: fonts.body, fontSize: 16 },
  active: { color: palette.teal, fontFamily: fonts.bodyBold, fontSize: 16 },
  empty: { color: palette.muted, fontFamily: fonts.body, paddingVertical: 16 },
});
