import { FC } from 'react';
import { AbsoluteCenter, Box /*, Center, Flex*/ } from '@chakra-ui/react';
const DesktopRedirect: FC = () => {
  return (
    <Box h={'100vh'} w={'100%'}>
      <AbsoluteCenter p="4" axis="both" fontSize={'2xl'} w={'100%'} textAlign={'center'}>
        For a best experience, browse this website on a desktop
      </AbsoluteCenter>
    </Box>
  );
};

/*<Flex dir={"column"} alignItems={'center'} h={'100vh'} w={'100%'}>
      <Center fontSize={'2xl'} fontWeight={'bold'}>

        For a best experience, browse this website on a desktop

    </Center>
    </Flex>*/

export default DesktopRedirect;
