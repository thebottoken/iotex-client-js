// @flow
import {HttpProvider} from '../provider';
import type {Provider} from '../provider';

type Wallet = {
  privateKey: string,
  publicKey: string,
  rawAddress: string,
};

export class Accounts {
  wallets: {[privateKey: string]: Wallet};
  provider: Provider;

  constructor(provider: Provider) {
    this.wallets = {};
    this.provider = provider || new HttpProvider({url: 'https://iotexscan.io/api/wallet-core/'});
    [
      'generateWallet',
      'unlockWallet',
      'signTransfer',
      'signVote',
      'signSmartContract',
    ].map(method => {
      // $FlowFixMe
      this[method] = async(...args) => {
        const resp = await this.provider.send({method, params: args});
        if (resp.error) {
          throw new Error(`failed to ${method}: ${JSON.stringify(resp.error.message)}`);
        }
        return resp.result;
      };
    });
  }

  async create() {
    // $FlowFixMe
    const wallet = await this.generateWallet();
    this.wallets[wallet.privateKey] = wallet;
    return wallet;
  }

  async privateKeyToAccount(privateKey: string) {
    // $FlowFixMe
    const wallet = await this.unlockWallet(privateKey);
    this.wallets[wallet.privateKey] = wallet;
    return wallet;
  }

  async signTransaction(tx: any, privateKey: string) {
    // getId, getGasPrice, getTransactionCount
    // sign
  }
}

