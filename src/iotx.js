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
