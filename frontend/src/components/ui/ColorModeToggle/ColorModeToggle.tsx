import React, { FC, PropsWithChildren } from 'react';
import { IconButton, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSun, faMoon, IconLookup } from '@fortawesome/free-solid-svg-icons';

export interface ColorModeToggleProps {
  /**
   * @property lightIcon light color icon identifier (font awesome)
   */
  lightIcon?: IconLookup;

  /**
   * @property darkIcon dark color icon identifier (font awesome)
   */
  darkIcon?: IconLookup;
}

export const ColorModeToggle: FC<PropsWithChildren<ColorModeToggleProps>> = ({
  lightIcon,
  darkIcon
}) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const icon = useColorModeValue(lightIcon, darkIcon);

  return (
    <>
      <IconButton
        aria-label={`Switch to ${colorMode === 'light' ? 'dark' : 'light'} mode`}
        icon={<FontAwesomeIcon icon={icon!} />}
        onClick={toggleColorMode}
      />
    </>
  );
};

ColorModeToggle.defaultProps = {
  lightIcon: faSun,
  darkIcon: faMoon
};
