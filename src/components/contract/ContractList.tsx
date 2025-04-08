import React from 'react';
import { CircularProgress, Stack, Typography, Box } from '@mui/material';

import { ContractItem } from './ContractItem';
import { darkTheme } from '../..';
import { useSharedState } from '../context/dataContext';
import { useDeployedContracts } from '../hooks/useDeployedContracts';
import { Contract } from '../../background/interface';

export const ContractList: React.FC = () => {
  const { configData } = useSharedState();
  const { data: deployedContracts, isLoading } = useDeployedContracts();

  return (
    <section>
      <Stack marginBottom={1} color={darkTheme.palette.text.secondary}>
        {!configData ? (
          <Stack direction="row" justifyContent="center" paddingY={2}>
            <Typography variant="h4">No data found</Typography>
          </Stack>
        ) : (
          <>
            <Stack marginBottom={1} spacing={'1.5em'}>
              <Box>
                <Typography variant="subtitle1">Predeployed FeeToken</Typography>
                <Stack>
                  <ContractItem
                    address="0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7"
                    name="ETH Address"
                  />
                  <ContractItem
                    address={configData?.eth_erc20_class_hash as string}
                    name="Class hash"
                  />
                  <ContractItem
                    address="0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
                    name="STRK Address"
                  />
                  <ContractItem
                    address={configData?.strk_erc20_class_hash as string}
                    name="Class hash"
                  />
                </Stack>
              </Box>
              <Box>
                <Typography variant="subtitle1">Deployed Contracts</Typography>
                <Stack>
                  {isLoading ? (
                    <Stack direction="row" justifyContent="center" paddingY={2}>
                      <CircularProgress />
                    </Stack>
                  ) : (deployedContracts as Contract[])?.length ? (
                    (deployedContracts as Contract[]).map((contract: Contract, idx: number) => (
                      <React.Fragment key={idx}>
                        <ContractItem address={contract.address} name={contract.name} />
                        <ContractItem address={contract.classHash} name="Class hash" />
                      </React.Fragment>
                    ))
                  ) : (
                    <Typography variant="caption" marginTop={'1em'}>
                      No deployed contracts
                    </Typography>
                  )}
                </Stack>
              </Box>
            </Stack>
          </>
        )}
      </Stack>
    </section>
  );
};
