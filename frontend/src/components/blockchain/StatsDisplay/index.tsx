import React, { FC } from 'react';
import {
  GridItem,
  Grid,
} from '@chakra-ui/react';
import { Container } from 'components/ui/Container';
import {CirculatingSupply} from "./CirculatingSupply";
import {APY} from "./APY";
import {WarLocked} from "./WarLocked";
import {TVL} from "./TVL";

export interface StatsDisplayProps {}

export const StatsDisplay: FC<StatsDisplayProps> = () => {
  return (
    <Container mx={'4em'} borderRadius={'1.5em'}>
      <Grid gap={'2em'} templateColumns={'repeat(4, 1fr)'}>
        <GridItem minW={'22%'}>
          <CirculatingSupply />
        </GridItem>
        <GridItem minW={'22%'}>
          <WarLocked />
        </GridItem>
        <GridItem minW={'22%'}>
          <TVL />
        </GridItem>
        <GridItem minW={'22%'}>
          <APY />
        </GridItem>
      </Grid>
    </Container>
  );
};

StatsDisplay.defaultProps = {};
