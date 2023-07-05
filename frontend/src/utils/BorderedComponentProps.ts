import * as CSS from 'csstype';

export default interface BorderedComponentProps {
  borders?: boolean;
  bordersRounded?: boolean;
  borderType?: CSS.Property.Border;
  borderThickness?: CSS.Property.BorderWidth;
  bordersRadius?: CSS.Property.BorderRadius;
  borderslightColor?: string;
  bordersdarkColor?: string;
}

export const defaultBorderedComponentProps: BorderedComponentProps = {
  borders: true,
  bordersRounded: true,
  borderType: 'solid',
  borderThickness: '1px',
  bordersRadius: '5px',
  borderslightColor: 'gray.200',
  bordersdarkColor: 'gray.700'
};
