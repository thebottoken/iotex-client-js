// @flow
import {HttpProvider} from '../provider';
import type {Provider} from '../provider';
import {RpcMethods} from '../rpc-methods';

type Wallet = {
  privateKey: string,
  publicKey: string,
  rawAddress: string,
};

export type UnsignedTransfer = {
  version: number,
  nonce: number,
  amount: number,
  sender: string,
  recipient: string,
  payload: string,
  isCoinbase: boolean,
  senderPubKey: string,
  gasLimit: number,
  gasPrice: string,
}

export type UnsignedExecution = {
  byteCode: string,
  nonce: ?number,
  gasLimit: number,
  version: number,
  contract: ?string,
  amount: string,
};

/**
 * Accounts contains functions to generate Iotex accounts and sign transactions and data.
 * @example
 * import {Accounts, HttpProvider} from 'iotex-client-js';
 * const accounts = new Accounts(new HttpProvider('http://localhost:4004/api/wallet-core/'));
 * const wallet = await accounts.create();
 * // => {
 * //   "publicKey": "...",
 * //   "privateKey": "...",
 * //   "rawAddress": "..."
 * // }
 *
 *
 * const unlockedWallet = await accounts.add('...iotx private key...');
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
 */
export class Accounts {
  wallets: { [publicKey: string]: Wallet };
  remoteWallet: Provider;
  rpcMethods: RpcMethods;

  walletRpcMethods: any; // should be deprecated

  /**
   * constructor creates an object of Accounts with iotex API remote methods.
   * @param rpcMethods
   */
  constructor(rpcMethods: RpcMethods) {
    this.wallets = {};
    this.rpcMethods = rpcMethods;
    this.remoteWallet = new HttpProvider('http://localhost:4004/api/wallet-core/');

    this.walletRpcMethods = {};
    [
      'generateWallet',
      'unlockWallet',
      'signTransfer',
      'signVote',
      'signSmartContract',
    ].map(method => {
      // $FlowFixMe
      this.walletRpcMethods[method] = async(...args) => {
        const resp = await this.remoteWallet.send({method, params: args});
        if (resp.error) {
          throw new Error(`failed to Accounts.${method}: ${JSON.stringify(resp.error)}`);
        }
        return resp.result;
      };
    });
  }

  /**
   * create generates a wallet and add it to local wallets.
   * @returns
   */
  async create(): Promise<Wallet> {
    // $FlowFixMe
    const wallet = await this.walletRpcMethods.generateWallet();
    this.wallets[wallet.publicKey] = wallet;
    return wallet;
  }

  /**
   * privateKeyToAccount gets the whole wallet from private key.
   * @param privateKey
   * @returns
   */
  async privateKeyToAccount(privateKey: string): Promise<Wallet> {
    // $FlowFixMe
    return await this.walletRpcMethods.unlockWallet(privateKey);
  }

  /**
   * privateKeyToAccount gets the whole wallet from private key and save it to local wallets.
   * @param privateKey
   * @returns
   */
  async add(privateKey: string): Promise<Wallet> {
    const wallet = await this.privateKeyToAccount(privateKey);
    this.wallets[wallet.publicKey] = wallet;
    return wallet;
  }

  /**
   * signTransfer signs a transfer with the wallet.
   * @param unsignedTransfer
   * @param wallet
   * @returns
   */
  async signTransfer(unsignedTransfer: UnsignedTransfer, wallet: Wallet) {
    if (!unsignedTransfer.hasOwnProperty('nonce')) {
      const details = await this.rpcMethods.getAddressDetails(wallet.rawAddress);
      unsignedTransfer.nonce = details.pendingNonce;
    }

    return await this.walletRpcMethods.signTransfer(wallet, unsignedTransfer);
  }

  /**
   * signSmartContract signs an execution with the wallet.
   * @param wallet
   * @param exec
   * @returns
   */
  async signSmartContract(wallet: Wallet, exec: UnsignedExecution): any {
    if (!exec.hasOwnProperty('nonce')) {
      const details = await this.rpcMethods.getAddressDetails(wallet.rawAddress);
      exec.nonce = details.pendingNonce;
    }

    return await this.walletRpcMethods.signSmartContract(wallet, exec);
  }
}

