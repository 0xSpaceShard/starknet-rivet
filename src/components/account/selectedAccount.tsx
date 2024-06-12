import React, { useEffect, useState } from 'react';
import { useSharedState } from '../context/context';
import './selectedAccount.css';
import { Account, hash } from 'starknet';
import { Box, Button, Container } from '@mui/material';

export const SelectedAccountInfo: React.FC = () => {
    const context = useSharedState();
    const { url, devnetIsAlive, setDevnetIsAlive, setSelectedAccount, selectedAccount, currentBalance, setConfigData, configData, transactionData, setTransactionData, signatureData, setSignatureData} = context;
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
            console.error('Error fetching config logs:', error);
            return null;
        }
    }

    const handleCopyAddress = () => {
        if (selectedAccount) {
            navigator.clipboard.writeText(selectedAccount.address);
        }
    };

    const handleConfirm = (message: any) => {
        if (selectedAccount) {
            if (transactionData) {
                chrome.runtime.sendMessage({ type: "EXECUTE_RIVET_TRANSACTION_RES", data: message });
                setTransactionData(null);
            }
            else if (signatureData){
                chrome.runtime.sendMessage({ type: "SIGN_RIVET_MESSAGE_RES", data: message });
                setSignatureData(null);
            }
            chrome.windows.getCurrent((window) => {
                if (window && window.id) {
                    chrome.windows.remove(window.id);
                }
            });
        }
    };

    const handleDecline = (message: any) => {
        if (selectedAccount) {
            chrome.runtime.sendMessage({ type: "RIVET_TRANSACTION_FAILED", data: message });
            setTransactionData(null);
            chrome.windows.getCurrent((window) => {
                if (window && window.id) {
                    chrome.windows.remove(window.id);
                }
            });
        }
    };

    useEffect(() => {
        fetchAccountConfig();
    }, []);


    const balanceBigInt = BigInt(currentBalance) / BigInt(10n ** 18n);
    const balanceString = balanceBigInt.toString();
    const shortAddress = selectedAccount ? `${selectedAccount.address.slice(0, 6)}...${selectedAccount.address.slice(-4)}` : '';

    return (
        <>
            {devnetIsAlive && selectedAccount && configData && (
                <>
                <section>
                    {selectedAccount.address && (
                        <div className="account-details">
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ position: 'absolute', top: 0, right: 0, border: '1px solid white', padding: '5px',  borderRadius: '10px' }}>
                                    <p>Chain ID: {configData.chain_id}</p>
                                </div>
                                <p style={{ fontSize: '24px', margin: '20px 0', display: 'flex', alignItems: 'center' }}>
                                    <img src="./src/assets/eth.png" style={{ width: '30px', height: 'auto', marginRight: '10px' }} />
                                    {balanceString} ETH
                                </p>

                                <p style={{ margin: '10px 0', cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={handleCopyAddress}>{shortAddress}</p>
                            </div>
                        </div>
                    )}
                </section>
                </>
            )}
            {transactionData && (
               <Container>
                        <p>Transaction Details:</p>
                        <Box component="pre" style={{ textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-word', padding: '10px', borderRadius: '5px' }}>
                            {JSON.stringify(transactionData, null, 2)}
                        </Box>
                        <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => handleConfirm(transactionData)}
                        >
                        Confirm
                        </Button>
                        <Button
                        variant="outlined"
                        color="primary"
                        onClick={() =>  handleDecline(transactionData)}
                        >
                        Decline
                        </Button>
                </Container>
            )}
            {signatureData && (
                <Container>
                    <p>Signature Details:</p>
                    <Box component="pre" style={{ textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-word', padding: '10px', borderRadius: '5px' }}>
                        {JSON.stringify(signatureData, null, 2)}
                    </Box>
                    <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleConfirm(signatureData)}
                    >
                    Confirm
                    </Button>
                </Container>
            )}
        </>
    );
}

export default SelectedAccountInfo;