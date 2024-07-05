export interface BlockWithTxs {
  block_hash: string;
}

export interface PendingBlockWithTxs {
  starknet_version: string;
}

export type BlockWithTxsUnion = BlockWithTxs | PendingBlockWithTxs;
