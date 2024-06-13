import { SwitchStarknetChainParameters } from "starknet-types";

export async function switchStarknetChainHandler({
    chainId,
  }: SwitchStarknetChainParameters): Promise<boolean> {
    console.log("switchStarknetChainHandler")
    return true;
  }