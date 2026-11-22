import { MD3LightTheme, configureFonts, type MD3Theme } from 'react-native-paper';

export const palette = {
  navy: '#0B1F33',
  ink: '#12263A',
  blue: '#1F6FEB',
  teal: '#0F766E',
  bronze: '#A67C52',
  background: '#F3F6F9',
  mist: '#E8EEF4',
  card: '#FFFFFF',
  success: '#0F7A45',
  warning: '#B45309',
  danger: '#B42318',
  muted: '#5B6B7C',
  line: '#D7E0EA',
  soft: '#F7FAFC',
};

const fontConfig = {
  fontFamily: 'DMSans_400Regular',
} as const;

export const fonts = {
  display: 'Fraunces_600SemiBold',
  displayBold: 'Fraunces_700Bold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
};

export const theme: MD3Theme = {
  ...MD3LightTheme,
  roundness: 18,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.navy,
    secondary: palette.teal,
    background: palette.background,
    surface: palette.card,
    surfaceVariant: palette.mist,
    error: palette.danger,
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    outline: palette.line,
  },
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  xxl: 36,
};
