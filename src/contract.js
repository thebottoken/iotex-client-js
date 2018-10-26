// @flow
import {get} from 'dotty';
import type {Provider} from './provider';
import {encodeInputData, getAbiFunctions} from './abi-to-byte';
import {Accounts} from './account/remote-accounts';
import {Methods} from './methods';
import type {UnsignedExecution} from './account/remote-accounts';

// const NONCE_DELTA = 1;

type ContractOpts = {
  provider: Provider,
  abi: any,
  contractAddress: string,
  methods: Methods,
  gasLimit: number,
  accounts: Accounts,
  wallet: {
    publicKey: string,
    privateKey: string,
    rawAddress: string,
  },
};

type SignedTransaction = {
  version: number,
  nonce: number,
  signature: string,
  executor: string,
  contract: string,
  executorPubKey: string,
  gas: number,
  gasPrice: number,
  data: string,
  ID: string,
  amount: number,
  blockID: string,
  isPending: boolean,
  timestamp: number,
};

export class Contract {
  opts: ContractOpts;
  provider: any;
  _abiFunctions: any;
  _iotxMethods: Methods;
  accounts: Accounts;

  methods: { [funcName: string]: any };

  constructor(opts: ContractOpts) {
    this.opts = opts;
    this.provider = opts.provider;
    this._abiFunctions = getAbiFunctions(opts.abi);
    this._iotxMethods = opts.methods;
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
        const value = get(args, `${args.length - 1}.value`);

        // constant function
        if (this._abiFunctions[func].constant) {
          const {error, result} = await this._readExecutionState({data, input: userInput});
          if (error) {
            throw new Error(`cannot readExecutionState: ${JSON.stringify(error)}`);
          }
          return result;
        }

        // non-constant function
        const resp = await this._signContractAbi({data, value});
        if (resp.error) {
          throw new Error(`cannot signContractAbi: ${JSON.stringify(resp.error)}`);
        }

        const {error, result} = await this._sendTransaction(resp.result.signedTransaction);
        if (error) {
          throw new Error(`cannot sendTransaction: ${JSON.stringify(error)}`);
        }
        return result.hash;
      };
    }
  }

  async deploy(exec: UnsignedExecution): any {
    const signed = await this.accounts.signSmartContract(this.opts.wallet, exec);
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

  async _signContractAbi({data, value}: { data: string, value: number }) {
    const nonce = await this._getNextNonce(this.opts.wallet.rawAddress);
    const request = {
      rawTransaction: {
        byteCode: data || '',
        nonce: nonce || 0,
        gasLimit: '1000000',
        version: 1,
        amount: value || 0,
        contract: this.opts.contractAddress,
      },
      wallet: this.opts.wallet,
    };
    return await this.provider.send({method: 'JsonRpc.signContractAbi', params: [request]});
  }

  async _sendTransaction(transaction: SignedTransaction) {
    const request = {
      signedTransaction: transaction,
      type: 'contract',
    };
    return await this.provider.send({method: 'JsonRpc.sendTransaction', params: [request]});
  }

  async _getNextNonce(address: string) {
    const resp = await this._iotxMethods.getAddressDetails(address);
    return (resp && resp.pendingNonce) || 0;
  }

  async getReceiptByExecutionId(hash: string) {
    const resp = await this.provider.send(
      {method: 'JsonRpc.getReceiptByExecutionId', params: [hash]}
    );
    return resp && resp.result && resp.result;
  }

  async _readExecutionState({data}: { data: string }) {
    const nonce = await this._getNextNonce(this.opts.wallet.rawAddress);
    const request = {
      ID: '',
      amount: '0',
      version: 0x1,
      gasLimit: this.opts.gasLimit,
      nonce: parseInt(nonce, 10),
      signature: '',
      executor: this.opts.wallet.rawAddress,
      contract: this.opts.contractAddress,
      executorPubKey: this.opts.wallet.publicKey,
      gas: 1000000,
      gasPrice: '0',
      data,
      timestamp: 0,
      blockID: '',
      isPending: false,
    };

    const resp = await this._iotxMethods.readExecutionState(request);
    return resp;
  }
}

export function contractFactory(provider: Provider, accounts: Accounts, methods: Methods) {
  return class CompositeContract extends Contract {
    constructor(opts: ContractOpts) {
      super({provider, accounts, methods, ...opts});
    }
  };
}
