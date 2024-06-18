import React, { useCallback, useEffect, useState } from "react";
import { useSharedState } from "../context/context";
import {
  Box,
  Button,
  Container,
  Divider,
  Link,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";

export const SelectedAccountInfo: React.FC<{ handleBack: () => void }> = ({
  handleBack,
}) => {
  const context = useSharedState();
  const {
    url,
    devnetIsAlive,
    setDevnetIsAlive,
    selectedAccount,
    currentBalance,
    setConfigData,
    configData,
    transactionData,
    setTransactionData,
    signatureData,
    setSignatureData,
  } = context;

  const [isCopyTooltipShown, setIsCopyTooltipShown] = useState(false);

  async function fetchAccountConfig(): Promise<any | null> {
    if (!url) {
      setDevnetIsAlive(false);
      return null;
    }
    try {
      await fetch(`http://${url}/is_alive`);
      setDevnetIsAlive(true);
    } catch (error) {
      setDevnetIsAlive(false);
      return null;
    }

    try {
      const configResponse = await fetch(`http://${url}/config`);
      const configData = await configResponse.json();
      setConfigData(configData);
      return configData;
    } catch (error) {
      console.error("Error fetching config logs:", error);
      return null;
    }
  }

  const handleCopyAddress = () => {
    if (selectedAccount) {
      navigator.clipboard.writeText(selectedAccount.address);
    }
  };

  const handleConfirm = useCallback(
    (message: any) => {
      if (!selectedAccount || (!transactionData && !signatureData)) return;

      const messageType = transactionData
        ? "EXECUTE_RIVET_TRANSACTION_RES"
        : "SIGN_RIVET_MESSAGE_RES";

      chrome.runtime.sendMessage({
        type: messageType,
        data: message,
      });

      setTransactionData(null);
      setSignatureData(null);

      chrome.windows.getCurrent((window) => {
        if (window && window.id) {
          chrome.windows.remove(window.id);
        }
      });
    },
    [selectedAccount, transactionData, signatureData]
  );

  const showTooltip = async () => {
    setIsCopyTooltipShown(true);
    setTimeout(() => setIsCopyTooltipShown(false), 3000);
  };

  const handleDecline = useCallback(
    (message: any) => {
      if (selectedAccount) {
        chrome.runtime.sendMessage({
          type: "RIVET_TRANSACTION_FAILED",
          data: message,
        });
        setTransactionData(null);
        setSignatureData(null);

        chrome.windows.getCurrent((window) => {
          if (window && window.id) {
            chrome.windows.remove(window.id);
          }
        });
      }
    },
    [selectedAccount]
  );

  useEffect(() => {
    fetchAccountConfig();
  }, []);

  const balanceBigInt = BigInt(currentBalance) / BigInt(10n ** 18n);
  const balanceString = balanceBigInt.toString();
  const shortAddress = selectedAccount
    ? `${selectedAccount.address.slice(0, 12)}...${selectedAccount.address.slice(-12)}`
    : "";

  return (
    <section>
      <Box paddingBottom={transactionData || signatureData ? 3 : 6}>
        <Stack
          direction={"row"}
          justifyContent={"center"}
          position={"relative"}
        >
          <Box position={"absolute"} top={0} left={0}>
            <Button
              size="small"
              variant={"text"}
              startIcon={<ChevronLeft />}
              onClick={handleBack}
              sx={{
                padding: "8px 10px",
                // "&:hover": { backgroundColor: "transparent" },
              }}
            >
              Back
            </Button>
          </Box>
          <Container>
            <Typography variant="h6" margin={0} marginY={2}>
              Account Info
            </Typography>
          </Container>
        </Stack>
        {devnetIsAlive && selectedAccount && configData && (
          <>
            <Divider variant="middle" />
            <Box
              width={"100%"}
              display={"flex"}
              justifyContent={"flex-end"}
              alignItems={"center"}
              padding={2}
            >
              <Typography variant="caption">
                Chain ID: {configData.chain_id}
              </Typography>
            </Box>
            {selectedAccount.address && (
              <Container>
                <Box padding={4}>
                  <Typography variant="h5">{balanceString} ETH</Typography>
                </Box>
                <Box paddingY={1}>
                  <Tooltip
                    PopperProps={{
                      disablePortal: true,
                    }}
                    open={isCopyTooltipShown}
                    disableFocusListener
                    disableHoverListener
                    disableTouchListener
                    title="Address copied to clipboard"
                  >
                    <Link
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCopyAddress();
                        showTooltip();
                      }}
                    >
                      {shortAddress}
                    </Link>
                  </Tooltip>
                </Box>
              </Container>
            )}
          </>
        )}
        {transactionData && (
          <>
            <Divider sx={{ marginY: 3 }} variant="middle" />
            <Container>
              <Typography variant="body1">Transaction Details</Typography>
              <Box
                component="pre"
                padding={1}
                textAlign={"left"}
                borderRadius={"5px"}
                whiteSpace={"pre-wrap"}
                sx={{
                  wordBreak: "break-word",
                  color: transactionData.error ? 'red' : 'inherit',
                }}
              >
                {transactionData.error
                ? JSON.stringify(transactionData.error, null, 2)
                : JSON.stringify(transactionData.data, null, 2)}
              </Box>
              <Stack justifyContent={"center"} direction={"row"} spacing={3}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleConfirm(transactionData.data)}
                  disabled={!!transactionData.error}
                >
                  Confirm
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => handleDecline(transactionData.data)}
                >
                  Decline
                </Button>
              </Stack>
            </Container>
          </>
        )}
        {signatureData && (
          <>
            <Divider sx={{ marginY: 3 }} variant="middle" />
            <Container>
              <Typography variant="body1">Signature Details</Typography>
              <Box
                component="pre"
                padding={1}
                textAlign={"left"}
                borderRadius={"5px"}
                whiteSpace={"pre-wrap"}
                sx={{
                  wordBreak: "break-word",
                }}
              >
                {JSON.stringify(signatureData, null, 2)}
              </Box>
              <Stack justifyContent={"center"} direction={"row"} spacing={3}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => handleConfirm(signatureData)}
                >
                  Confirm
                </Button>
              </Stack>
            </Container>
          </>
        )}
      </Box>
    </section>
  );
};

export default SelectedAccountInfo;
