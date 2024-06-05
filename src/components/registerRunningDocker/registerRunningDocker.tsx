import React, { useState, ChangeEvent } from 'react';
import './registerRunningDocker.css'
import { useSharedState } from '../context/context';
import PredeployedAccounts from '../predeployedAccounts/predeployedAccounts';
import { useNavigate } from 'react-router-dom';
import CheckDevnetStatus from '../checkDevnetStatus/checkDevnetStatus';
import { Button } from '@mui/material';
import { Delete, Navigation } from '@mui/icons-material';

const RegisterRunningDocker: React.FC = () => {
    const context = useSharedState();
    const { setUrlList, urlList, devnetIsAlive,setDevnetIsAlive, setSelectedComponent, url, setUrl} = context;
    const [newUrl, setNewUrl] = useState('');
    const [toPredeployedAccounts, setToPredeployedAccounts] = useState(false)

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setNewUrl(e.target.value);
    };

    const handleAddUrl = () => {
        if (newUrl.trim() !== '') {
            const urlExists = urlList.some((devnet) => devnet.url === newUrl);
            if (!urlExists) {
                setUrlList([...urlList, { url: newUrl, isAlive: true }]);
                setNewUrl('');
            }
        }
    };
    
    const handleUrlClick = async (clickedUrl: string, event: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
        event.stopPropagation(); // Stop event propagation here
        try {
            await fetch(`http://${clickedUrl}/is_alive`);
            setDevnetIsAlive(true);
            setUrl(clickedUrl);
        } catch (error) {
            console.error("Error fetching URL status:", error);
            setDevnetIsAlive(false);
        }
    };

    const handleBack = () => {
        setSelectedComponent('')
    };

    const handleDeleteUrl = (urlToDelete: string) => {
        setUrlList(urlList.filter(item => item.url !== urlToDelete));
        if (url === urlToDelete) {
          setUrl('');
        }
    };
    
    const handleShowAccounts = async () => {
        try {
            if (devnetIsAlive) {
                setToPredeployedAccounts(true);
            } else {
                setToPredeployedAccounts(false);
            }
        } catch (error) {
            setToPredeployedAccounts(false);
        }
    };
    
    return (
        <>
            {!toPredeployedAccounts ? (
                <div>
                    <div className="form-group" style={{ display: 'flex', justifyContent: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <input
                                type="text"
                                name="host"
                                value={newUrl}
                                onChange={handleInputChange}
                            />
                            <Button variant="contained" color="primary" onClick={handleAddUrl}>Add URL</Button>
                        </div>
                    </div>
                    <div>
                        <ul style={{ padding: 0, listStyleType: 'none' }}>
                            {urlList.map((list, index) => (
                                <li key={index} className={list.url === url ? 'selected-account-section' : ''} style={{ marginBottom: '10px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }} onClick={(event) => handleUrlClick(list.url, event)}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <CheckDevnetStatus url={list.url} />
                                        <span style={{ marginLeft: '10px', marginRight: 'auto', flex: 1 }}>{list.url}</span>
                                        <Button variant="outlined" color="secondary" startIcon={<Delete />}
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleDeleteUrl(list.url);
                                            }}
                                            style={{ marginRight: '10px' }}
                                        >
                                            Delete
                                        </Button>
                                        {list.url === url && (
                                            <Button variant="outlined" color="primary" startIcon={<Navigation />}
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleShowAccounts();
                                                }}
                                            >
                                                Accounts
                                            </Button>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, border: '1px solid white', padding: '5px', borderRadius: '10px' }}>
                            <p onClick={handleBack} style={{ cursor: 'pointer', margin: 0 }}>Back</p>
                        </div>
                    </div>
                </div>
            ) : (
                <PredeployedAccounts />
            )}
        </>
    );
}
export default RegisterRunningDocker;
