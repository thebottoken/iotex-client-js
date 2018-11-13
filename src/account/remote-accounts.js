// @flow
import {HttpProvider} from '../provider';
import type {Provider} from '../provider';
import {RpcMethods} from '../rpc-methods';

const DEFAULT_URL = 'http://localhost:4004/api/wallet-core/';

/**
 * TWallet type contains the private key, public key, and raw address.
 */
type TWallet = {
  privateKey: string,
  publicKey: string,
  rawAddress: string,
};

/**
 * TUnsignedTransfer is the type of unsigned transfer to be signed.
 */
export type TUnsignedTransfer = {
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

/**
 * UnsignedExecution is the type of the unsigned execution to be signed.
 */
export type TUnsignedExecution = {
  byteCode: string,
  nonce: ?number,
  gasLimit: number,
  version: number,
  contract: ?string,
  amount: string,
};

/**
 * TCreateDeposit is the type of the request to create deposit.
 */
export type TCreateDeposit = {
  nonce: number,
  signature: string,
  amount: string,
  sender: string,
  recipient: string,
  gasLimit: number,
  gasPrice: string,
  version: number,
  senderPubKey: string,
}

/**
 * TSettleDeposit is the type of the request to settle deposit.
 */
export type TSettleDeposit = {
  nonce: number,
  signature: string,
  amount: string,
  index: number,
  sender: string,
  recipient: string,
  gasLimit: number,
  gasPrice: string,
  version: number,
  senderPubKey: string,
}

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
  wallets: { [publicKey: string]: TWallet };
  walletProvider: Provider;
  rpcMethods: RpcMethods;
  chainId: number;

  walletRpcMethods: any; // should be deprecated

  /**
   * constructor creates an object of Accounts with iotex API remote methods.
   * @param rpcMethods is the rpc methods this module is depending on to communicate with the blockchain instance.
   * @param chainId is the optional param to specify what the chain id those accounts are associated with.
   * @param walletProvider is the remote wallet provider.
   */
  constructor(rpcMethods: RpcMethods, chainId: ?number, walletProvider: ?Provider) {
    this.wallets = {};
    this.rpcMethods = rpcMethods;
    this.chainId = chainId || 1;
    this.walletProvider = walletProvider || new HttpProvider(DEFAULT_URL);

    this.walletRpcMethods = {};
    [
      'generateWallet',
      'unlockWallet',
      'signTransfer',
      'signVote',
      'signSmartContract',
      'signCreateDeposit',
      'signSettleDeposit',
    ].map(method => {
      // $FlowFixMe
      this.walletRpcMethods[method] = async(...args) => {
        const resp = await this.walletProvider.send({method, params: args});
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
  async create(): Promise<TWallet> {
    // $FlowFixMe
    const wallet = await this.walletRpcMethods.generateWallet(this.chainId);
    this.wallets[wallet.publicKey] = wallet;
    return wallet;
  }

  /**
   * privateKeyToAccount gets the whole wallet from private key.
   * @param privateKey
   * @returns
   */
  async privateKeyToAccount(privateKey: string): Promise<TWallet> {
    // $FlowFixMe
    return await this.walletRpcMethods.unlockWallet(privateKey, this.chainId);
  }

  /**
   * privateKeyToAccount gets the whole wallet from private key and save it to local wallets.
   * @param privateKey
   * @returns
   */
  async add(privateKey: string): Promise<TWallet> {
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
  async signTransfer(unsignedTransfer: TUnsignedTransfer, wallet: TWallet) {
    if (!unsignedTransfer.nonce) {
      const details = await this.rpcMethods.getAddressDetails(wallet.rawAddress);
      unsignedTransfer.nonce = details.pendingNonce;
    }

    return await this.walletRpcMethods.signTransfer(wallet, unsignedTransfer);
  }

  /**
   * signSmartContract signs an execution with the wallet.
   * @param exec
   * @param wallet
   * @returns
   */
  async signSmartContract(exec: TUnsignedExecution, wallet: TWallet): any {
    if (!exec.nonce) {
      const details = await this.rpcMethods.getAddressDetails(wallet.rawAddress);
      exec.nonce = details.pendingNonce;
    }

    return await this.walletRpcMethods.signSmartContract(wallet, exec);
  }

  /**
   * signSettleDeposit signs an settle deposit action.
   * @param settleDeposit
   * @param wallet
   * @returns
   */
  async signSettleDeposit(settleDeposit: TSettleDeposit, wallet: TWallet): Promise<TSettleDeposit> {
    if (!settleDeposit.nonce) {
      const details = await this.rpcMethods.getAddressDetails(wallet.rawAddress);
      settleDeposit.nonce = details.pendingNonce;
    }

    const resp = await this.walletRpcMethods.signSettleDeposit({settleDeposit, address: wallet});
    return resp && resp.settleDeposit;
  }

  /**
   * signCreateDeposit signs an create deposit action.
   * @param createDeposit
   * @param wallet
   * @returns
   */
  async signCreateDeposit(createDeposit: TCreateDeposit, wallet: TWallet): Promise<TCreateDeposit> {
    if (!createDeposit.nonce) {
      const details = await this.rpcMethods.getAddressDetails(wallet.rawAddress);
      createDeposit.nonce = details.pendingNonce;
    }

    const resp = await this.walletRpcMethods.signCreateDeposit({createDeposit, address: wallet});
    return resp && resp.createDeposit;
  }
}

