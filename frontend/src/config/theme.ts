import { Colors, extendTheme, StyleFunctionProps, ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { modalTheme as depositModalTheme } from 'components/panels/DepositModal/style';
import { menuTheme } from '../components/ui/TokenSelector/style';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false
};

const colors: Colors = {
  brand: {
    primary: {
      100: '#007f45',
      200: '#b1ead0',
      300: '#02b261',
      400: '#00cf6f'
    },
    secondary: '#13ff01'
  },
  background: {
    dark: '#112e2f',
    light: '#f8f8f8',
    100: {
      dark: '#1f5253',
      light: '#fefefe'
    },
    200: {
      dark: '#163b3c',
      light: '#fcfcfd'
    },
    300: {
      dark: '#112e2f',
      light: '#f8f8f8'
    },
    500: {
      dark: '#102a2b',
      light: '#fefefe'
    }
  },
  border: {
    dark: '#5c5c5c',
    light: '#E2E8F0'
  }
};

const theme = extendTheme({
  config,
  colors,
  styles: {
    global: (props: StyleFunctionProps) => ({
      body: {
        bg: mode('background.light', 'background.dark')(props)
      },
      // border color
      '*, ::before, ::after': {
        borderColor: mode('border.light', 'border.dark')(props)
      }
    })
  },
  components: {
    Modal: depositModalTheme,
    Menu: menuTheme
  }
});

export default theme;

export const DESKTOP_BREAKPOINT = 768; // px
