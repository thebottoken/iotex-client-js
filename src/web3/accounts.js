/* eslint-disable consistent-this,no-undef */
import _ from 'underscore';
import core from './core';
import Method from './core-method';
import {inputCallFormatter, isAddress} from './helpers';
const utils = require('web3-utils');
import RLP from 'eth-lib/'

const TEST_ACCOUNT = {
  privateKey: 'c5364b1a2d99d127439be22edfd657889981e9ba4d6d18fe8eca489d48485371efcb2400',
  publicKey: '2726440bc26449be22eb5c0564af4b23dc8c373aa79e8cb0f8df2a9e55b4842dbefcde07d95c1dc1f3d1a367086b4f7742115b53c434e8f5abf116333c2c378c51b0ef6176153602',
  address: 'io1qyqsyqcy26zujam2gt5cut0ggu8pa4d5q7hnrvsvew32t9',
};

const isNot = function(value) {
  return (_.isUndefined(value) || _.isNull(value));
};

export class Accounts {
  constructor() {
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
        inputFormatter: [function(address) {
          if (isAddress(address)) {
            return address;
          }
          throw new Error(`Address ${ address } is not a valid address to get the "transactionCount".`);

        }, function() {
          return 'latest';
        }],
      }),
    ];
    // attach methods to this._iotxCall
    this._iotxCall = {};
    _.each(_iotxCall, function(method) {
      method.attachToObject(_this._iotxCall);
      method.setRequestManager(_this._requestManager);
    });

    this.wallet = new Wallet(this);
  }

  create(entropy) {
    return this._addAccountFunctions(TEST_ACCOUNT);
  }

  privateKeyToAccount(privateKey) {
    return this._addAccountFunctions(TEST_ACCOUNT);
  }

  signTransaction(tx, privateKey, callback) {
    const _this = this;

    let error = false;

    let result;

    callback = callback || function() {};

    if (!tx) {
      error = new Error('No transaction object given!');

      callback(error);
      return Promise.reject(error);
    }

    function signed(tx) {

      if (!tx.gas && !tx.gasLimit) {
        error = new Error('"gas" is missing');
      }

      if (tx.nonce < 0 ||
        tx.gas < 0 ||
        tx.gasPrice < 0 ||
        tx.chainId < 0) {
        error = new Error('Gas, gasPrice, nonce or chainId is lower than 0');
      }

      if (error) {
        callback(error);
        return Promise.reject(new Error('"gas" is missing'));
      }

      try {
        tx = inputCallFormatter(tx);

        const transaction = tx;
        transaction.to = tx.to || '0x';
        transaction.data = tx.data || '0x';
        transaction.value = tx.value || '0x';
        transaction.chainId = utils.numberToHex(tx.chainId);

        const rlpEncoded = RLP.encode([
          Bytes.fromNat(transaction.nonce),
          Bytes.fromNat(transaction.gasPrice),
          Bytes.fromNat(transaction.gas),
          transaction.to.toLowerCase(),
          Bytes.fromNat(transaction.value),
          transaction.data,
          Bytes.fromNat(transaction.chainId || '0x1'),
          '0x',
          '0x']);

        const hash = Hash.keccak256(rlpEncoded);

        const signature = Account.makeSigner(Nat.toNumber(transaction.chainId || '0x1') * 2 + 35)(Hash.keccak256(rlpEncoded), privateKey);

        const rawTx = RLP.decode(rlpEncoded).slice(0, 6).concat(Account.decodeSignature(signature));

        rawTx[6] = makeEven(trimLeadingZero(rawTx[6]));
        rawTx[7] = makeEven(trimLeadingZero(rawTx[7]));
        rawTx[8] = makeEven(trimLeadingZero(rawTx[8]));

        const rawTransaction = RLP.encode(rawTx);

        const values = RLP.decode(rawTransaction);
        result = {
          messageHash: hash,
          v: trimLeadingZero(values[6]),
          r: trimLeadingZero(values[7]),
          s: trimLeadingZero(values[8]),
          rawTransaction,
        };

      } catch (e) {
        callback(e);
        return Promise.reject(e);
      }

      callback(null, result);
      return result;
    }

    // Resolve immediately if nonce, chainId and price are provided
    if (tx.nonce !== undefined && tx.chainId !== undefined && tx.gasPrice !== undefined) {
      return Promise.resolve(signed(tx));
    }

    // Otherwise, get the missing info from the Ethereum Node
    return Promise.all([
      isNot(tx.chainId) ? _this._iotxCall.getId() : tx.chainId,
      isNot(tx.gasPrice) ? _this._iotxCall.getGasPrice() : tx.gasPrice,
      isNot(tx.nonce) ? _this._iotxCall.getTransactionCount(_this.privateKeyToAccount(privateKey).address) : tx.nonce,
    ]).then(function(args) {
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

class Wallet {
  constructor(accounts) {
    this._accounts = accounts;
    this.length = 0;
    this.defaultKeyName = 'web3js_wallet';
  }

  create(numberOfAccounts, entropy) {
    for (let i = 0; i < numberOfAccounts; ++i) {
      this.add(this._accounts.create(entropy).privateKey);
    }
    return this;
  }

  add(account) {
    if (_.isString(account)) {
      account = this._accounts.privateKeyToAccount(account);
    }
    if (!this[account.address]) {
      account = this._accounts.privateKeyToAccount(account.privateKey);
      account.index = this._findSafeIndex();

      this[account.index] = account;
      this[account.address] = account;
      this[account.address.toLowerCase()] = account;

      this.length++;

      return account;
    }
    return this[account.address];

  }

  remove(addressOrIndex) {
    const account = this[addressOrIndex];

    if (account && account.address) {
      // address
      this[account.address].privateKey = null;
      delete this[account.address];
      // address lowercase
      this[account.address.toLowerCase()].privateKey = null;
      delete this[account.address.toLowerCase()];
      // index
      this[account.index].privateKey = null;
      delete this[account.index];

      this.length--;

      return true;
    }
    return false;

  }

  clear() {
    const _this = this;
    const indexes = this._currentIndexes();

    indexes.forEach(function(index) {
      _this.remove(index);
    });

    return this;
  }

  encrypt(password, options) {
    const _this = this;
    const indexes = this._currentIndexes();

    const accounts = indexes.map(function(index) {
      return _this[index].encrypt(password, options);
    });

    return accounts;
  }

  decrypt(encryptedWallet, password) {
    const _this = this;

    encryptedWallet.forEach(function(keystore) {
      const account = _this._accounts.decrypt(keystore, password);

      if (account) {
        _this.add(account);
      } else {
        throw new Error('Couldn\'t decrypt accounts. Password wrong?');
      }
    });

    return this;
  }

  save(password, keyName) {
    localStorage.setItem(keyName || this.defaultKeyName, JSON.stringify(this.encrypt(password)));

    return true;
  }

  load(password, keyName) {
    let keystore = localStorage.getItem(keyName || this.defaultKeyName);

    if (keystore) {
      try {
        keystore = JSON.parse(keystore);
      } catch (e) {

      }
    }

    return this.decrypt(keystore || [], password);
  }

  _findSafeIndex(pointer) {
    pointer = pointer || 0;
    if (_.has(this, pointer)) {
      return this._findSafeIndex(pointer + 1);
    }
    return pointer;

  }

  _currentIndexes() {
    const keys = Object.keys(this);
    const indexes = keys
      .map(function(key) {
        return parseInt(key);
      })
      .filter(function(n) {
        return (n < 9e20);
      });

    return indexes;
  }
}

if (typeof localStorage === 'undefined') {
  delete Wallet.prototype.save;
  delete Wallet.prototype.load;
}

export {Wallet};
