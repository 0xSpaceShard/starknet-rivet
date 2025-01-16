import React from 'react';
import { CircularProgress, Stack, Typography } from '@mui/material';

import { ContractItem } from './ContractItem';
import { darkTheme } from '../..';
import { useSharedState } from '../context/context';
import { useDeployedContracts } from '../hooks/useDeployedContracts';
import { Contract } from '../../background/interface';

export const ContractList: React.FC = () => {
  const { data: deployedContracts, isLoading } = useDeployedContracts();
  const { configData } = useSharedState();

  return (
    <section>
      <Stack marginBottom={1} color={darkTheme.palette.text.secondary}>
        {!configData ? (
          <Stack direction="row" justifyContent="center" paddingY={2}>
            <Typography variant="h4">No data found</Typography>
          </Stack>
        ) : (
          <>
            <Stack marginBottom={1}>
              <Typography variant="subtitle1">Predeployed FeeToken</Typography>
              <Stack>
                <ContractItem
                  address="0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
                  name="ETH Address"
                />
                <ContractItem
                  address={configData?.eth_erc20_class_hash as string}
                  name="Class Hash"
                />
                <ContractItem
                  address="0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
                  name="STRK Address"
                />
                <ContractItem
                  address={configData?.strk_erc20_class_hash as string}
                  name="Class Hash"
                />
              </Stack>

              <Typography variant="subtitle1">Deployed Contracts</Typography>
              <Stack>
                {isLoading ? (
                  <Stack direction="row" justifyContent="center" paddingY={2}>
                    <CircularProgress />
                  </Stack>
                ) : (
                  deployedContracts?.map((contract: Contract) => (
                    <ContractItem address={contract.address} name={contract.name} />
                  ))
                )}
              </Stack>
            </Stack>
          </>
        )}
      </Stack>
    </section>
  );
};
