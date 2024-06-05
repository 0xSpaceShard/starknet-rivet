import { GetDeploymentDataResult } from "starknet-types";

export async function addInvokeTransactionHandler(): Promise<GetDeploymentDataResult> {
    return {address: "0x", class_hash: '0x', salt: '0x' , calldata: [], version: 0  }
}