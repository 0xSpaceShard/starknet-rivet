import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Container,
  CircularProgress,
} from '@mui/material';
import React, { useState, useEffect, useCallback, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from '@mui/icons-material';
import {
  fetchCurrentBlockNumber,
  fetchCurrentGasPrices,
  updateGasPrices,
} from '../../background/utils';
import { useSharedState } from '../context/context';

export const GasPriceModification: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentBlock } = useSharedState();
  const [gasPrices, setGasPrices] =
    useState<Awaited<ReturnType<typeof fetchCurrentGasPrices>>>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleBack = () => {
    navigate(`/app-settings`);
  };

  const fetchGasPrices = async () => {
    setIsLoading(true);
    const data = await fetchCurrentGasPrices();
    setGasPrices(data);
    setIsLoading(false);
  };

  const submitForm = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!gasPrices) return;
      await updateGasPrices(gasPrices);
      const blockNumber = await fetchCurrentBlockNumber();
      if (blockNumber >= 0) {
        setCurrentBlock(blockNumber);
      }
      fetchGasPrices();
    },
    [gasPrices]
  );

  useEffect(() => {
    fetchGasPrices();
  }, []);

  return (
    <section>
      <Stack direction={'row'} justifyContent={'center'} position={'relative'}>
        <Box position={'absolute'} top={0} left={0}>
          <Button
            size="small"
            variant={'text'}
            startIcon={<ChevronLeft />}
            onClick={handleBack}
            sx={{
              padding: '8px 10px',
            }}
          >
            Back
          </Button>
        </Box>
        <Container>
          <Typography variant="h6" margin={0} marginY={2}>
            Gas Prices
          </Typography>
        </Container>
      </Stack>
      <Box paddingY={1}>
        <form id="gas-prices-form">
          {!isLoading ? (
            gasPrices ? (
              <>
                <Stack textAlign={'left'} paddingX={3} spacing={3}>
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      name="gasPriceWei"
                      value={gasPrices?.gasPriceWei.toString()}
                      label={'Gas Price'}
                      onChange={(e) => {
                        setGasPrices({ ...gasPrices, gasPriceWei: BigInt(e.target.value) });
                      }}
                      variant={'outlined'}
                      size={'small'}
                      type="number"
                    ></TextField>
                  </Box>
                  <Box flex={1}>
                    <TextField
                      fullWidth
                      name="gasPriceWei_data"
                      value={gasPrices?.gasPriceWei_data.toString()}
                      label={'Data Gas Price'}
                      onChange={(e) => {
                        setGasPrices({ ...gasPrices, gasPriceWei_data: BigInt(e.target.value) });
                      }}
                      variant={'outlined'}
                      size={'small'}
                      type="number"
                    ></TextField>
                  </Box>
                </Stack>
                <Box marginTop={3}>
                  <Container>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={submitForm}
                      disabled={false}
                      type="submit"
                    >
                      Update Gas Prices
                    </Button>
                  </Container>
                </Box>
              </>
            ) : null
          ) : (
            <Stack direction="row" justifyContent="center" paddingY={2}>
              <CircularProgress size={20} />
            </Stack>
          )}
        </form>
      </Box>
    </section>
  );
};
