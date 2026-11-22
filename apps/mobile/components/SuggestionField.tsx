import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';
import { fonts, palette } from '@/lib/theme';

export function SuggestionField({
  label,
  value,
  onChangeText,
  suggestions,
  error,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  suggestions: string[];
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const visible = useMemo(() => {
    if (!focused || disabled) return [];
    const needle = value.trim().toLowerCase();
    return suggestions
      .filter((item) => (needle ? item.toLowerCase().includes(needle) : true))
      .filter((item) => item.toLowerCase() !== needle)
      .slice(0, 8);
  }, [disabled, focused, suggestions, value]);

  return (
    <View style={styles.wrap}>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        editable={!disabled}
        placeholder={placeholder}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setTimeout(() => setFocused(false), 150);
        }}
        outlineColor={palette.line}
        activeOutlineColor={palette.teal}
        style={styles.input}
        error={Boolean(error)}
      />
      {error ? <HelperText type="error">{error}</HelperText> : null}
      {visible.length > 0 ? (
        <View style={styles.dropdown}>
          {visible.map((item) => (
            <Pressable
              key={item}
              style={styles.option}
              onPress={() => {
                onChangeText(item);
                setFocused(false);
              }}
            >
              <Text style={styles.optionText}>{item}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { zIndex: 2 },
  input: { backgroundColor: palette.card },
  dropdown: {
    marginTop: -2,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 16,
    backgroundColor: palette.card,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.line,
  },
  optionText: { color: palette.navy, fontFamily: fonts.bodyMedium, fontSize: 15 },
});
