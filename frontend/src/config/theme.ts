import { Colors, extendTheme, StyleFunctionProps, ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { modalTheme as depositModalTheme } from 'components/panels/DepositModal/style';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false
};

const colors: Colors = {
  brand: {
    primary: '#ff0000',
    secondary: '#00ff00'
  },
  background: {
    dark: '#1A202C',
    light: '#f5f5f5'
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
    Modal: depositModalTheme
  }
});

export default theme;
