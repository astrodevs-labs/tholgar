import {Colors, extendTheme, ThemeConfig} from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

const colors: Colors = {
  brand: {
    primary: '#ff0000',
    secondary: '#00ff00',
  },
  background: {
    dark: '#0d0d0d',
    light: '#f5f5f5',
  }
}

const theme = extendTheme({ config, colors })

export default theme