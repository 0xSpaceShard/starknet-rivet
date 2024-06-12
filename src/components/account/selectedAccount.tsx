import React, { useEffect, useState } from 'react';
import { useSharedState } from '../context/context';
import './selectedAccount.css';
import { Account, hash } from 'starknet';

export const SelectedAccountInfo: React.FC = () => {
    const context = useSharedState();
    const { url, devnetIsAlive, setDevnetIsAlive, setSelectedAccount, selectedAccount, currentBalance, setConfigData, configData } = context;
    const [transactionData, setTransactionData] = useState<any>(null);

    async function fetchAccountConfig(): Promise<any | null> {
        if (!url) {
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
            chrome.runtime.sendMessage({ type: "EXECUTE_RIVET_TRANSACTION_RES", data: message });
            setTransactionData(null);
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
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("HERE HERE HERE: ", message.type)
        if (message.type === "EXECUTE_RIVET_TRANSACTION") {
          setTransactionData(message.data);
        }
      });

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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh' }}>
                    <div style={{ marginTop: 'auto', border: '1px solid white', padding: '5px', borderRadius: '10px' }}>
                        <p>Transaction Details:</p>
                        <pre style={{ textAlign: 'left', whiteSpace: 'pre-wrap' }}>{JSON.stringify(transactionData, null, 2)}</pre>
                        <p  onClick={() => handleConfirm(transactionData)} style={{ cursor: 'pointer', color: 'blue' }}>Confirm</p>
                        <p  onClick={() => handleDecline(transactionData)} style={{ cursor: 'pointer', color: 'blue' }}>Decline</p>
                    </div>
                </div>
            )}
        </>
    );
}

export default SelectedAccountInfo;