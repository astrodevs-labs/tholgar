import { useColorModeValue } from '@chakra-ui/react';
import BorderedComponentProps from 'utils/BorderedComponentProps';

export default function useFormatBorderProps(props: BorderedComponentProps) {
  const color = useColorModeValue(props.borderslightColor, props.bordersdarkColor);

  return {
    borders: props.borders ? props.borderType : 'none',
    borderRadius: props.bordersRounded ? props.bordersRadius : '0',
    borderWidth: props.borders ? props.borderThickness : '0',
    borderColor: props.borders ? color : 'none'
  };
}
