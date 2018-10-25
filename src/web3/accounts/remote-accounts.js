import {inputCallFormatter, isAddress} from "../helpers";
import _ from "underscore";
import {Wallet} from "./wallet";
import {isNot} from "./utils";
import core from "../core";
import Method from "../core-method";
import {hexToNumber, hexToNumberString} from "web3-utils";

const utils = require('web3-utils');

const HttpProvider = require('web3-providers-http');

let requestId = 0;

export class Accounts {
  constructor(url) {
    const _this = this;

    // sets _requestmanager
    core.packageInit(this, arguments);

    // remove unecessary core functions
    delete this.BatchRequest;
    delete this.extend;

    const _iotxCall = [
      new Method({
        name: 'getId',
        call: 'Web3API.netVersion',
        params: 0,
        outputFormatter: utils.hexToNumber,
      }),
      new Method({
        name: 'getGasPrice',
        call: 'Web3API.iotxGasPrice',
        params: 0,
      }),
      new Method({
        name: 'getTransactionCount',
        call: 'Web3API.iotxGetTransferCount',
        params: 2,
        inputFormatter: [function (address) {
          if (isAddress(address)) {
            return address;
          }
          throw new Error(`Address ${ address } is not a valid address to get the "transactionCount".`);

        }, function () {
          return 'latest';
        }],
      }),
    ];
    // attach methods to this._iotxCall
    this._iotxCall = {};
    _.each(_iotxCall, function (method) {
      method.attachToObject(_this._iotxCall);
      method.setRequestManager(_this._requestManager);
    });

    this.provider = new HttpProvider('http://localhost:4004/api/wallet-core/');
    [
      'generateWallet',
      'unlockWallet',
      'signTransfer',
      'signVote',
      'signSmartContract',
    ].map(method => {
      this[method] = async (...args) => {
        const resp = await this._send({method, params: args});
        return resp.result;
      };
    });
    this.wallet = new Wallet(this);
  }

  async _send({method, params}) {
    return new Promise(((resolve, reject) => {
      this.provider.send(
        {
          id: requestId++,
          jsonrpc: '2.0',
          method,
          params,
        },
        (err, result) => {
          if (err) {
            return reject(err);
          }
          return resolve(result);
        });
    }));
  }

  async create(entropy) {
    const acct = await this.generateWallet();
    acct.address = acct.rawAddress;
    return this._addAccountFunctions(acct);
  }

  async privateKeyToAccount(privateKey) {
    const acct = await this.unlockWallet(privateKey);
    acct.address = acct.rawAddress;
    return this._addAccountFunctions(acct);
  }

  async signTransaction(tx, privateKey, callback) {
    const _this = this;

    let error = false;

    let result;

    callback = callback || function () {
    };

    if (!tx) {
      error = new Error('No transaction object given!');

      callback(error);
      return Promise.reject(error);
    }

    const unlocked = await _this.privateKeyToAccount(privateKey);

    async function signed(tx) {
      const signedTransfer = await _this.signTransfer(
        {
          privateKey: unlocked.privateKey,
          publicKey: unlocked.publicKey,
          rawAddress: unlocked.rawAddress,
        },
        {
          version: 1,
          nonce: hexToNumberString(tx.nonce),
          amount: hexToNumberString(tx.value),
          sender: tx.from,
          to: tx.recipient,
          payload: tx.data,
          senderPubKey: unlocked.publicKey,
        },
      );
      tx.rawTransaction = {
        ...tx,
        signature: signedTransfer.signature,
        senderPubKey: unlocked.publicKey,
      };
      return tx;
    }

    // Resolve immediately if nonce, chainId and price are provided
    if (tx.nonce !== undefined && tx.chainId !== undefined && tx.gasPrice !== undefined) {
      return Promise.resolve(signed(tx));
    }

    // Otherwise, get the missing info from the Ethereum Node
    return Promise.all([
      isNot(tx.chainId) ? _this._iotxCall.getId() : tx.chainId,
      isNot(tx.gasPrice) ? _this._iotxCall.getGasPrice() : tx.gasPrice,
      isNot(tx.nonce) ? _this._iotxCall.getTransactionCount(unlocked.address) : tx.nonce,
    ]).then(function (args) {
      if (isNot(args[0]) || isNot(args[1]) || isNot(args[2])) {
        throw new Error(`One of the values "chainId", "gasPrice", or "nonce" couldn't be fetched: ${ JSON.stringify(args)}`);
      }
      return signed(_.extend(tx, {chainId: args[0], gasPrice: args[1], nonce: args[2]}));
    });
  }

  recoverTransaction(rawTx) {

  }

  hashMessage(data) {

  }

  sign(data, privateKey) {

  }

  recover(message, signature, preFixed) {

  }

  decrypt(v3Keystore, password, nonStrict) {

  }

  encrypt(privateKey, password, options) {

  }

  _addAccountFunctions(account) {
    const _this = this;

    // add sign functions
    account.signTransaction = function signTransaction(tx, callback) {
      return _this.signTransaction(tx, account.privateKey, callback);
    };
    account.sign = function sign(data) {
      return _this.sign(data, account.privateKey);
    };

    account.encrypt = function encrypt(password, options) {
      return _this.encrypt(account.privateKey, password, options);
    };

    return account;
  }
}

