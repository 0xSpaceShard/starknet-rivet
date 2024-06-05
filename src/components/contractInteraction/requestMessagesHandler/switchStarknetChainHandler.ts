import { SwitchStarknetChainParameters } from "starknet-types";

export async function switchStarknetChainHandler({
    chainId,
  }: SwitchStarknetChainParameters): Promise<boolean> {
    return true;
  }