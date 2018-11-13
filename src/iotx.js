// @flow
import type {Provider} from './provider';
import {RpcMethods} from './rpc-methods';
import {Accounts} from './account/remote-accounts';
import type {TUnsignedTransfer} from './account/remote-accounts';
import type {TTransfer} from './rpc-methods';
import {contractFactory} from './contract/contract';

/**
 * IotxOpts is the type of Iotx settings. walletProvider is to be deprecated when local implementation is ready in
 * future versions.
 */
type IotxOpts = {
  chainId?: number,
  walletProvider?: Provider,
}

/**
 * Iotx is the client to interact with iotex-core and iotex-wallet.
 * @example
 * import {Iotx, HttpProvider} from 'iotex-client-js';
 *
 * const iotx = new Iotx(new HttpProvider('http://localhost:14004/'));
 * const wallet = await iotx.accounts.create();
 * // => {
 * //   "publicKey": "...",
 * //   "privateKey": "...",
 * //   "rawAddress": "..."
 * // }
 *
 * // recover from private key
 * const unlockedWallet = await iotx.accounts.add('...iotx private key...');
 * // => {
 * //   "publicKey": "...",
 * //   "privateKey": "...",
 * //   "rawAddress": "..."
 * // }
 * accounts.wallets[unlockedWallet.publicKey];
 * // => {
 * //   "publicKey": "...",
 * //   "privateKey": "...",
 * //   "rawAddress": "..."
 * // }
 *
 *
 * // send transfer
 * const receipt = await iotx.sendTransfer({
 *   amount: '1',
 *   sender: unlockedWallet.rawAddress,
 *   senderPubKey: unlockedWallet.publicKey,
 *   recipient: 'recipientAddress',
 *   gasPrice: '1',
 *   gasLimit: 1,
 * });
 *
 *
 * // compile and deploy a contract
 * const solidityFileString = `
 * pragma solidity ^0.4.0;
 *
 * contract SimpleStorage {
 *    uint storedData;
 *
 *    function set(uint x) public {
 *        storedData = x;
 *    }
 *
 *    function get() public view returns (uint) {
 *        return storedData;
 *    }
 *}
 * `;
 * const contractName = ':SimpleStorage';
 * const output = solc.compile(solidityFileString, 1);
 * const abi = JSON.parse(output.contracts[contractName].interface);
 * const provider = new HttpProvider('http://localhost:14004/');
 * const iotx = new Iotx(provider);
 * const wallet = await iotx.accounts.add('c5364b1a2d99d127439be22edfd657889981e9ba4d6d18fe8eca489d48485371efcb2400');
 * const bytecode = output.contracts[contractName].bytecode;
 * const contract = new iotx.Contract({abi, contractName, wallet});
 * const exec = await contract.deploy({
 *    byteCode: bytecode,
 *    gasLimit: 100000,
 *    gasPrice: '0',
 *    version: 1,
 *    contract: '',
 *    amount: '1',
 *  });
 *
 * const timeout = time => new Promise(resolve => window.setTimeout(resolve, time));
 * await timeout(5000);
 *
 * const receipt = await iotx.rpcMethods.getReceiptByExecutionID(exec.ID);
 *
 * // call methods in the smart contract deployed
 * await contract
 * .prepareMethods({
 *      contractAddress: receipt.contractAddress,
 *      gasLimit: 100000,
 *      gasPrice: '0',
 *      version: 1,
 *      amount: '0',
 *    })
 * .set(666);
 *
 * const value = await contract
 * .prepareMethods({
 *      contractAddress: receipt.contractAddress,
 *      gasLimit: 100000,
 *      gasPrice: '0',
 *      version: 1,
 *      amount: '0',
 *    })
 * .get();
 */
export class Iotx {
  provider: Provider;
  rpcMethods: RpcMethods;
  accounts: Accounts;
  Contract: any;
  opts: IotxOpts;

  /**
   * Iotx constructor creates an instance.
   * @param provider is the network provider/endpoint this client will interact with.
   * @param opts are the optional configurations of the Iotx object. default value is `{chainId: 1}`.
   */
  constructor(provider: Provider, opts: ?IotxOpts) {
    this.provider = provider;
    this.opts = opts || {chainId: 1};
    this.rpcMethods = new RpcMethods(provider);
    this.accounts = new Accounts(this.rpcMethods, this.opts.chainId, opts && opts.walletProvider);
    this.Contract = contractFactory(this.provider, this.accounts, this.rpcMethods);
  }

  /**
   * sendTransfer signs, send, and get receipt of the transfer.
   * @param transfer: the transfer to be sent.
   * @returns
   */
  async sendTransfer(transfer: TUnsignedTransfer): Promise<TTransfer> {
    const wallet = this.accounts.wallets[transfer.senderPubKey];
    if (!wallet) {
      throw new Error(`failed to sendTransfer: sender address "${transfer.sender}" is not added to accounts`);
    }

    const signedTransfer = await this.accounts.signTransfer(transfer, wallet);
    const adapted = {
      ...signedTransfer,
      // TODO(tian): to be deprecated
      version: 1,
      isCoinbase: false,
      senderPubKey: transfer.senderPubKey,
      gasLimit: transfer.gasLimit,
      gasPrice: transfer.gasPrice,

    };

    const {hash} = await this.rpcMethods.sendTransfer(adapted);
    return await this.rpcMethods.getTransferByID(hash);
  }
}
