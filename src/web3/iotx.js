/* eslint-disable func-names,consistent-this,no-use-before-define */
import core from 'web3-core';
import Method from 'web3-core-method';
const _ = require('underscore');
const utils = require('web3-utils');
const helpers = require('web3-core-helpers');
const formatter = helpers.formatters;
const BaseContract = require('./contract').Contract;
const {Accounts} = require('./accounts');

const blockCall = function(args) {
  return (_.isString(args[0]) && args[0].indexOf('0x') === 0) ? 'eth_getBlockByHash' : 'eth_getBlockByNumber';
};

const transactionFromBlockCall = function(args) {
  return (_.isString(args[0]) && args[0].indexOf('0x') === 0) ? 'eth_getTransactionByBlockHashAndIndex' : 'eth_getTransactionByBlockNumberAndIndex';
};

const uncleCall = function(args) {
  return (_.isString(args[0]) && args[0].indexOf('0x') === 0) ? 'eth_getUncleByBlockHashAndIndex' : 'eth_getUncleByBlockNumberAndIndex';
};

const getBlockTransactionCountCall = function(args) {
  return (_.isString(args[0]) && args[0].indexOf('0x') === 0) ? 'eth_getBlockTransactionCountByHash' : 'eth_getBlockTransactionCountByNumber';
};

const uncleCountCall = function(args) {
  return (_.isString(args[0]) && args[0].indexOf('0x') === 0) ? 'eth_getUncleCountByBlockHash' : 'eth_getUncleCountByBlockNumber';
};

class Iotx {
  constructor() {
    const _this = this;

    // sets _requestmanager etc
    core.packageInit(this, arguments);

    // overwrite setProvider
    const setProvider = this.setProvider;
    this.setProvider = function() {
      setProvider.apply(_this, arguments);
      _this.net.setProvider.apply(_this, arguments);
      _this.personal.setProvider.apply(_this, arguments);
      _this.accounts.setProvider.apply(_this, arguments);
      _this.Contract.setProvider(_this.currentProvider, _this.accounts);
    };

    let defaultAccount = null;
    let defaultBlock = 'latest';

    Object.defineProperty(this, 'defaultAccount', {
      get() {
        return defaultAccount;
      },
      set(val) {
        if (val) {
          defaultAccount = utils.toChecksumAddress(formatter.inputAddressFormatter(val));
        }

        // also set on the Contract object
        _this.Contract.defaultAccount = defaultAccount;
        _this.personal.defaultAccount = defaultAccount;

        // update defaultBlock
        methods.forEach(function(method) {
          method.defaultAccount = defaultAccount;
        });

        return val;
      },
      enumerable: true,
    });
    Object.defineProperty(this, 'defaultBlock', {
      get() {
        return defaultBlock;
      },
      set(val) {
        defaultBlock = val;
        // also set on the Contract object
        _this.Contract.defaultBlock = defaultBlock;
        _this.personal.defaultBlock = defaultBlock;

        // update defaultBlock
        methods.forEach(function(method) {
          method.defaultBlock = defaultBlock;
        });

        return val;
      },
      enumerable: true,
    });

    // add accounts
    this.accounts = new Accounts(this.currentProvider);

    // create a proxy Contract type for this instance, as a Contract's provider
    // is stored as a class member rather than an instance variable. If we do
    // not create this proxy type, changing the provider in one instance of
    // web3-eth would subsequently change the provider for _all_ contract
    // instances!
    class Contract extends BaseContract {
      constructor(...args) {
        super(...args);
        this.setProvider(_this.currentProvider, _this.accounts);
      }

      defaultAccount = _this.defaultAccount;
      defaultBlock = _this.defaultBlock;
    }
    this.Contract = Contract;

    const methods = [
      new Method({
        name: 'getNodeInfo',
        call: 'web3_clientVersion',
      }),
      new Method({
        name: 'getProtocolVersion',
        call: 'eth_protocolVersion',
        params: 0,
      }),
      new Method({
        name: 'getCoinbase',
        call: 'eth_coinbase',
        params: 0,
      }),
      new Method({
        name: 'isMining',
        call: 'eth_mining',
        params: 0,
      }),
      new Method({
        name: 'getHashrate',
        call: 'eth_hashrate',
        params: 0,
        outputFormatter: utils.hexToNumber,
      }),
      new Method({
        name: 'isSyncing',
        call: 'eth_syncing',
        params: 0,
        outputFormatter: formatter.outputSyncingFormatter,
      }),
      new Method({
        name: 'getGasPrice',
        call: 'eth_gasPrice',
        params: 0,
        outputFormatter: formatter.outputBigNumberFormatter,
      }),
      new Method({
        name: 'getAccounts',
        call: 'eth_accounts',
        params: 0,
        outputFormatter: utils.toChecksumAddress,
      }),
      new Method({
        name: 'getBlockNumber',
        call: 'eth_blockNumber',
        params: 0,
        outputFormatter: utils.hexToNumber,
      }),
      new Method({
        name: 'getBalance',
        call: 'eth_getBalance',
        params: 2,
        inputFormatter: [formatter.inputAddressFormatter, formatter.inputDefaultBlockNumberFormatter],
        outputFormatter: formatter.outputBigNumberFormatter,
      }),
      new Method({
        name: 'getStorageAt',
        call: 'eth_getStorageAt',
        params: 3,
        inputFormatter: [formatter.inputAddressFormatter, utils.numberToHex, formatter.inputDefaultBlockNumberFormatter],
      }),
      new Method({
        name: 'getCode',
        call: 'eth_getCode',
        params: 2,
        inputFormatter: [formatter.inputAddressFormatter, formatter.inputDefaultBlockNumberFormatter],
      }),
      new Method({
        name: 'getBlock',
        call: blockCall,
        params: 2,
        inputFormatter: [formatter.inputBlockNumberFormatter, function(val) {
          return Boolean(val);
        }],
        outputFormatter: formatter.outputBlockFormatter,
      }),
      new Method({
        name: 'getUncle',
        call: uncleCall,
        params: 2,
        inputFormatter: [formatter.inputBlockNumberFormatter, utils.numberToHex],
        outputFormatter: formatter.outputBlockFormatter,

      }),
      new Method({
        name: 'getBlockTransactionCount',
        call: getBlockTransactionCountCall,
        params: 1,
        inputFormatter: [formatter.inputBlockNumberFormatter],
        outputFormatter: utils.hexToNumber,
      }),
      new Method({
        name: 'getBlockUncleCount',
        call: uncleCountCall,
        params: 1,
        inputFormatter: [formatter.inputBlockNumberFormatter],
        outputFormatter: utils.hexToNumber,
      }),
      new Method({
        name: 'getTransaction',
        call: 'eth_getTransactionByHash',
        params: 1,
        inputFormatter: [null],
        outputFormatter: formatter.outputTransactionFormatter,
      }),
      new Method({
        name: 'getTransactionFromBlock',
        call: transactionFromBlockCall,
        params: 2,
        inputFormatter: [formatter.inputBlockNumberFormatter, utils.numberToHex],
        outputFormatter: formatter.outputTransactionFormatter,
      }),
      new Method({
        name: 'getTransactionReceipt',
        call: 'eth_getTransactionReceipt',
        params: 1,
        inputFormatter: [null],
        outputFormatter: formatter.outputTransactionReceiptFormatter,
      }),
      new Method({
        name: 'getTransactionCount',
        call: 'eth_getTransactionCount',
        params: 2,
        inputFormatter: [formatter.inputAddressFormatter, formatter.inputDefaultBlockNumberFormatter],
        outputFormatter: utils.hexToNumber,
      }),
      new Method({
        name: 'sendSignedTransaction',
        call: 'eth_sendRawTransaction',
        params: 1,
        inputFormatter: [null],
      }),
      new Method({
        name: 'signTransaction',
        call: 'eth_signTransaction',
        params: 1,
        inputFormatter: [formatter.inputTransactionFormatter],
      }),
      new Method({
        name: 'sendTransaction',
        call: 'eth_sendTransaction',
        params: 1,
        inputFormatter: [formatter.inputTransactionFormatter],
      }),
      new Method({
        name: 'sign',
        call: 'eth_sign',
        params: 2,
        inputFormatter: [formatter.inputSignFormatter, formatter.inputAddressFormatter],
        transformPayload(payload) {
          payload.params.reverse();
          return payload;
        },
      }),
      new Method({
        name: 'call',
        call: 'eth_call',
        params: 2,
        inputFormatter: [formatter.inputCallFormatter, formatter.inputDefaultBlockNumberFormatter],
      }),
      new Method({
        name: 'estimateGas',
        call: 'eth_estimateGas',
        params: 1,
        inputFormatter: [formatter.inputCallFormatter],
        outputFormatter: utils.hexToNumber,
      }),
      new Method({
        name: 'getCompilers',
        call: 'eth_getCompilers',
        params: 0,
      }),
      new Method({
        name: 'compile.solidity',
        call: 'eth_compileSolidity',
        params: 1,
      }),
      new Method({
        name: 'compile.lll',
        call: 'eth_compileLLL',
        params: 1,
      }),
      new Method({
        name: 'compile.serpent',
        call: 'eth_compileSerpent',
        params: 1,
      }),
      new Method({
        name: 'submitWork',
        call: 'eth_submitWork',
        params: 3,
      }),
      new Method({
        name: 'getWork',
        call: 'eth_getWork',
        params: 0,
      }),
      new Method({
        name: 'getPastLogs',
        call: 'eth_getLogs',
        params: 1,
        inputFormatter: [formatter.inputLogFormatter],
        outputFormatter: formatter.outputLogFormatter,
      }),
    ];

    methods.forEach(method => {
      method.attachToObject(_this);
      method.setRequestManager(_this._requestManager, _this.accounts); // second param means is eth.accounts (necessary for wallet signing)
      method.defaultBlock = _this.defaultBlock;
      method.defaultAccount = _this.defaultAccount;
    });
  }
}

core.addProviders(Iotx);

export {Iotx};
