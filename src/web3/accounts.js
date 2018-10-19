/* eslint-disable consistent-this */
export class Accounts {
  constructor() {

  }

  create(entropy) {
    const account = {
      privateKey: '27e008b54db5cee770990869fd909bb55bf33cc0b7642c6d58c0d9903fc765165ac03700',
      publicKey: 'ffad9a4d174871d7ee3f1db4a550b56e42cf05368a4ac0d88f65af18d67ca6640ccc0203588d2b80fca93b7b7f41bdfa40aded4992be11959588c6c761d8ed6eb120c023316f4c05',
      address: 'io1qyqsyqcydt6emvd3rcpj5xldpztyxrtp9q7jm5a9vtkazn',
    };
    return this._addAccountFunctions(account);
  }

  privateKeyToAccount(privateKey) {

  }

  signTransaction(tx, privateKey, callback) {

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
  constructor() {

  }

  create(numberOfAccounts, entropy) {

  }

  add(account) {

  }

  remove(addressOrIndex) {

  }

  clear() {

  }

  encrypt(password, options) {

  }

  decrypt(encryptedWallet, password) {

  }

  save(password, keyName) {

  }

  load(password, keyName) {

  }
}

if (typeof localStorage === 'undefined') {
  delete Wallet.prototype.save;
  delete Wallet.prototype.load;
}

export {Wallet};
