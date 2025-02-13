import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import CheckDevnetStatus from '../checkDevnetStatus/checkDevnetStatus';
import { darkTheme } from '../..';
import { UrlItem } from '../context/interfaces';
import { useSharedState } from '../context/context';
import { logError } from '../../background/analytics';

export const SwitchStarknetChainMessage: React.FC = () => {
  const context = useSharedState();
  const { urlList, setDevnetIsAlive, selectedUrl: url, updateSelectedUrl } = context;
  const [newUrlList, setNewUrlList] = useState<UrlItem[]>([]);
  const [newChainId, setNewChainId] = useState('');

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
      chrome.runtime.sendMessage({
        type: 'SWITCH_STARKNET_CHAIN_RES',
        data: true,
      });
      setNewUrlList([]);

      chrome.windows.getCurrent((window) => {
        if (window && window.id) {
          chrome.windows.remove(window.id);
        }
      });
    } catch (error) {
      logError('Error fetching URL status:', error);
      chrome.runtime.sendMessage({
        type: 'SWITCH_STARKNET_CHAIN_RES',
        data: false,
      });
      chrome.windows.getCurrent((window) => {
        if (window && window.id) {
          chrome.windows.remove(window.id);
        }
      });
      setDevnetIsAlive(false);
    }
  };

  const filterUrlsByChainID = async (chainId: string) => {
    const filteredUrlList: UrlItem[] = [];

    urlList.forEach(async (item) => {
      try {
        const response = await fetch(`${item.url}/config`);
        if (response.ok) {
          const info = await response.json();

          if (info.chain_id === chainId) {
            filteredUrlList.push(item);
          }
        }
      } catch (error) {
        logError(`Failed to fetch info for ${item.url}:`, error);
      }
    });
    setNewUrlList(filteredUrlList);
  };

  const handleDecline = useCallback(() => {
    chrome.runtime.sendMessage({
      type: 'SWITCH_STARKNET_CHAIN_RES',
      data: false,
    });
    chrome.windows.getCurrent((window) => {
      if (window && window.id) {
        chrome.windows.remove(window.id);
      }
    });
    setNewUrlList([]);
  }, []);

  chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.type === 'SWITCH_STARKNET_CHAIN') {
      const chainIdMap: { [key: string]: string } = {
        '0x534e5f4d41494e': 'SN_MAIN',
        '0x534e5f5345504f4c4941': 'SN_SEPOLIA',
      };

      const convertChainId = chainIdMap[message.data] || message.data;

      setNewChainId(convertChainId);
      filterUrlsByChainID(convertChainId);
    }
  });

  return (
    <>
      <section>
        <Box paddingY={2}>
          <Typography variant="body1">Switch to {newChainId}</Typography>
          <List sx={{ paddingY: 0 }}>
            {newUrlList.length > 0 ? (
              newUrlList.map((list, index) => (
                <ListItem key={index} disablePadding>
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
              ))
            ) : (
              <Typography color={darkTheme.palette.text.primary}>
                No devnet running on {newChainId}
              </Typography>
            )}
          </List>
          <Stack justifyContent={'center'} direction={'row'} spacing={3}>
            <Button variant="outlined" color="secondary" onClick={() => handleDecline()}>
              Decline
            </Button>
          </Stack>
        </Box>
      </section>
    </>
  );
};
