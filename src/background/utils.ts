import { Account, RpcProvider, ec, stark, hash, CallData } from 'starknet-6';
import {
  AccountType,
  CustomAccount,
  addCustomAccount,
  getSelectedUrl,
  getUrlConfig,
  getUrlContextData,
  saveUrlConfig,
  saveUrlContextData,
} from './syncStorage';
import { DeclareContractMessage } from './interface';
import { UrlConfig } from '../components/context/interfaces';
import { ARGENTX_ACCOUNT_CLASS_HASH, ETH_ACCOUNT_CLASS_HASH } from './constants';

// Utils functions Parse error message
export function parseErrorMessage(error: any): string {
  try {
    const errorObject = JSON.parse(error.message);
    if (errorObject.revert_error) {
      return errorObject.revert_error;
    }
    return error.message;
  } catch (e) {
    return error.message;
  }
}
// Utils functions to get selected account from Chrome sync storage
export async function getSelectedAccount(): Promise<Account> {
  const result = await chrome.storage.sync.get(['selectedAccount']);
  const { selectedAccount } = result;
  const provider = await getProvider();

  return new Account(provider, selectedAccount.address, selectedAccount.private_key);
}

// Utils functions to get provider from Chrome sync storage
export async function getProvider(): Promise<RpcProvider> {
  const url = await getSelectedUrl();
  return new RpcProvider({ nodeUrl: `${url}/rpc` });
}

// Utils functions to check the type of the message.
export function isDeclareContractMessage(message: any): message is DeclareContractMessage {
  return (message as DeclareContractMessage).data.sierra !== undefined;
}

export async function checkIfClassExists(classHash: string): Promise<boolean> {
  const provider = await getProvider();
  try {
    const classDetails = await provider.getClass(classHash);
    return !!classDetails;
  } catch (e) {
    return false;
  }
}

export async function initUrlConfig(url: string) {
  const response = await fetch(`${url}/config`);
  const data = await response?.json();
  const {
    account_contract_class_hash,
    fork_config,
    seed,
  }: {
    account_contract_class_hash: string;
    fork_config: { url: string | null; block_number: number | null };
    seed: number;
  } = data;

  const argentClassExists = await checkIfClassExists(ARGENTX_ACCOUNT_CLASS_HASH);
  const ethClassExists = await checkIfClassExists(ETH_ACCOUNT_CLASS_HASH);

  const config: UrlConfig = {
    openZeppelinAccountClassHash: account_contract_class_hash,
    isForked: !!fork_config?.url,
    argentClassExists,
    ethClassExists,
  };
  const savedSeed = await getUrlContextData<number>('seed', 0);

  if (savedSeed && savedSeed !== seed) {
    await saveUrlContextData('accountContracts', {});
    await saveUrlContextData('customAccounts', []);
  }
  await saveUrlContextData('seed', seed);
  await saveUrlConfig(config);
}

export function printAccountType(type: AccountType) {
  switch (type) {
    case AccountType.OpenZeppelin:
      return 'Open Zeppelin';
    case AccountType.Argent:
      return 'Argent';
    case AccountType.Braavos:
      return 'Braavos';
    case AccountType.Ethereum:
      return 'Ethereum';
    case AccountType.Predeployed:
    default:
      return 'Predeployed';
  }
}

export async function createOpenZeppelinAccount() {
  const url = await getSelectedUrl();
  const urlConfig = await getUrlConfig();
  const provider = await getProvider();
  const privateKey = stark.randomAddress();
  const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);

  if (!urlConfig?.openZeppelinAccountClassHash) {
    throw new Error('No open zeppellin account class hash found on current devnet');
  }

  const OZAccountClassHash = urlConfig.openZeppelinAccountClassHash;
  const OZAccountConstructorCallData = CallData.compile({ publicKey: starkKeyPub });
  const OZContractAddress = hash.calculateContractAddressFromHash(
    starkKeyPub,
    OZAccountClassHash,
    OZAccountConstructorCallData,
    0
  );

  console.info('Precalculated account address: ', OZContractAddress);
  console.info('Funding...');

  const data = {
    address: OZContractAddress,
    amount: 1000000000000000000000,
  };

  await fetch(`${url}/mint`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  console.info(`Address ${OZContractAddress} funded`);

  const OZaccount = new Account(provider, OZContractAddress, privateKey);

  const { transaction_hash, contract_address } = await OZaccount.deployAccount({
    classHash: OZAccountClassHash,
    constructorCalldata: OZAccountConstructorCallData,
    addressSalt: starkKeyPub,
  });

  await provider.waitForTransaction(transaction_hash);
  console.info('✅ New OpenZeppelin account created. Address: ', contract_address);
  console.info('public key', starkKeyPub);
  console.info('private key: ', privateKey);

  const createdAccount: CustomAccount = {
    address: contract_address,
    private_key: privateKey,
    public_key: starkKeyPub,
    initial_balance: data.amount.toString(),
    type: AccountType.OpenZeppelin,
  };

  addCustomAccount(createdAccount);
  return createdAccount;
}

export async function createArgentAccount() {
  const url = await getSelectedUrl();
  const provider = await getProvider();
  const privateKey = stark.randomAddress();
  const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);

  const AXConstructorCallData = CallData.compile({
    owner: starkKeyPub,
    guardian: '0',
  });
  const AXcontractAddress = hash.calculateContractAddressFromHash(
    starkKeyPub,
    ARGENTX_ACCOUNT_CLASS_HASH,
    AXConstructorCallData,
    0
  );
  console.info('Precalculated account address:', AXcontractAddress);
  console.info('Funding...');

  const data = {
    address: AXcontractAddress,
    amount: 1000000000000000000000,
  };

  await fetch(`${url}/mint`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  console.info(`Address ${AXcontractAddress} funded`);

  const AXaccount = new Account(provider, AXcontractAddress, privateKey);
  const { transaction_hash, contract_address } = await AXaccount.deployAccount({
    classHash: ARGENTX_ACCOUNT_CLASS_HASH,
    constructorCalldata: AXConstructorCallData,
    contractAddress: AXcontractAddress,
    addressSalt: starkKeyPub,
  });

  await provider.waitForTransaction(transaction_hash);
  console.info('✅ New Argent account created. Address: ', contract_address);
  console.info('public key', starkKeyPub);
  console.info('private key: ', privateKey);

  const createdAccount: CustomAccount = {
    address: contract_address,
    private_key: privateKey,
    public_key: starkKeyPub,
    initial_balance: data.amount.toString(),
    type: AccountType.Argent,
  };

  addCustomAccount(createdAccount);
  return createdAccount;
}
