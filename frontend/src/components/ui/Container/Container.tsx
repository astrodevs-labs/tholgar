import React, {FC, PropsWithChildren} from "react";
import {Box, useColorMode, useColorModeValue} from "@chakra-ui/react";
import BorderedComponentProps, {defaultBorderedComponentProps} from "utils/BorderedComponentProps";
import useFormatBorderProps from "hooks/useFormatBorderProps";

export interface ContainerProps extends BorderedComponentProps{
  lightColor?: string;
  darkColor?: string;
}

export const Container: FC<PropsWithChildren<ContainerProps>> = (props) => {
  const {lightColor, darkColor} = props;
  const {colorMode} = useColorMode();
  const backgroundColor = useColorModeValue(lightColor, darkColor);

  const borderProps = useFormatBorderProps(props);
  console.log(borderProps);

  return (
    <Box backgroundColor={backgroundColor} {...borderProps} >
      {props.children}
    </Box>
  )
}

Container.defaultProps = {
  lightColor: "gray.100",
  darkColor: "gray.900",
  ...defaultBorderedComponentProps
}