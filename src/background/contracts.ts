import { Calldata, CallData, Contract, DeclareContractPayload } from 'starknet-6';
import {
  getProvider,
  getSelectedAccount,
  isDeclareContractMessage,
  parseErrorMessage,
} from './utils';
import { DeclareContractMessage, DeployContractMessage } from './interface';

// Function to declare a Contract from Rivet extension
export async function declareContract(
  message: DeclareContractMessage | DeclareContractPayload,
  sendResponse: (response?: {
    transaction_hash?: string;
    class_hash?: string;
    error?: string;
  }) => void
) {
  try {
    const provider = await getProvider();
    const acc = await getSelectedAccount();

    let declareResponse;
    if (isDeclareContractMessage(message)) {
      declareResponse = await acc.declareIfNot({
        contract: message.data.sierra,
        casm: message.data.casm,
      });
    } else {
      declareResponse = await acc.declareIfNot(message);
    }
    if (declareResponse.transaction_hash !== '') {
      await provider.waitForTransaction(declareResponse.transaction_hash);
    }
    sendResponse({
      transaction_hash: declareResponse.transaction_hash,
      class_hash: declareResponse.class_hash,
    });
  } catch (error) {
    sendResponse({ error: parseErrorMessage(error) });
  }
}

// Function to deploy a Contract from Rivet extension
export async function deployContract(
  message: DeployContractMessage,
  sendResponse: (response?: { contract_address?: string; error?: string }) => void
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
