import React, { useState, ChangeEvent, useCallback } from "react";
import { useSharedState } from "../context/context";
import PredeployedAccounts from "../predeployedAccounts/predeployedAccounts";
import CheckDevnetStatus from "../checkDevnetStatus/checkDevnetStatus";
import UrlContext from "../../services/urlService";
import { darkTheme } from "../..";
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddBoxOutlined,
  ChevronLeft,
  Delete,
  List as ListIcon,
} from "@mui/icons-material";

const RegisterRunningDocker: React.FC = () => {
  const context = useSharedState();
  const {
    setUrlList,
    urlList,
    devnetIsAlive,
    setDevnetIsAlive,
    setSelectedComponent,
    url,
    setUrl,
    setSelectedAccount,
  } = context;
  const [newUrl, setNewUrl] = useState("");
  const [showPredeployedAccs, setShowPredeployedAccs] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewUrl(e.target.value);
  };

  const handleAddUrl = () => {
    if (newUrl.trim() !== "") {
      const urlExists = urlList.some((devnet) => devnet.url === newUrl);
      if (!urlExists) {
        setUrlList([...urlList, { url: newUrl, isAlive: true }]);
        setNewUrl("");
      }
    }
  };

  const handleUrlClick = async (
    clickedUrl: string,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation(); // Stop event propagation here
    console.log("hello!");
    try {
      await fetch(`http://${clickedUrl}/is_alive`);
      setDevnetIsAlive(true);
      setUrl(clickedUrl);
      const context = UrlContext.getInstance();
      context.setSelectedUrl(url);
      chrome.runtime.sendMessage({
          type: "SET_URL",
          url: clickedUrl,
        });
    } catch (error) {
      console.error("Error fetching URL status:", error);
      setDevnetIsAlive(false);
    }
  };

  const handleBack = () => {
    setSelectedComponent(null);
  };

  const handleDeleteUrl = (urlToDelete: string) => {
    console.log("URL to DELETE: ", urlToDelete)
    setUrlList(urlList.filter((item) => item.url !== urlToDelete));
    // if (url === urlToDelete) {
    //   setUrl("");
    // }
  };

  const handleShowAccounts = useCallback(async () => {
    setShowPredeployedAccs(devnetIsAlive);
  }, [devnetIsAlive]);

  return (
    <>
      {!showPredeployedAccs ? (
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
                Instances
              </Typography>
            </Container>
          </Stack>
          <Box paddingX={2} marginTop={1} marginBottom={3}>
            <Stack direction={"row"} spacing={1} justifyContent={"center"}>
              <Box>
                <TextField
                  variant={"outlined"}
                  value={newUrl}
                  onChange={handleInputChange}
                  label={"Url"}
                  size={"small"}
                ></TextField>
              </Box>
              <Box>
                <Tooltip title="Add url">
                  <IconButton onClick={handleAddUrl} color="primary">
                    <AddBoxOutlined />
                  </IconButton>
                </Tooltip>
              </Box>
            </Stack>
          </Box>
          <Divider variant="middle" />
          <Box paddingY={2}>
            <List sx={{ paddingY: 0 }}>
              {urlList.map((list, index) => (
                <ListItem
                  key={index}
                  disablePadding
                  secondaryAction={
                    <Stack direction="row" spacing={1}>
                      {list.url === url && (
                        <Tooltip title="View accounts">
                          <IconButton
                            color="primary"
                            edge={"end"}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleShowAccounts();
                            }}
                          >
                            <ListIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete url">
                        <IconButton
                          color="secondary"
                          edge={"end"}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteUrl(list.url);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  }
                >
                  <ListItemButton onClick={(e) => handleUrlClick(list.url, e)}>
                    <ListItemIcon sx={{ minWidth: "24px" }}>
                      <CheckDevnetStatus url={list.url} />
                    </ListItemIcon>
                    <ListItemText>
                      <Typography
                        color={
                          list.url === url
                            ? darkTheme.palette.text.primary
                            : darkTheme.palette.text.secondary
                        }
                      >
                        {list.url}
                      </Typography>
                    </ListItemText>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </section>
      ) : (
        <PredeployedAccounts />
      )}
    </>
  );
};
export default RegisterRunningDocker;
