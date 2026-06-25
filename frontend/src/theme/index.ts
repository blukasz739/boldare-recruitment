import { createTheme, type MantineColorsTuple } from '@mantine/core';

const accent: MantineColorsTuple = [
  '#fdffe8',
  '#f5ffc4',
  '#ecff96',
  '#e3ff5c',
  '#d9ff2e',
  '#d4ff00',
  '#b8e600',
  '#9acc00',
  '#7cb300',
  '#5e9900',
];

const neutral: MantineColorsTuple = [
  '#fafafa',
  '#f4f4f5',
  '#e4e4e7',
  '#d4d4d8',
  '#a1a1aa',
  '#71717a',
  '#52525b',
  '#3f3f46',
  '#27272a',
  '#18181b',
];

export const theme = createTheme({
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  headings: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    fontWeight: '700',
  },
  primaryColor: 'accent',
  colors: {
    accent,
    neutral,
  },
  defaultRadius: 'lg',
  white: '#ffffff',
  black: '#09090b',
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Modal: {
      defaultProps: {
        radius: 'lg',
        overlayProps: { backgroundOpacity: 0.55, blur: 4 },
      },
    },
    Paper: {
      defaultProps: {
        radius: 'lg',
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    NumberInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Select: {
      defaultProps: {
        radius: 'md',
      },
    },
    SegmentedControl: {
      defaultProps: {
        radius: 'md',
      },
    },
  },
});
