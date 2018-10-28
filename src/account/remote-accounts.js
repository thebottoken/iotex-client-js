// @flow
import {HttpProvider} from '../provider';
import type {Provider} from '../provider';
import {Methods} from '../methods';

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
  gasPrice: number,
}

export type UnsignedExecution = {
  byteCode: string,
  nonce: ?number,
  gasLimit: number,
  version: number,
  contract: string,
  amount: number,
};

/**
 * Accounts contains functions to generate Iotex accounts and sign transactions and data.
 */
export class Accounts {
  wallets: { [publicKey: string]: Wallet };
  remoteWallet: Provider;
  methods: Methods;

  remote: any; // should be deprecated

  /**
   * constructor creates an object of Accounts with iotex API remote methods.
   * @param methods
   */
  constructor(methods: Methods) {
    this.wallets = {};
    this.methods = methods;
    this.remoteWallet = new HttpProvider('http://localhost:4004/api/wallet-core/');

    this.remote = {};
    [
      'generateWallet',
      'unlockWallet',
      'signTransfer',
      'signVote',
      'signSmartContract',
    ].map(method => {
      // $FlowFixMe
      this.remote[method] = async(...args) => {
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
    const wallet = await this.remote.generateWallet();
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
    return await this.remote.unlockWallet(privateKey);
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
    if (!unsignedTransfer.nonce) {
      const details = await this.methods.getAddressDetails(wallet.rawAddress);
      unsignedTransfer.nonce = details.pendingNonce;
    }

    return await this.remote.signTransfer(wallet, unsignedTransfer);
  }

  /**
   * signSmartContract signs an execution with the wallet.
   * @param wallet
   * @param exec
   * @returns
   */
  async signSmartContract(wallet: Wallet, exec: UnsignedExecution): any {
    if (!exec.nonce) {
      const details = await this.methods.getAddressDetails(wallet.rawAddress);
      exec.nonce = details.pendingNonce;
    }

    return await this.remote.signSmartContract(wallet, exec);
  }
}

