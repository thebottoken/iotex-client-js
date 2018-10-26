// @flow
import type {Provider} from './provider';
import {Methods} from './methods';
import {Accounts} from './account/remote-accounts';
import type {RawTransfer} from './account/remote-accounts';

export class Iotx {
  provider: Provider;
  methods: Methods;
  accounts: Accounts;

  constructor(provider: Provider) {
    this.provider = provider;
    this.methods = new Methods(provider);
    this.accounts = new Accounts(this.methods);
  }

  async sendTransfer(transfer: RawTransfer) {
    const wallet = this.accounts.wallets[transfer.sender];
    if (!wallet) {
      throw new Error(`failed to sendTransfer: sender address "${transfer.sender}" is not added to accounts`);
    }
    if (!transfer.senderPubKey) {
      transfer.senderPubKey = wallet.publicKey;
    }

    return await this.accounts.signTransfer(transfer, wallet);
  }
}
