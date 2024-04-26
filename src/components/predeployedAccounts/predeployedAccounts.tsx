import React, { useEffect, useContext } from 'react';
import { AccountData, Context } from '../context/context';
import './predeployedAccounts.css';
import SingletonContext from '../../services/contextService';
import UrlContext from '../../services/urlService';

export const PredeployedAccounts: React.FC = () => {
    const context = useContext(Context);
    if (!context) {
        throw new Error('Context value is undefined');
    }

    const { accounts, setAccounts, url, devnetIsAlive, setDevnetIsAlive, selectedAccount, setSelectedAccount, currentBalance, setCurrentBalance, commandOptions } = context;

    async function fetchContainerLogs(): Promise<AccountData[] | null> {
        if (!url) {
        return null;
        }

        try {
            const isAlive = await fetch(`http://${url}/is_alive`);
            setDevnetIsAlive(true);
        } catch (error) {
            setDevnetIsAlive(false);
            return null;
        }

        try {
            const configResponse = await fetch(`http://${url}/config`);
            const configData = await configResponse.json();
            console.log('Config data:', configData);
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
        }
        else {
            setSelectedAccount(null);
        }
    };

    async function fetchCurrentBalance(address: string | undefined) {
        try {
            const response = await fetch(`http://${url}/account_balance?address=${address}`);
            const array = await response.json();
            setCurrentBalance(array.amount);
        } catch (error) {
            console.error('Error fetching container logs:', error); 
        }
    }

    useEffect(() => {
        fetchCurrentBalance(selectedAccount?.address);
        const context = SingletonContext.getInstance();
        if (selectedAccount?.address) {
            context.setSelectedAccount(selectedAccount?.address);
        }
        
    }, [selectedAccount]);


    return (
        <>
            {devnetIsAlive && accounts.length > 0 && (
                <section>
                    <h1 className="section-heading">Accounts</h1>
                    {accounts.map((account, index) => (
                        <div 
                            key={index}
                            className="account-section" 
                            onClick={() => handleAccountClick(account.address)}
                        >
                            <span 
                                style={{ fontWeight: selectedAccount?.address === account.address ? 'bold' : 'normal' }}
                            >
                                {account.address}
                            </span>
                            {selectedAccount?.address === account.address && (
                                <div className="account-details">
                                    <p><span className="text-dark">Current Balance:</span> {currentBalance.toString()}</p>
                                    <p><span className="text-dark">Private Key:</span> {selectedAccount.private_key}</p>
                                    <p><span className="text-dark">Public Key:</span> {selectedAccount.public_key}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </section>
            )}
        </>
    );
}

export default PredeployedAccounts;