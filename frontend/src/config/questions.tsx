import { JSX } from 'react';
import { HStack, Link, Text, VStack } from '@chakra-ui/react';

export const questions: { question: string; answer: string | (() => JSX.Element) }[] = [
  {
    question: 'What is Tholgar ?',
    answer:
      'Tholgar is an auto-compounder vault of WAR index from Paladin Finance. Its aim is to maximize your yield by auto compounding rewards from governance tokens'
  },
  {
    question: 'How to use Tholgar ?',
    answer:
      'When you deposit your tokens in Tholgar, you receive tWAR tokens, acting as a receipt and counting your shares in the auto-compounder. The value of each share increase every time the rewards are harvested. When you bring back your tWAR to withdraw, you receive your principal + your share ratio of the collected rewards.'
  },
  {
    question: 'Which tokens can I use to deposit ? ',
    answer: 'You can currently deposit either with WAR token or AURA and CVX. '
  },
  {
    question: 'Which tokens can I withdraw ? ',
    answer:
      'You can exchange your tWAR to withdraw your principal and rewards in WAR. You will soon be able to withdraw in AURA and CVX. In the meantime you can use official warlord frontend to withdraw in AURA and CVX.'
  },
  {
    question: 'What are the fees',
    answer:
      'The only fees we take is 5% of total harvested amount. This fee is used to cover gas cost for the compound transactions'
  },
  {
    question: 'How often are rewards harvested ?',
    answer: 'Rewards are harvested once every week'
  },
  {
    question: 'What about security? Can devs access my funds ?',
    answer: () => (
      <VStack align={'flex-start'}>
        <Text>
          Tholgar doesn&apos;t hold custody of your WAR, so if you keep it safe yourself, it&apos;s
          safe
        </Text>
        <Text>
          Tholgar has been built with careful attention to scurity and is based on the battle-tested
          auto-compounder vaults by Yearn, standardized by ERC-4626
        </Text>
      </VStack>
    )
  },
  {
    question: 'Wen token',
    answer:
      "Our aim with Tholgar is to support Paladin ecosystem with different products. Yet we don't feel the need to launch a token"
  },
  {
    question: 'Where are contracts deployed at ?',
    answer: () => (
      <VStack align={'flex-start'}>
        <HStack>
          <Text>Vault:</Text>
          <Link
            href="https://etherscan.io/address/0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5"
            isExternal>
            0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5
          </Link>
        </HStack>
        <HStack>
          <Text>Zap:</Text>
          <Link
            href="https://etherscan.io/address/0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5"
            isExternal>
            0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5
          </Link>
        </HStack>
        <HStack>
          <Text>Swapper:</Text>
          <Link
            href="https://etherscan.io/address/0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5"
            isExternal>
            0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5
          </Link>
        </HStack>
      </VStack>
    )
  }
];
