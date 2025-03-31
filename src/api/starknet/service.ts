import { RpcProvider } from 'starknet';

import { logError } from '../../background/analytics';
import {
  BlockWithTxs,
  ConsumeMessageFromL2Params,
  LoadL1MessagingContractParams,
  SendMessageToL2Params,
} from './types';
import { numericToHexString } from '../../components/utils/utils';

const starknetApi = {
  getBlockWithTxs: async (
    provider: RpcProvider,
    blockNumber: number,
    setBlockDetails: React.Dispatch<any>
  ): Promise<BlockWithTxs | null> => {
    try {
      const block = (await provider.getBlockWithTxs(blockNumber)) as unknown as BlockWithTxs;
      setBlockDetails(block);

      return block;
    } catch (error) {
      logError('getBlockWithTxs error:', error);
      return null;
    }
  },

  getBlocksWithTxs: async (
    provider: RpcProvider,
    index: number,
    currentBlock: number,
    pageSize: number
  ): Promise<BlockWithTxs[]> => {
    try {
      const start = currentBlock - index * pageSize;
      const end = index + 1 >= 0 ? start - pageSize + 1 : 0;
      const indices: number[] = [];

      for (let i = start; i >= end; i--) {
        if (i < 0) break;
        indices.push(i);
      }
      const blockPromises = indices.map(
        (i) => provider.getBlockWithTxs(i) as any as Promise<BlockWithTxs>
      );

      const blockData = await Promise.all(blockPromises);

      return blockData;
    } catch (error) {
      logError('getBlocksWithTxs error:', error);
      return [];
    }
  },

  load: async (
    l2ProviderUrl: string,
    params: LoadL1MessagingContractParams
  ): Promise<string | null> => {
    try {
      const response = await fetch(`${l2ProviderUrl}/postman/load_l1_messaging_contract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          network_url: params.networkUrl,
          address: params.address, // Optional
        }),
      });

      const data: {
        messaging_contract_address: string;
      } = await response.json();

      if (data) return data.messaging_contract_address;

      return null;
    } catch (error) {
      logError('load L1 messaging contract error:', error);
      return null;
    }
  },

  flush: async (l2ProviderUrl: string): Promise<void> => {
    try {
      await fetch(`${l2ProviderUrl}/postman/flush`, {
        method: 'POST',
      });
    } catch (error) {
      logError('flush error:', error);
    }
  },

  sendMessageToL2: async (
    l2ProviderUrl: string,
    params: SendMessageToL2Params
  ): Promise<string | null> => {
    try {
      const response = await fetch(`${l2ProviderUrl}/postman/send_message_to_l2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          l2_contract_address: params.l2ContractAddress,
          entry_point_selector: params.entryPointSelector,
          l1_contract_address: params.l1ContractAddress,
          payload: params.payload,
          paid_fee_on_l1: numericToHexString(params.paidFeeOnL1 || 1),
          nonce: numericToHexString(params.nonce || 0),
        }),
      });

      const data: { transaction_hash: string } = await response.json();

      return data.transaction_hash;
    } catch (error) {
      logError('send message to L2 error:', error);
      return null;
    }
  },

  consumeMessageFromL2: async (
    l2ProviderUrl: string,
    params: ConsumeMessageFromL2Params
  ): Promise<any> => {
    try {
      const response = await fetch(`${l2ProviderUrl}/postman/consume_message_from_l2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from_address: params.fromAddress,
          to_address: params.toAddress,
          payload: params.payload,
        }),
      });

      console.log('consume response', response);

      return await response.json();
    } catch (error) {
      logError('consume message from L2 error:', error);
      console.log('consume message from L2 error:', error);
      return null;
    }
  },
};

export default starknetApi;
