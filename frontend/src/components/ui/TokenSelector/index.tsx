import { FC, useMemo, useState } from 'react';
import {
  Button,
  HStack,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useColorModeValue
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';

export interface TokenSelectorProps {
  // eslint-disable-next-line no-unused-vars
  onTokenSelect: (token: string) => void;
  tokens: { id: string; name: string; iconUrl: string }[];
}

// eslint-disable-next-line no-unused-vars
const Item: FC<{ name: string; iconUrl: string }> = ({ name, iconUrl }) => (
  <HStack py={2}>
    <Image boxSize="2rem" borderRadius="full" src={iconUrl} alt={name} mr="12px" />
    <Text fontWeight={'medium'}>{name}</Text>
  </HStack>
);

export const TokenSelector: FC<TokenSelectorProps> = ({ onTokenSelect, tokens }) => {
  const [idSelected, setIdSelected] = useState<string>(tokens[0]?.id ?? '');
  const selected = useMemo(() => tokens.find((t) => t.id == idSelected), [idSelected, tokens]);
  const select = (token: string) => {
    setIdSelected(token);
    onTokenSelect(token);
  };
  const bgColor = useColorModeValue('background.200.light', 'background.200.dark');

  return (
    <Menu matchWidth={true}>
      <MenuButton as={Button} bgColor={bgColor} _hover={{}} _active={{}} rightIcon={<ChevronDownIcon />} w={'100%'}>
        <Item {...selected!} />
      </MenuButton>
      <MenuList w={'100%'}>
        {tokens.map((t) => (
          <MenuItem key={t.id} h={'3rem'} w={'full'} onClick={() => select(t.id)} _hover={{color: 'brand.secondary'}}>
            <Item {...t} />
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

TokenSelector.defaultProps = {};
