import { Calldata, CallData } from 'starknet-6';
import { getProvider, getSelectedAccount, parseErrorMessage } from './utils';

// Function to declare a Contract from Rivet extension
export async function declareContract(message: any, sendResponse: (response?: any) => void) {
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
export async function deployContract(message: any, sendResponse: (response?: any) => void) {
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
