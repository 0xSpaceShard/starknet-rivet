import { Account, RpcProvider, ec, stark, hash, CallData } from 'starknet-6';
import { AccountType, CustomAccount, addCustomAccount, getSelectedUrl } from './syncStorage';
import { DeclareContractMessage } from './interface';

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
  const provider = await getProvider();
  const privateKey = stark.randomAddress();
  const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);

  const OZAccountClassHash = '0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f';
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

  const AXAccountClassHash = '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003';
  const AXConstructorCallData = CallData.compile({
    owner: starkKeyPub,
    guardian: '0',
  });
  const AXcontractAddress = hash.calculateContractAddressFromHash(
    starkKeyPub,
    AXAccountClassHash,
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
    classHash: AXAccountClassHash,
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
