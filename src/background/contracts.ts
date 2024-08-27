import { Calldata, CallData, Contract, uint256 } from 'starknet-6';
import { getProvider, getSelectedAccount, parseErrorMessage } from './utils';
import { DeclareContractMessage, DeployContractMessage } from './interface';
import { ETH_ADDRESS, MAX_AMOUNT_TO_MINT } from './constants';
import { getSelectedUrl } from './syncStorage';

// Function to declare a Contract from Rivet extension
export async function declareContract(
  message: DeclareContractMessage,
  sendResponse: (response?: { class_hash?: string; error?: string }) => void
) {
  try {
    const provider = await getProvider();
    const acc = await getSelectedAccount();

    const declareResponse = await acc.declareIfNot({
      contract: message.data.sierra,
      casm: message.data.casm,
    });
    if (declareResponse.transaction_hash !== '') {
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

export async function modifyEthBalance(amount: bigint) {
  try {
    const provider = await getProvider();
    const acc = await getSelectedAccount();
    const url = await getSelectedUrl();

    const contract = await provider.getClassAt(ETH_ADDRESS);
    const erc20 = new Contract(contract.abi, ETH_ADDRESS, provider);

    erc20.connect(acc);
    const balance = await erc20.balanceOf(acc.address);
    if (amount > balance) {
      let data = {
        address: acc.address,
        amount: Number(BigInt(amount - balance).toString()),
      };
      for (let index = BigInt(amount - balance); index > 0; ) {
        let res = index;
        if (index >= MAX_AMOUNT_TO_MINT) {
          res = 10000000000000000000n;
        }
        data.amount = Number(BigInt(res).toString());
        await fetch(`${url}/mint`, {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        index -= res;
      }
    } else if (amount < balance) {
      let transferResponse;
      const estimate = await acc.estimateInvokeFee({
        contractAddress: erc20.address,
        entrypoint: 'transfer',
        calldata: ['0x1', uint256.bnToUint256(balance - amount)],
      });
      if (estimate.suggestedMaxFee > amount) {
        transferResponse = await erc20.transfer('0x1', balance - amount + estimate.suggestedMaxFee);
      } else {
        transferResponse = await erc20.transfer('0x1', balance - amount);
      }
      await provider.waitForTransaction(transferResponse.transaction_hash);
    }
    const newBalance = await erc20.balanceOf(acc.address);

    return newBalance;
  } catch (error) {
    return null;
  }
}
