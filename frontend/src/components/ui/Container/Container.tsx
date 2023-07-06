import React, { FC, PropsWithChildren } from 'react';
import { Box, BoxProps, useColorModeValue } from '@chakra-ui/react';
import BorderedComponentProps, {
  defaultBorderedComponentProps
} from 'utils/BorderedComponentProps';
import useFormatBorderProps from 'hooks/useFormatBorderProps';

export interface ContainerProps extends BorderedComponentProps, BoxProps {
  lightColor?: string;
  darkColor?: string;
}

export const Container: FC<PropsWithChildren<ContainerProps>> = (props) => {
  const { lightColor, darkColor, ...rest } = props;
  const backgroundColor = useColorModeValue(lightColor, darkColor);
  const borderProps = useFormatBorderProps(props);
  const {
    /* eslint-disable no-unused-vars */
    children,
    borders,
    bordersRounded,
    borderType,
    borderThickness,
    bordersRadius,
    borderslightColor,
    bordersdarkColor,
    ...boxProps
  } = rest;
  /* eslint-enable no-unused-vars */

  return (
    <Box backgroundColor={backgroundColor} {...borderProps} {...boxProps}>
      {props.children}
    </Box>
  );
};

Container.defaultProps = {
  lightColor: 'gray.100',
  darkColor: 'gray.900',
  ...defaultBorderedComponentProps
};
