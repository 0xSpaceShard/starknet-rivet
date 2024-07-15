import { Calldata, CallData, Contract } from 'starknet-6';
import { getProvider, getSelectedAccount, parseErrorMessage } from './utils';
import { getAccountContractsFromSyncStorage, updateAccountContractsInSyncStorage } from './storage';
import { DeclareContractMessage, DeployContractMessage } from './interface';

// Function to declare a Contract from Rivet extension
export async function declareContract(
  message: DeclareContractMessage,
  sendResponse: (response?: any) => void
) {
  try {
    const provider = await getProvider();
    const acc = await getSelectedAccount();

    const declareResponse = await acc.declareIfNot({
      contract: message.data.sierra,
      casm: message.data.casm,
    });
    if (declareResponse.transaction_hash != '') {
      await provider.waitForTransaction(declareResponse.transaction_hash);
    }
    sendResponse({ class_hash: declareResponse.class_hash });
  } catch (error) {
    sendResponse({ error: parseErrorMessage(error) });
  }
}

// Function to deploy a Contract from Rivet extension
export async function deployContract(
  message: DeployContractMessage,
  sendResponse: (response?: any) => void
) {
  try {
    const provider = await getProvider();
    const acc = await getSelectedAccount();

    const { abi: testAbi } = await provider.getClassByHash(message.data.class_hash);
    const contractCallData: CallData = new CallData(testAbi);

    const ConstructorCallData: Calldata = contractCallData.compile(
      'constructor',
      message.data.call_data
    );

    const deployResponse = await acc.deployContract({
      classHash: message.data.class_hash,
      constructorCalldata: ConstructorCallData,
    });
    await provider.waitForTransaction(deployResponse.transaction_hash);

    sendResponse({ contract_address: deployResponse.contract_address });
  } catch (error) {
    sendResponse({ error: parseErrorMessage(error) });
  }
}

export async function updateAccountContracts(message: any, sendResponse: (response?: any) => void) {
  try {
    await updateAccountContractsInSyncStorage(message.accountContracts);
    const accountContracts = await getAccountContractsFromSyncStorage();
    sendResponse({ success: true, accountContracts });
  } catch (error) {
    sendResponse({ success: false });
    return false;
  }
  return true;
}

export async function getTokenBalance(contractAddr: string) {
  try {
    const provider = await getProvider();
    const acc = await getSelectedAccount();

    const contract = await provider.getClassAt(contractAddr);
    const erc20 = new Contract(contract.abi, contractAddr, provider);

    erc20.connect(acc);

    const balance = await erc20.balanceOf(acc.address);
    const symbol = await erc20.symbol();

    return {
      balance,
      symbol,
    };
  } catch (error) {
    console.error('ERR: ', error);
    return null;
  }
}
