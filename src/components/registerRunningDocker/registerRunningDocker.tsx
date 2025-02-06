import React, { useState, ChangeEvent, useCallback, useMemo } from 'react';
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
} from '@mui/material';
import {
  AddBoxOutlined,
  ChevronLeft,
  Delete,
  List as ListIcon,
  AddToQueueOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSharedState } from '../context/context';
import CheckDevnetStatus from '../checkDevnetStatus/checkDevnetStatus';
import { sendMessageToRemoveBlockInterval } from '../utils/sendMessageBackground';
import { DEFAULT_DEVNET_URL, LOCALHOST_DEVNET_URL } from '../../background/constants';
import { darkTheme } from '../..';
import { HomeTab } from '../home/home';

const RegisterRunningDocker: React.FC = () => {
  const context = useSharedState();
  const {
    urlList,
    updateUrlList,
    devnetIsAlive,
    setDevnetIsAlive,
    selectedUrl: url,
    updateSelectedUrl,
    updateSelectedAccount,
    setBlockInterval,
  } = context;
  const [newUrl, setNewUrl] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewUrl(e.target.value);
  };

  const handleAddUrl = () => {
    if (newUrl.trim() !== '') {
      const fullUrl = newUrl !== 'devnet.spaceshard.io' ? `http://${newUrl}` : DEFAULT_DEVNET_URL;
      const urlExists = urlList.some((devnet) => devnet.url === fullUrl);
      if (!urlExists) {
        urlList.push({ url: fullUrl, isAlive: true });
        updateUrlList(urlList);
        setNewUrl('');
      }
    }
  };

  const handleUrlClick = async (
    clickedUrl: string,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation(); // Stop event propagation here
    try {
      const isAlive = await fetch(`${clickedUrl}/is_alive`);
      if (!isAlive.ok) throw new Error('Devnet is not alive');

      setDevnetIsAlive(true);
      await updateSelectedUrl(clickedUrl);
    } catch (error) {
      console.debug('Error fetching URL status:', error);
      setDevnetIsAlive(false);
    }
  };

  const handleBack = () => {
    navigate('/app-settings');
  };

  const handleDeleteUrl = async (urlToDelete: string) => {
    const updatedUrlList = urlList.filter((item) => item.url !== urlToDelete);
    await updateUrlList(updatedUrlList);
    sendMessageToRemoveBlockInterval(urlToDelete, setBlockInterval);

    if (url === urlToDelete) {
      if (updatedUrlList.length > 0) {
        const firstAliveUrl = updatedUrlList.find((devnet) => devnet.isAlive);
        if (firstAliveUrl) {
          await updateSelectedUrl(firstAliveUrl.url);
          await updateSelectedAccount(null);

          return;
        }
      }
      await updateSelectedUrl('');
      setDevnetIsAlive(false);
      await updateSelectedAccount(null);
    }
  };

  const handleShowAccounts = useCallback(async () => {
    if (devnetIsAlive) {
      navigate('/', { state: { selectedTab: HomeTab.Accounts } });
    }
  }, [devnetIsAlive]);

  const hasLocalhost = useMemo(
    () => urlList.some((item) => item.url === LOCALHOST_DEVNET_URL),
    [urlList]
  );

  const addLocalhostUrl = useCallback(() => {
    urlList.push({ url: LOCALHOST_DEVNET_URL, isAlive: true });
    updateUrlList(urlList);
  }, [urlList]);

  return (
    <>
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
              Instances
            </Typography>
          </Container>
        </Stack>
        <Box paddingX={2} marginTop={1} marginBottom={3}>
          <Stack direction={'row'} spacing={1} justifyContent={'center'}>
            <Box>
              <TextField
                variant={'outlined'}
                value={newUrl}
                onChange={handleInputChange}
                label={'Url'}
                size={'small'}
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
        <Box paddingTop={2} paddingBottom={1}>
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
                          edge={'end'}
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
                        edge={'end'}
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
                  <ListItemIcon sx={{ minWidth: '24px' }}>
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
        {!hasLocalhost ? (
          <Container>
            <Button
              size="small"
              variant={'text'}
              startIcon={<AddToQueueOutlined />}
              onClick={addLocalhostUrl}
            >
              <Typography fontSize={'0.8125rem'} lineHeight={'1.5'}>
                Add local devnet
              </Typography>
            </Button>
          </Container>
        ) : null}
      </section>
    </>
  );
};
export default RegisterRunningDocker;
