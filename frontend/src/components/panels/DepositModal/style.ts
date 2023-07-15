import { modalAnatomy as parts } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/styled-system';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(parts.keys);

const brand = definePartsStyle({
  dialog: {
    borderRadius: 'md',
    bg: `background.light`,

    // Let's also provide dark mode alternatives
    _dark: {
      bg: `background.dark`
    }
  }
});

export const modalTheme = defineMultiStyleConfig({
  variants: { brand }
});
