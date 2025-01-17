import { Stack, Typography } from '@mui/material';

import { ContractItem } from './ContractItem';
import { darkTheme } from '../..';
import { useSharedState } from '../context/context';

export const ContractList: React.FC = () => {
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
            </Stack>
          </>
        )}
      </Stack>
    </section>
  );
};
