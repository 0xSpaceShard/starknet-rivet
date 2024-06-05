import { RequestAccountsParameters } from "starknet-types"
import SingletonContext from "../../../services/contextService";

export async function requestAccountsHandler(
  params?: RequestAccountsParameters,
) {
    const context = SingletonContext.getInstance();
    if (!context) {
      throw new Error('Context value is undefined');
    }

  const address  = context.getSelectedAccount();

  return [address]
}