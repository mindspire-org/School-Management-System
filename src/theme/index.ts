import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },
  accent: {
    50: '#e6fffb',
    100: '#b2f5ea',
    200: '#81e6d9',
    300: '#4fd1c5',
    400: '#2cbbb0',
    500: '#14b8a6',
    600: '#0f9488',
    700: '#0b6f67',
    800: '#084c47',
    900: '#04312e',
  },
};

const radii = {
  sm: '6px',
  md: '8px',
  lg: '12px',
};

const shadows = {
  sm: '0 1px 2px rgba(16, 24, 40, 0.06), 0 1px 3px rgba(16, 24, 40, 0.10)',
  md: '0 4px 10px rgba(16, 24, 40, 0.10)',
  lg: '0 10px 20px rgba(16, 24, 40, 0.14)',
};

const space = {
  '4.5': '18px',
  '7.5': '30px',
  '18': '72px',
};

const styles = {
  global: {
    'html, body': {
      bg: 'gray.50',
      color: 'gray.800',
    },
  },
};

const components = {
  Button: {
    baseStyle: {
      borderRadius: 'md',
      fontWeight: 600,
    },
  },
  Input: {
    baseStyle: {
      field: {
        borderRadius: 'md',
      },
    },
    defaultProps: {
      focusBorderColor: 'brand.500',
    },
  },
  Select: {
    baseStyle: {
      field: {
        borderRadius: 'md',
      },
    },
    defaultProps: {
      focusBorderColor: 'brand.500',
    },
  },
  Table: {
    baseStyle: {
      th: {
        textTransform: 'none',
        letterSpacing: 'normal',
      },
    },
  },
  Badge: {
    baseStyle: {
      borderRadius: 'full',
      px: 2,
      py: 1,
      fontWeight: 700,
    },
  },
};

export const theme = extendTheme({
  config,
  colors,
  radii,
  shadows,
  space,
  styles,
  components,
});

export default theme;
