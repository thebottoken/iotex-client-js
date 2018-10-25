import _ from "underscore";

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

  async add(account) {
    if (_.isString(account)) {
      account = await this._accounts.privateKeyToAccount(account);
    }
    if (!this[account.address]) {
      account = await this._accounts.privateKeyToAccount(account.privateKey);
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
