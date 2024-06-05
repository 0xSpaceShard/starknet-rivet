import { RequestAccountsParameters } from "starknet-types"
// import { sendMessage, waitForMessage } from "../messageActions"
import { useContext } from "react";
import { Context } from "../../context/context";
import SingletonContext from "../../../services/contextService";

export async function requestAccountsHandler(
  params?: RequestAccountsParameters,
) {
    // sendMessage({
    //     type: "CONNECT_DAPP",
    //     data: { silent: params?.silentMode },
    // })
    const context = SingletonContext.getInstance();
    if (!context) {
      throw new Error('Context value is undefined');
    }
    
    // const { selectedAccount } = context;
  
//   const result = await Promise.race([
//     waitForMessage("CONNECT_DAPP_RES", 10 * 60 * 1000),
//     waitForMessage("REJECT_PREAUTHORIZATION", 10 * 60 * 1000).then(
//       () => "USER_ABORTED" as const,
//     ),
//   ])

//   if (!result) {
//     throw Error("No wallet account (should not be possible)")
//   }
//   if (result === "USER_ABORTED") {
//     throw Error("User aborted")
//   }

  const address  = context.getSelectedAccount();

  return [address]
}