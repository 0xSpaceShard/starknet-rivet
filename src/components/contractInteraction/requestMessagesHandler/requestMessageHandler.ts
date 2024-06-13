
import { RpcMessage } from "starknet-types"
import { watchAssetHandler } from "./watchAsset"
import { requestAccountsHandler } from "./requestAccounts"
import { addStarknetChainHandler } from "./addStarknetChainHandler"
import { switchStarknetChainHandler } from "./switchStarknetChainHandler"
import { getPermissionsHandler } from "./getPermissionsHandler"
import { deploymentDataHandler } from "./deploymentDataHandler"
import { requestChainIdHandler } from "./requestChainIdHandler"
import { signTypedDataHandler } from "./signTypedData"

// NEED TO IMPLEMENT EVERY FUNCTION
export async function requestMessageHandler<T extends RpcMessage>(
  call: Omit<T, "result">,
): Promise<T["result"]> {
  const handlerMap: Record<string, (params?: any) => Promise<any>> = {
    // Wallet requests
    wallet_addStarknetChain: addStarknetChainHandler,
    wallet_switchStarknetChain: switchStarknetChainHandler,
    wallet_watchAsset: watchAssetHandler,
    wallet_requestAccounts: requestAccountsHandler,
    wallet_getPermissions: getPermissionsHandler,
    wallet_requestChainId: requestChainIdHandler,
    wallet_deploymentData: deploymentDataHandler,
    // Starknet requests
    starknet_addDeclareTransaction: deploymentDataHandler,
    starknet_addInvokeTransaction: deploymentDataHandler,
    starknet_signTypedData: signTypedDataHandler,
    starknet_supportedSpecs: deploymentDataHandler,
  }

  const notImplementedTypes = new Set(["starknet_addDeployAccountTransaction"])

  if (notImplementedTypes.has(call.type)) {
    throw new Error("Not implemented")
  }

  const handler = handlerMap[call.type]
  if (handler) {
    return "params" in call ? handler(call.params) : handler()
  }

  throw new Error(`Unknown request type: ${call.type}`)
}