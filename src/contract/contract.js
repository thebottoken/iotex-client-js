// @flow
import type {Provider} from '../provider';
import {Accounts} from '../account/remote-accounts';
import {RpcMethods} from '../rpc-methods';
import type {TUnsignedExecution} from '../account/remote-accounts';
import type {TExecution} from '../rpc-methods';
import {encodeInputData, getAbiFunctions} from './abi-to-byte';

/**
 * TContractOpts are the settings to create the contract object with.
 */
type TContractOpts = {
  provider: Provider,
  abi: any,
  contractAddress: string,
  rpcMethods: RpcMethods,
  accounts: Accounts,
  wallet: {
    publicKey: string,
    privateKey: string,
    rawAddress: string,
  },
};

/**
 * TMethodsOpts are settings to call smart contract methods with.
 */
type TMethodsOpts = {
  contractAddress: string,
  nonce: number,
  gasLimit: number,
  gasPrice: string,
  version: number,
  amount: string,
};

/**
 * Contract makes it easy to interact with smart contracts on the iotex blockchain. When you create a new contract
 * object you give it the json interface of the respective smart contract and it will auto converts all calls into
 * low level ABI calls over RPC for you.
 *
 * This allows you to interact with smart contracts as if they were JavaScript objects.
 */
export class Contract {
  opts: TContractOpts;
  provider: any;
  _abiFunctions: any;
  _iotxMethods: RpcMethods;
  accounts: Accounts;
  methodsOpts: TMethodsOpts;

  /**
   * methods are the ABI's methods of the smart contract the user can call.
   */
  methods: { [funcName: string]: Function };

  /**
   * constructor creates a new contract instance with all its methods and events defined in its json interface object.
   * @param opts ContractOpts are the settings to create the contract object with.
   */
  constructor(opts: TContractOpts) {
    this.opts = opts;
    this.provider = opts.provider;
    this._abiFunctions = getAbiFunctions(opts.abi);
    this._iotxMethods = opts.rpcMethods;
    this.accounts = opts.accounts;

    // mount methods
    this.methods = {};
    for (const func in this._abiFunctions) {
      if (!this._abiFunctions.hasOwnProperty(func)) {
        // eslint-disable-next-line no-continue
        continue;
      }
      // eslint-disable-next-line max-statements
      this.methods[func] = async(...args) => {
        const abiFunc = this._abiFunctions[func];
        const userInput = {};
        if (!abiFunc.inputs || !Array.isArray(abiFunc.inputs)) {
          return userInput;
        }
        abiFunc.inputs.map((val, i) => {
          userInput[val.name] = args[i];
        });

        const data = encodeInputData(this._abiFunctions, func, userInput);

        // constant function
        if (this._abiFunctions[func].constant) {
          const {error, result} = await this._readExecutionState({data, input: userInput});
          if (error) {
            throw new Error(`cannot readExecutionState: ${JSON.stringify(error)}`);
          }
          return result;
        }

        // non-constant function
        const resp = await this._signContractBytecode(data);
        const {hash} = await this._iotxMethods.sendSmartContract({
          ...resp,
          // TODO(tian): those fields are strange
          ID: 'ID',
          timestamp: 123,
          blockID: 'blockID',
          isPending: false,
        });

        return await this._iotxMethods.getExecutionByID(hash);
      };
    }
  }

  /**
   * deploy signs an execution and then send it to the iotex blockchain.
   * @param exec
   * @returns
   */
  async deploy(exec: TUnsignedExecution): Promise<TExecution> {
    const signed = await this.accounts.signSmartContract(exec, this.opts.wallet);
    const {hash} = await this._iotxMethods.sendSmartContract({
      ...signed,
      // TODO(tian): those fields are strange
      ID: 'ID',
      executorPubKey: this.opts.wallet.publicKey,
      timestamp: 123,
      blockID: 'blockID',
      isPending: false,
    });
    return await this._iotxMethods.getExecutionByID(hash);
  }

  /**
   * prepareMethods prepares calls of smart contract with method options.
   * @param opts are the settings to call methods with.
   * @returns {{[funcName: string]: Function}}
   */
  prepareMethods(opts: TMethodsOpts) {
    this.methodsOpts = {
      ...this.methodsOpts,
      ...opts,
    };
    return this.methods;
  }

  async _signContractBytecode(data: string) {
    const unsigned = {
      byteCode: data || '',
      nonce: this.methodsOpts.nonce,
      gasLimit: this.methodsOpts.gasLimit,
      gasPrice: this.methodsOpts.gasPrice,
      version: this.methodsOpts.version,
      amount: this.methodsOpts.amount || '0',
      contract: this.methodsOpts.contractAddress || this.opts.contractAddress,
    };
    return await this.accounts.signSmartContract(unsigned, this.opts.wallet);
  }

  async _getNextNonce(address: string) {
    const resp = await this._iotxMethods.getAddressDetails(address);
    return (resp && resp.pendingNonce) || 0;
  }

  async _readExecutionState({data}: { data: string }) {
    if (!this.methodsOpts.nonce) {
      this.methodsOpts.nonce = await this._getNextNonce(this.opts.wallet.rawAddress);
    }
    const request = {
      ID: '',
      signature: '',
      executor: this.opts.wallet.rawAddress,
      executorPubKey: this.opts.wallet.publicKey,
      data,
      timestamp: 0,
      blockID: '',
      isPending: false,
      nonce: this.methodsOpts.nonce,
      gasLimit: this.methodsOpts.gasLimit,
      gasPrice: this.methodsOpts.gasPrice,
      version: this.methodsOpts.version,
      amount: this.methodsOpts.amount || '0',
      contract: this.methodsOpts.contractAddress || this.opts.contractAddress,
    };

    return await this._iotxMethods.readExecutionState(request);
  }
}

export function contractFactory(provider: Provider, accounts: Accounts, rpcMethods: RpcMethods) {
  return class CompositeContract extends Contract {
    constructor(opts: TContractOpts) {
      super({provider, accounts, rpcMethods, ...opts});
    }
  };
}
