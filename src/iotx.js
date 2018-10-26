// @flow
import type {Provider} from './provider';
import {Methods} from './methods';
import {Accounts} from './account/remote-accounts';
import type {RawTransfer} from './account/remote-accounts';
import type {Transfer} from './methods';
import {contractFactory} from './contract';

export class Iotx {
  provider: Provider;
  methods: Methods;
  accounts: Accounts;
  Contract: any;

  constructor(provider: Provider) {
    this.provider = provider;
    this.methods = new Methods(provider);
    this.accounts = new Accounts(this.methods);
    this.Contract = contractFactory(this.provider, this.accounts, this.methods);
  }

  async sendTransfer(transfer: RawTransfer): Promise<Transfer> {
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

    const {hash} = await this.methods.sendTransfer(adapted);
    return await this.methods.getTransferByID(hash);
  }
}
