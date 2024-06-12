import React, { useEffect, useState } from "react";
import { AccountData, useSharedState } from "../context/context";
import "./predeployedAccounts.css";
import SingletonContext from "../../services/contextService";
import UrlContext from "../../services/urlService";
import SelectedAccountInfo from "../account/selectedAccount";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";
import { darkTheme } from "../..";
import RegisterRunningDocker from "../registerRunningDocker/registerRunningDocker";

export const PredeployedAccounts: React.FC = () => {
  const context = useSharedState();
  const {
    accounts,
    setAccounts,
    url,
    devnetIsAlive,
    setDevnetIsAlive,
    selectedAccount,
    setSelectedAccount,
    setSelectedComponent,
    setCurrentBalance,
    urlList,
    setUrlList,
  } = context;
  const [showSelectedAccount, setShowselectedAccount] = useState(false);

  async function fetchContainerLogs(): Promise<AccountData[] | null> {
    if (!url) {
      console.log("NO URL")
      setDevnetIsAlive(false);
      return null;
    }
    try {
      const isAlive = await fetch(`http://${url}/is_alive`);
      setDevnetIsAlive(true);
      const urlExists = urlList.some((devnet) => devnet.url === url);
      if (!urlExists) {
        setUrlList([...urlList, { url, isAlive: true }]);
      }
    } catch (error) {
      console.log("ERROR ALIVE: ", error)
      setDevnetIsAlive(false);
      return null;
    }

    try {
      const configResponse = await fetch(`http://${url}/config`);
      const configData = await configResponse.json();
      const response = await fetch(`http://${url}/predeployed_accounts`);
      const data: AccountData[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching container logs:", error);
      return null;
    }
  }

  async function fetchDataAndPrintAccounts() {
    try {
      const data = await fetchContainerLogs();
      if (data == null) {
        return;
      }
      setAccounts(data);
    } catch (error) {
      console.error("Error fetching container logs:", error);
    }
  }

  useEffect(() => {
    fetchDataAndPrintAccounts();
    const context = UrlContext.getInstance();
    if (url) {
      context.setSelectedUrl(url);
    }
  }, [url, devnetIsAlive]);

  const handleAccountClick = (clickedAddress: string) => {
    const clickedAccount = accounts.find(
      (account) => account.address === clickedAddress
    );
    if (clickedAccount) {
      setSelectedAccount(clickedAccount);
      setShowselectedAccount(true);
      chrome.runtime.sendMessage({
        type: "SET_SELECTED_ACCOUNT",
        selectedAccount: clickedAccount,
      });
    } else {
      setShowselectedAccount(false)
    }
  };

  async function fetchCurrentBalance(address: string | undefined) {
    try {
      const response = await fetch(
        `http://${url}/account_balance?address=${address}&block_tag=pending`
      );
      const array = await response.json();
      setCurrentBalance(array.amount);
    } catch (error) {
      console.error("Error fetching container logs:", error);
    }
  }

  useEffect(() => {
    if (!selectedAccount) {
      return;
    }
    fetchCurrentBalance(selectedAccount?.address);
    const context = SingletonContext.getInstance();
    if (selectedAccount?.address) {
      context.setSelectedAccount(selectedAccount?.address);
    }
    setShowselectedAccount(true)
  }, [selectedAccount]);

  const handleBack = () => {
    setSelectedComponent(null);
    handleAccountClick("");
  };

  const handleBackToList = () => {    
    setShowselectedAccount(false);
};

  return (
    <>
      {devnetIsAlive && accounts.length > 0 && !showSelectedAccount && (
        <section>
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
                Accounts
              </Typography>
            </Container>
          </Stack>
          <Stack marginBottom={1}>
            {accounts.map((account, index) => (
              <Box key={index}>
                <Button
                  fullWidth
                  variant="text"
                  sx={{
                    textTransform: "none",
                    paddingY: 1,
                    paddingX: 0,
                    color: darkTheme.palette.text.secondary,
                  }}
                  onClick={() => handleAccountClick(account.address)}
                >
                  <Typography
                    width={"100%"}
                    paddingX={2}
                    overflow={"hidden"}
                    whiteSpace={"nowrap"}
                    textOverflow={"ellipsis"}
                  >
                    {account.address}
                  </Typography>
                </Button>
              </Box>
            ))}
          </Stack>
        </section>
      )}
      {!devnetIsAlive && (
        <RegisterRunningDocker />
      )}
      {showSelectedAccount && (
        <section>
            <div className="account-details">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, border: '1px solid white', padding: '5px',  borderRadius: '10px' }}>
                        <p onClick={handleBackToList}> Accounts</p>
                    </div>
                </div>
                <SelectedAccountInfo />
            </div>
        </section>
      )}
    </>
  );
};

export default PredeployedAccounts;
