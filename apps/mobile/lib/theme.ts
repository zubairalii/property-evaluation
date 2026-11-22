import { MD3LightTheme, type MD3Theme } from 'react-native-paper';

export const palette = {
  navy: '#172554',
  blue: '#2563EB',
  background: '#F8FAFC',
  card: '#FFFFFF',
  success: '#15803D',
  warning: '#C2410C',
  danger: '#B91C1C',
  muted: '#64748B',
  line: '#E2E8F0',
};

export const theme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.navy,
    secondary: palette.blue,
    background: palette.background,
    surface: palette.card,
    error: palette.danger,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
  },
};
