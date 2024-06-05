import React, { useEffect, useState } from 'react';
import { AccountData, useSharedState } from '../context/context';
import './predeployedAccounts.css';
import SingletonContext from '../../services/contextService';
import UrlContext from '../../services/urlService';
import SelectedAccountInfo from '../account/selectedAccount';

export const PredeployedAccounts: React.FC = () => {
    const context = useSharedState();
    const { accounts, setAccounts, url, devnetIsAlive, setDevnetIsAlive, selectedAccount, setSelectedAccount, setSelectedComponent, setCurrentBalance, urlList, setUrlList } = context;

    async function fetchContainerLogs(): Promise<AccountData[] | null> {
        if (!url) {
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
            console.error('Error fetching container logs:', error);
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
        console.error('Error fetching container logs:', error);
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
        const clickedAccount = accounts.find(account => account.address === clickedAddress);
        if (clickedAccount) {
            setSelectedAccount(clickedAccount);
            chrome.runtime.sendMessage({ type: 'SET_SELECTED_ACCOUNT', selectedAccount: clickedAccount });
        }
        else {
            setSelectedAccount(null);
            chrome.runtime.sendMessage({ type: 'SET_SELECTED_ACCOUNT', selectedAccount: null });
        }
    };

    async function fetchCurrentBalance(address: string | undefined) {
        try {
            const response = await fetch(`http://${url}/account_balance?address=${address}&block_tag=pending`);
            const array = await response.json();
            setCurrentBalance(array.amount);
        } catch (error) {
            console.error('Error fetching container logs:', error); 
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
        
    }, [selectedAccount]);

    const handleBack = () => {    

        setSelectedComponent('');
        handleAccountClick('');
    };

    return (
        <>
            {devnetIsAlive && accounts.length > 0 && !selectedAccount && (
                <section>
                    <h1 className="section-heading">Accounts</h1>
                    {accounts.map((account, index) => (
                        <div 
                            key={index}
                            className="account-section" 
                            onClick={() => handleAccountClick(account.address)}
                        >
                            <span>
                                {account.address}
                            </span>
                        </div>
                    ))}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, border: '1px solid white', padding: '5px',  borderRadius: '10px' }}>
                            <p onClick={handleBack}> Back</p>
                        </div>
                    </div>
                </section>
            )}
            {selectedAccount && (
                <section>
                    <div className="account-details">
                        <SelectedAccountInfo />
                    </div>
                </section>
            )}
        </>
    );
}

export default PredeployedAccounts;