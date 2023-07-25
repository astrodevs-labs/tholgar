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
    primary: '#2E86AB',
    secondary: '#F46036'
  },
  background: {
    dark: '#222222',
    light: '#F8F8F8'
  },
  border: {
    dark: '#2D3748',
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
