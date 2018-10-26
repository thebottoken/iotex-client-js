// @flow
import {HttpProvider} from '../provider';
import type {Provider} from '../provider';
import {Methods} from '../methods';

type Wallet = {
  privateKey: string,
  publicKey: string,
  rawAddress: string,
};

export type RawTransfer = {
  version: number,
  nonce: number,
  amount: number,
  sender: string,
  recipient: string,
  payload: string,
  isCoinbase: boolean,
  senderPubKey: string,
  signature: ?string,
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

export class Accounts {
  wallets: { [publicKey: string]: Wallet };
  remoteWallet: Provider;
  methods: Methods;

  remote: any; // should be deprecated

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

  async create(): Promise<Wallet> {
    // $FlowFixMe
    const wallet = await this.remote.generateWallet();
    this.wallets[wallet.publicKey] = wallet;
    return wallet;
  }

  async privateKeyToAccount(privateKey: string): Promise<Wallet> {
    // $FlowFixMe
    return await this.remote.unlockWallet(privateKey);
  }

  async add(privateKey: string): Promise<Wallet> {
    const wallet = await this.privateKeyToAccount(privateKey);
    this.wallets[wallet.publicKey] = wallet;
    return wallet;
  }

  async signTransfer(rawTransfer: RawTransfer, wallet: Wallet) {
    if (!rawTransfer.nonce) {
      const details = await this.methods.getAddressDetails(wallet.rawAddress);
      rawTransfer.nonce = details.pendingNonce;
    }

    return await this.remote.signTransfer(wallet, rawTransfer);
  }

  async signSmartContract(wallet: Wallet, exec: UnsignedExecution): any {
    if (!exec.nonce) {
      const details = await this.methods.getAddressDetails(wallet.rawAddress);
      exec.nonce = details.pendingNonce;
    }

    return await this.remote.signSmartContract(wallet, exec);
  }
}

