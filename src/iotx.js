// @flow
import type {Provider} from './provider';
import {Methods} from './methods';
import {Accounts} from './account/remote-accounts';
import type {UnsignedTransfer} from './account/remote-accounts';
import type {TTransfer} from './methods';
import {contractFactory} from './contract/contract';

/**
 * Iotx is the client to interact with iotex-core and iotex-wallet.
 */
export class Iotx {
  provider: Provider;
  methods: Methods;
  accounts: Accounts;
  Contract: any;

  /**
   * Iotx constructor creates an instance.
   * @param provider is the network provider/endpoint this client will interact with.
   */
  constructor(provider: Provider) {
    this.provider = provider;
    this.methods = new Methods(provider);
    this.accounts = new Accounts(this.methods);
    this.Contract = contractFactory(this.provider, this.accounts, this.methods);
  }

  /**
   * sendTransfer signs, send, and get receipt of the transfer.
   * @param transfer: the transfer to be sent.
   * @returns
   */
  async sendTransfer(transfer: UnsignedTransfer): Promise<TTransfer> {
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
