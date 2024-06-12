import "./Popup.css";
import PredeployedAccounts from "../components/predeployedAccounts/predeployedAccounts";
import DockerCommandGenerator from "../components/dockerCommand/dockerCommand";
import RegisterRunningDocker from "../components/registerRunningDocker/registerRunningDocker";
import { Component, useSharedState } from "../components/context/context";
import { Box, Button, Stack, Typography } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";

export const Popup = () => {
  const context = useSharedState();
  const { selectedComponent, setSelectedComponent, url } = context;

  const switchComponent = (newSelectedComponent: Component) => {
    if (newSelectedComponent == Component.Accounts && !url) {
      setSelectedComponent(null);
      return;
    }
    setSelectedComponent(newSelectedComponent);
  };

  const ComponentMenu = () => (
    <Stack spacing={0}>
      <Box>
        <Button
          variant="text"
          fullWidth
          sx={{
            height: 48,
            justifyContent: "flex-end",
            alignItems: "center",
          }}
          onClick={() => switchComponent(Component.CommandGenerator)}
        >
          Docker Command Generator
          <Box
            display={"flex"}
            alignItems={"center"}
            paddingRight={2}
            paddingLeft={4}
          >
            <ChevronRight />
          </Box>
        </Button>
      </Box>
      <Box>
        <Button
          variant="text"
          fullWidth
          sx={{
            height: 48,
            justifyContent: "flex-end",
            alignItems: "center",
          }}
          onClick={() => switchComponent(Component.DockerRegister)}
        >
          Register Running Docker
          <Box
            display={"flex"}
            alignItems={"center"}
            paddingRight={2}
            paddingLeft={4}
          >
            <ChevronRight />
          </Box>
        </Button>
      </Box>
      {url ? (
        <Box>
          <Button
            variant="text"
            fullWidth
            sx={{
              height: 48,
              justifyContent: "flex-end",
              alignItems: "center",
            }}
            onClick={() => switchComponent(Component.Accounts)}
          >
            Show Predeployed Accounts
            <Box
              display={"flex"}
              alignItems={"center"}
              paddingRight={2}
              paddingLeft={4}
            >
              <ChevronRight />
            </Box>
          </Button>
        </Box>
      ) : (
        <Box
          height={48}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Typography variant="caption">No predeployed accounts</Typography>
        </Box>
      )}
    </Stack>
  );

  return (
    <main>
      {!selectedComponent && <ComponentMenu />}
      {selectedComponent === Component.CommandGenerator && (
        <DockerCommandGenerator />
      )}
      {selectedComponent === Component.DockerRegister && (
        <RegisterRunningDocker />
      )}
      {selectedComponent === Component.Accounts && url && (
        <PredeployedAccounts />
      )}
    </main>
  );
};
export default Popup;
