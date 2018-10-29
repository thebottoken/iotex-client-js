// @flow
import type {Provider} from './provider';
import {Methods} from './methods';
import {Accounts} from './account/remote-accounts';
import type {UnsignedTransfer} from './account/remote-accounts';
import type {TTransfer} from './methods';
import {contractFactory} from './contract/contract';

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
 * // run smart contracts from solidity file
 * import solc from 'solc';
 * import fs from 'fs';
 *
 * const solFile = `${__dirname}/RollDice.sol`;
 * const contractName = ':RollDice';
 * const input = fs.readFileSync(solFile);
 * const output = solc.compile(input.toString(), 1);
 * const abi = JSON.parse(output.contracts[contractName].interface);
 * const iotx = new Iotx(provider);
 * const wallet = await iotx.accounts.add('62d8dd889f14f4058b8926041d095c4230f973fe60c8e54c35e5fb57c3a5596225488101');
 * const contract = new iotx.Contract({
 *    abi,
 *    contractName: ':RollDice',
 *    contractAddress: 'io1qyqsyqcy8zn8qths2qajddca0p0umhtfhgj0uqfgfwzvk0',
 *    gasLimit: 1,
 *    wallet,
 *  });
 * const bytecode = output.contracts[contractName].bytecode;
 *
 * const deployedHash = await contract.deploy({byteCode: bytecode, gasLimit: 1, gasPrice: '1', version: 1, contract: '', amount: '1'});
 * const calledHash = await contract.methods.rollAward('id', wallet.rawAddress);
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
