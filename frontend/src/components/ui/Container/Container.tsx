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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
    children,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
    borders,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
    bordersRounded,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
    borderType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
    borderThickness,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
    bordersRadius,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
    borderslightColor,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
    bordersdarkColor,
    ...boxProps
  } = rest;
  /* eslint-enable @typescript-eslint/no-unused-vars,no-unused-vars */

  return (
    <Box
      p={'1.25em'}
      mt={'1.25em'}
      mb={'1.25em'}
      boxSizing="border-box"
      backgroundColor={backgroundColor}
      {...borderProps}
      {...boxProps}>
      {props.children}
    </Box>
  );
};

Container.defaultProps = {
  lightColor: 'background.500.light',
  darkColor: 'background.500.dark',
  ...defaultBorderedComponentProps
};
