import {
    Abi,
    Account,
    AllowArray,
    Call,
    DeclareContractPayload,
    DeclareContractResponse,
    InvocationsDetails,
    InvokeFunctionResponse,
    ProviderInterface,
    RpcProvider,
    Signature,
    UniversalDetails,
    defaultProvider,
    ec,
    typedData,
  } from "starknet"
  
  import { sendMessage, waitForMessage } from "./messageActions"

  export class RivetAccount extends Account {
    constructor(address: string, pk: string, provider?: ProviderInterface) {
        super(provider || defaultProvider, address, pk)
    }
  
    public async execute(
        transactions: AllowArray<Call>,
        abis?: Abi[] | UniversalDetails,
        transactionsDetail?: UniversalDetails
    ): Promise<InvokeFunctionResponse> {
        sendMessage({
            type: "EXECUTE_RIVET_TRANSACTION",
            data: {
            transactions,
            abis,
            transactionsDetail,
            },
        })

        const response = await waitForMessage("EXECUTE_RIVET_TRANSACTION_RES", 10 * 60 * 1000)
    
        return {
            transaction_hash: response.transaction_hash,
        }
    }
  }