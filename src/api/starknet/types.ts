export interface BlockWithTxs {
  status: string;
  block_hash: string;
  parent_hash: string;
  block_number: number;
  sequencer_address: string;
  new_root: string;
  timestamp: number;
  starknet_version: string;
  l1_gas_price: L1GasPrice;
  l1_data_gas_price: L1GasPrice;
  l1_da_mode: string;
  transactions: Transaction[];
}

export interface L1GasPrice {
  price_in_fri: string;
  price_in_wei: string;
}

export interface Transaction {
  transaction_hash: string;
  type: string;
  max_fee: string;
  version: string;
  signature: string[];
  nonce: string;
  sender_address: string;
  calldata: string[];
}

export interface LoadL1MessagingContractParams {
  networkUrl: string;
  address?: string; // Optional existing contract address
}

export interface SendMessageToL2Params {
  l2ContractAddress: string;
  entryPointSelector: string;
  l1ContractAddress: string;
  payload: string[];
  paidFeeOnL1?: string;
  nonce?: string;
}

export interface ConsumeMessageFromL2Params {
  fromAddress: string;
  toAddress: string;
  payload: string[];
}

export interface PostmanResponse {
  status: string;
  message?: string;
  address?: string;
  transaction_hash?: string;
}
