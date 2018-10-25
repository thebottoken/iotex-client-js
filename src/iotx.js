// @flow
import {HttpProvider} from './provider';
import type {Provider} from './provider';

type CoinStatistic = {
  height: number,
  supply: number,
  transfers: number,
  votes: number,
  executions: number,
  aps: number,
}

type BlockGenerator = {
  name: string,
  address: string,
}

type Block = {
  ID: string,
  height: number,
  timestamp: number,
  transfers: number,
  votes: number,
  executions: number,
  generateBy: BlockGenerator,
  amount: number,
  forged: number,
  size: number,
}

type Transfer = {
  version: number,
  ID: string,
  nonce: number,
  sender: string,
  recipient: string,
  amount: number,
  senderPubKey: string,
  signature: string,
  payload: string,
  isCoinbase: boolean,
  fee: number,
  timestamp: number,
  blockID: string,
  isPending: boolean,
}

type Execution = {
  version: number,
  ID: string,
  nonce: number,
  executor: string,
  contract: string,
  amount: number,
  executorPubKey: string,
  signature: string,
  gas: number,
  gasPrice: number,
  timestamp: number,
  data: string,
  blockID: string,
  isPending: boolean,
}

type Log = {
  address: string,
  topics: Array<string>,
  data: string,
  blockNumber: number,
  txnHash: string,
  blockHash: string,
  index: number,
}

type Receipt = {
  returnValue: string,
  status: number,
  hash: string,
  gasConsumed: number,
  contractAddress: string,
  logs: Array<Log>,
}

type Vote = {
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

type AddressDetails = {
  address: string,
  totalBalance: number,
  nonce: number,
  pendingNonce: number,
  isCandidate: boolean,
}

type Candidate = {
  address: string,
  totalVote: number,
  creationHeight: number,
  lastUpdateHeight: number,
  isDelegate: boolean,
  isProducer: boolean,
}

type CandidateMetrics = {
  candidates: Array<Candidate>,
  latestEpoch: number,
  latestHeight: number,
}

type ConsensusMetrics = {
  latestEpoch: number,
  latestDelegates: Array<string>,
  latestBlockProducer: string,
  candidates: Array<string>,
}

type SendTransferRequest = {
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

type SendTransferResponse = {
  hash: string,
}

type SendVoteRequest = {
  version: number,
  nonce: number,
  voter: string,
  votee: string,
  voterPubKey: string,
  signature: string,
}

type SendVoteResponse = {
  hash: string,
}

type Node = {
  address: string,
}

type GetPeersResponse = {
  Self: Node,
  Peers: Array<Node>,
}

type SendSmartContractResponse = {
  hash: string,
}

export class Iotx {
  provider: Provider;

  constructor(provider: Provider) {
    this.provider = provider || new HttpProvider({url: 'http://127.0.0.1:14004'});
  }

  async send(method: string, ...args: Array<any>) {
    const resp = await this.provider.send({method: `Explorer.${method}`, params: args});
    if (resp.error) {
      throw new Error(`failed to ${method}: ${JSON.stringify(resp.error.message)}`);
    }
    return resp.result;
  }

  // get the blockchain tip height
  async getBlockchainHeight(): Promise<number> {
    return await this.send(this.getBlockchainHeight.name);
  }

  // get the balance of an address
  async getAddressBalance(address: string): Promise<number> {
    return await this.send(this.getAddressBalance.name, address);
  }

  // get the address detail of an iotex address
  async getAddressDetails(address: string): Promise<AddressDetails> {
    return await this.send(this.getAddressDetails.name, address);
  }

  // get list of transfers by start block height, transfer offset and limit
  async getLastTransfersByRange(startBlockHeight: number, offset: number, limit: number, showCoinBase: boolean): Promise<Array<Transfer>> {
    return await this.send(this.getLastTransfersByRange.name, startBlockHeight, offset, showCoinBase);
  }

  // get transfers from transaction id
  async getTransferByID(transferID: string): Promise<Transfer> {
    return await this.send(this.getTransferByID.name, transferID);
  }

  // get list of transfers belonging to an address
  async getTransfersByAddress(address: string, offset: number, limit: number): Promise<Array<Transfer>> {
    return await this.send(this.getTransfersByAddress.name, address, offset, limit);
  }

  // get list of unconfirmed transfers in actpool belonging to an address
  async getUnconfirmedTransfersByAddress(address: string, offset: number, limit: number): Promise<Array<Transfer>> {
    return await this.send(this.getUnconfirmedTransfersByAddress.name, address, offset, limit);
  }

  // get all transfers in a block
  async getTransfersByBlockID(blkID: string, offset: number, limit: number): Promise<Array<Transfer>> {
    return await this.send(this.getTransfersByBlockID.name, blkID, offset, limit);
  }

  // get list of votes by start block height, vote offset and limit
  async getLastVotesByRange(startBlockHeight: number, offset: number, limit: number): Promise<Array<Vote>> {
    return await this.send(this.getLastVotesByRange.name, startBlockHeight, offset, limit);
  }

  // get vote from vote id
  async getVoteByID(voteID: string): Promise<Vote> {
    return await this.send(this.getVoteByID.name, voteID);
  }

  // get list of votes belonging to an address
  async getVotesByAddress(address: string, offset: number, limit: number): Promise<Array<Vote>> {
    return await this.send(this.getVotesByAddress.name, address, offset, limit);
  }

  // get list of unconfirmed votes in actpool belonging to an address
  async getUnconfirmedVotesByAddress(address: string, offset: number, limit: number): Promise<Array<Vote>> {
    return await this.send(this.getUnconfirmedVotesByAddress.name, address, offset, limit);
  }

  // get all votes in a block
  async getVotesByBlockID(blkID: string, offset: number, limit: number): Promise<Array<Vote>> {
    return await this.send(this.getVotesByBlockID.name, blkID, offset, limit);
  }

  // get list of executions by start block height, execution offset and limit
  async getLastExecutionsByRange(startBlockHeight: number, offset: number, limit: number): Promise<Array<Execution>> {
    return await this.send(this.getLastExecutionsByRange.name, startBlockHeight, offset, limit);
  }

  // get execution from execution id
  async getExecutionByID(executionID: string): Promise<Execution> {
    return await this.send(this.getExecutionByID.name, executionID);
  }

  // get list of executions belonging to an address
  async getExecutionsByAddress(address: string, offset: number, limit: number): Promise<Array<Execution>> {
    return await this.send(this.getExecutionsByAddress.name, address, offset, limit);
  }

  // get list of unconfirmed executions in actpool belonging to an address
  async getUnconfirmedExecutionsByAddress(address: string, offset: number, limit: number): Promise<Array<Execution>> {
    return await this.send(this.getUnconfirmedExecutionsByAddress.name, address, offset, limit);
  }

  // get all executions in a block
  async getExecutionsByBlockID(blkID: string, offset: number, limit: number): Promise<Array<Execution>> {
    return await this.send(this.getExecutionsByBlockID.name, blkID, offset, limit);
  }

  // get list of blocks by block id offset and limit
  async getLastBlocksByRange(offset: number, limit: number): Promise<Array<Block>> {
    return await this.send(this.getLastBlocksByRange.name, offset, limit);
  }

  // get block by block id
  async getBlockByID(blkID: string): Promise<Block> {
    return await this.send(this.getBlockByID.name, blkID);
  }

  // get statistic of iotx
  async getCoinStatistic(): Promise<CoinStatistic> {
    return await this.send(this.getCoinStatistic.name);
  }

  // get consensus metrics
  async getConsensusMetrics(): Promise<ConsensusMetrics> {
    return await this.send(this.getConsensusMetrics.name);
  }

  // get candidates metrics
  async getCandidateMetrics(): Promise<CandidateMetrics> {
    return await this.send(this.getCandidateMetrics.name);
  }

  // send transfer
  async sendTransfer(request: SendTransferRequest): Promise<SendTransferResponse> {
    return await this.send(this.sendTransfer.name, request);
  }

  // send vote
  async sendVote(request: SendVoteRequest): Promise<SendVoteResponse> {
    return await this.send(this.sendVote.name, request);
  }

  // sendSmartContract
  async sendSmartContract(request: Execution): Promise<SendSmartContractResponse> {
    return await this.send(this.sendSmartContract.name, request);
  }

  // get list of peers
  async getPeers(): Promise<GetPeersResponse> {
    return await this.send(this.getPeers.name);
  }

  // get receipt by execution id
  async getReceiptByExecutionID(id: string): Promise<Receipt> {
    return await this.send(this.getReceiptByExecutionID.name, id);
  }

  // read execution state
  async readExecutionState(request: Execution): Promise<string> {
    return await this.send(this.readExecutionState.name, request);
  }
}
