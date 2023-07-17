import { menuAnatomy } from '@chakra-ui/anatomy';
import { createMultiStyleConfigHelpers } from '@chakra-ui/react';

const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(
  menuAnatomy.keys
);

// define the base component styles
const baseStyle = definePartsStyle({
  button: {
    // this will style the MenuButton component
    bg: `background.light`,

    // Let's also provide dark mode alternatives
    _dark: {
      bg: `background.dark`
    }
  },
  list: {
    // this will style the MenuList component
    bg: `background.light`,

    // Let's also provide dark mode alternatives
    _dark: {
      bg: `background.dark`
    }
  },
  item: {
    // this will style the MenuItem and MenuItemOption components
    bg: `background.light`,

    // Let's also provide dark mode alternatives
    _dark: {
      bg: `background.dark`
    }
  }
});
// export the base styles in the component theme
export const menuTheme = defineMultiStyleConfig({ baseStyle });
