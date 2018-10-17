export class Accounts {
  constructor() {

  }

  create(entropy) {

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
