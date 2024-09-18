import { Account, RpcProvider, ec, stark, hash, CallData } from 'starknet-6';
import { getSelectedUrl } from './syncStorage';
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

export async function createAccount() {
  const url = await getSelectedUrl();
  const provider = await getProvider();
  const privateKey = stark.randomAddress();
  const starkKeyPub = ec.starkCurve.getStarkKey(privateKey);

  const OZaccountClassHash = '0x061dac032f228abef9c6626f995015233097ae253a7f72d68552db02f2971b8f';
  const OZaccountConstructorCallData = CallData.compile({ publicKey: starkKeyPub });
  const OZcontractAddress = hash.calculateContractAddressFromHash(
    starkKeyPub,
    OZaccountClassHash,
    OZaccountConstructorCallData,
    0
  );

  console.log('Precalculated account address: ', OZcontractAddress);
  console.log('Funding...');

  const data = {
    address: OZcontractAddress,
    amount: 50000000000000000000,
  };

  await fetch(`${url}/mint`, {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  console.log(`Address ${OZcontractAddress} funded`);

  const OZaccount = new Account(provider, OZcontractAddress, privateKey);

  const { transaction_hash, contract_address } = await OZaccount.deployAccount({
    classHash: OZaccountClassHash,
    constructorCalldata: OZaccountConstructorCallData,
    addressSalt: starkKeyPub,
  });

  await provider.waitForTransaction(transaction_hash);
  console.log('✅ New OpenZeppelin account created. Address =', contract_address);
}
