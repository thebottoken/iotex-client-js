// @flow
import {HttpProvider} from './provider';
import type {Provider} from './provider';

/**
 * TCoinStatistic is the type of stats of the iotx coin.
 */
type TCoinStatistic = {
  height: number,
  supply: number,
  transfers: number,
  votes: number,
  executions: number,
  aps: number,
}

/**
 * TBlockGenerator is the type that identifies the generator of the block.
 */
type TBlockGenerator = {
  name: string,
  address: string,
}

/**
 * TBlock is the type of the meta data of the block.
 */
type TBlock = {
  ID: string,
  height: number,
  timestamp: number,
  transfers: number,
  votes: number,
  executions: number,
  generateBy: TBlockGenerator,
  amount: number,
  forged: number,
  size: number,
}

/**
 * TTransfer is the type of the transfer.
 */
export type TTransfer = {
  version: number,
  ID: string,
  nonce: number,
  sender: string,
  recipient: string,
  amount: number,
  senderPubKey: string,
  payload: string,
  isCoinbase: boolean,
  fee: number,
  timestamp: number,
  blockID: string,
  isPending: boolean,
  signature: ?string,
}

/**
 * TExecution is the type of the execution to be sent to the iotex blockchain.
 */
export type TExecution = {
  version: number,
  ID: string,
  nonce: number,
  executor: string,
  contract: string,
  amount: string,
  executorPubKey: string,
  signature: string,
  gasLimit: number,
  gasPrice: string,
  timestamp: number,
  data: string,
  blockID: string,
  isPending: boolean,
}

/**
 * TLog is the type of the log in the smart contract log.
 */
type TLog = {
  address: string,
  topics: Array<string>,
  data: string,
  blockNumber: number,
  txnHash: string,
  blockHash: string,
  index: number,
}

/**
 * TReceipt is the type of the receipt.
 */
type TReceipt = {
  returnValue: string,
  status: number,
  hash: string,
  gasConsumed: number,
  contractAddress: string,
  logs: Array<TLog>,
}

/**
 * TVote is the type of the vote.
 */
type TVote = {
  version: number,
  ID: string,
  nonce: number,
  timestamp: number,
  voter: string,
  votee: string,
  voterPubKey: string,
  signature: string,
  blockID: string,
  isPending: boolean,
}

/**
 * TAddressDetails is the type of the address' account detail.
 */
type TAddressDetails = {
  address: string,
  totalBalance: number,
  nonce: number,
  pendingNonce: number,
  isCandidate: boolean,
}

/**
 * TCandidate is the type of the candidate.
 */
type TCandidate = {
  address: string,
  totalVote: number,
  creationHeight: number,
  lastUpdateHeight: number,
  isDelegate: boolean,
  isProducer: boolean,
}

/**
 * TCandidateMetrics is the type of the candidate metrics.
 */
type TCandidateMetrics = {
  candidates: Array<TCandidate>,
  latestEpoch: number,
  latestHeight: number,
}

/**
 * TConsensusMetrics is the type of the consensus metrics.
 */
type TConsensusMetrics = {
  latestEpoch: number,
  latestDelegates: Array<string>,
  latestBlockProducer: string,
  candidates: Array<string>,
}

/**
 * TSendTransferRequest is the type of the transfer request.
 */
type TSendTransferRequest = {
  version: number,
  nonce: number,
  sender: string,
  recipient: string,
  amount: number,
  senderPubKey: string,
  signature: string,
  payload: string,
  isCoinbase: boolean,
}

/**
 * TSendTransferResponse is the type of the response of the sendTransfer.
 */
export type TSendTransferResponse = {
  hash: string,
}

/**
 * TSendVoteRequest is the type of the request of the sendVote.
 */
type TSendVoteRequest = {
  version: number,
  nonce: number,
  voter: string,
  votee: string,
  voterPubKey: string,
  signature: string,
}

/**
 * TSendVoteResponse is the type of the response of the sendVote.
 */
type TSendVoteResponse = {
  hash: string,
}

/**
 * TNode is the type of the node.
 */
type TNode = {
  address: string,
}

/**
 * TGetPeersResponse is the type of the response of the getPeers.
 */
type TGetPeersResponse = {
  Self: TNode,
  Peers: Array<TNode>,
}

/**
 * TSendSmartContractResponse is the type of the response of sendSmartContract.
 */
type TSendSmartContractResponse = {
  hash: string,
}

/**
 * Methods are the API remote methods to call iotex blockchain.
 * @example
 * import {Methods, HttpProvider} from 'iotex-client-js';
 * const methods = new Methods(new HttpProvider('http://127.0.0.1:14004'));
 * const height = await methods.getBlockchainHeight();
 * const bal = await methods.getAddressBalance('io1qyqsyqcyae8h2l4w7yr9pw9qdy26rm27jwzrzqtmqqnmt3');
 */
export class Methods {
  provider: Provider;

  constructor(provider: Provider) {
    this.provider = provider || new HttpProvider('http://127.0.0.1:14004');
  }

  async send(method: string, ...args: Array<any>) {
    const resp = await this.provider.send({method: `Explorer.${method}`, params: args});
    if (resp.error) {
      throw new Error(`failed to Methods.${method}: ${JSON.stringify(resp.error.message)}`);
    }
    return resp.result;
  }

  /**
   * get the blockchain tip height
   */
  async getBlockchainHeight(): Promise<number> {
    return await this.send(this.getBlockchainHeight.name);
  }

  /**
   * get the balance of an address
   */
  async getAddressBalance(address: string): Promise<number> {
    return await this.send(this.getAddressBalance.name, address);
  }

  /**
   * get the address detail of an iotex address
   */
  async getAddressDetails(address: string): Promise<TAddressDetails> {
    return await this.send(this.getAddressDetails.name, address);
  }

  /**
   * get list of transfers by start block height, transfer offset and limit
   */
  async getLastTransfersByRange(startBlockHeight: number, offset: number, limit: number, showCoinBase: boolean): Promise<Array<TTransfer>> {
    return await this.send(this.getLastTransfersByRange.name, startBlockHeight, offset, showCoinBase);
  }

  /**
   * get transfers from transaction id
   */
  async getTransferByID(transferID: string): Promise<TTransfer> {
    return await this.send(this.getTransferByID.name, transferID);
  }

  /**
   * get list of transfers belonging to an address
   */
  async getTransfersByAddress(address: string, offset: number, limit: number): Promise<Array<TTransfer>> {
    return await this.send(this.getTransfersByAddress.name, address, offset, limit);
  }

  /**
   * get list of unconfirmed transfers in actpool belonging to an address
   */
  async getUnconfirmedTransfersByAddress(address: string, offset: number, limit: number): Promise<Array<TTransfer>> {
    return await this.send(this.getUnconfirmedTransfersByAddress.name, address, offset, limit);
  }

  /**
   * get all transfers in a block
   */
  async getTransfersByBlockID(blkID: string, offset: number, limit: number): Promise<Array<TTransfer>> {
    return await this.send(this.getTransfersByBlockID.name, blkID, offset, limit);
  }

  /**
   * get list of votes by start block height, vote offset and limit
   */
  async getLastVotesByRange(startBlockHeight: number, offset: number, limit: number): Promise<Array<TVote>> {
    return await this.send(this.getLastVotesByRange.name, startBlockHeight, offset, limit);
  }

  /**
   * get vote from vote id
   */
  async getVoteByID(voteID: string): Promise<TVote> {
    return await this.send(this.getVoteByID.name, voteID);
  }

  /**
   * get list of votes belonging to an address
   */
  async getVotesByAddress(address: string, offset: number, limit: number): Promise<Array<TVote>> {
    return await this.send(this.getVotesByAddress.name, address, offset, limit);
  }

  /**
   * get list of unconfirmed votes in actpool belonging to an address
   */
  async getUnconfirmedVotesByAddress(address: string, offset: number, limit: number): Promise<Array<TVote>> {
    return await this.send(this.getUnconfirmedVotesByAddress.name, address, offset, limit);
  }

  /**
   * get all votes in a block
   */
  async getVotesByBlockID(blkID: string, offset: number, limit: number): Promise<Array<TVote>> {
    return await this.send(this.getVotesByBlockID.name, blkID, offset, limit);
  }

  /**
   * get list of executions by start block height, execution offset and limit
   */
  async getLastExecutionsByRange(startBlockHeight: number, offset: number, limit: number): Promise<Array<TExecution>> {
    return await this.send(this.getLastExecutionsByRange.name, startBlockHeight, offset, limit);
  }

  /**
   * get execution from execution id
   */
  async getExecutionByID(executionID: string): Promise<TExecution> {
    return await this.send(this.getExecutionByID.name, executionID);
  }

  /**
   * get list of executions belonging to an address
   */
  async getExecutionsByAddress(address: string, offset: number, limit: number): Promise<Array<TExecution>> {
    return await this.send(this.getExecutionsByAddress.name, address, offset, limit);
  }

  /**
   * get list of unconfirmed executions in actpool belonging to an address
   */
  async getUnconfirmedExecutionsByAddress(address: string, offset: number, limit: number): Promise<Array<TExecution>> {
    return await this.send(this.getUnconfirmedExecutionsByAddress.name, address, offset, limit);
  }

  /**
   * get all executions in a block
   */
  async getExecutionsByBlockID(blkID: string, offset: number, limit: number): Promise<Array<TExecution>> {
    return await this.send(this.getExecutionsByBlockID.name, blkID, offset, limit);
  }

  /**
   * get list of blocks by block id offset and limit
   */
  async getLastBlocksByRange(offset: number, limit: number): Promise<Array<TBlock>> {
    return await this.send(this.getLastBlocksByRange.name, offset, limit);
  }

  /**
   * get block by block id
   */
  async getBlockByID(blkID: string): Promise<TBlock> {
    return await this.send(this.getBlockByID.name, blkID);
  }

  /**
   * get statistic of iotx
   */
  async getCoinStatistic(): Promise<TCoinStatistic> {
    return await this.send(this.getCoinStatistic.name);
  }

  /**
   * get consensus metrics
   */
  async getConsensusMetrics(): Promise<TConsensusMetrics> {
    return await this.send(this.getConsensusMetrics.name);
  }

  /**
   * get candidates metrics
   */
  async getCandidateMetrics(): Promise<TCandidateMetrics> {
    return await this.send(this.getCandidateMetrics.name);
  }

  /**
   * send transfer
   */
  async sendTransfer(request: TSendTransferRequest): Promise<TSendTransferResponse> {
    return await this.send(this.sendTransfer.name, request);
  }

  /**
   * send vote
   */
  async sendVote(request: TSendVoteRequest): Promise<TSendVoteResponse> {
    return await this.send(this.sendVote.name, request);
  }

  /**
   * sendSmartContract
   */
  async sendSmartContract(request: TExecution): Promise<TSendSmartContractResponse> {
    return await this.send(this.sendSmartContract.name, request);
  }

  /**
   * get list of peers
   */
  async getPeers(): Promise<TGetPeersResponse> {
    return await this.send(this.getPeers.name);
  }

  /**
   * get receipt by execution id
   */
  async getReceiptByExecutionID(id: string): Promise<TReceipt> {
    return await this.send(this.getReceiptByExecutionID.name, id);
  }

  /**
   * read execution state
   */
  async readExecutionState(request: TExecution): Promise<string> {
    return await this.send(this.readExecutionState.name, request);
  }
}
