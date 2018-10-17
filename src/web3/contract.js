import core from 'web3-core';

export class Contract {
  constructor(jsonInterface, address, options) {

  }

  setProvider(provider, accounts) {
    // Contract.currentProvider = provider;
    core.packageInit(this, [provider]);

    this._accounts = accounts;
  }

  deploy(options, callback) {

  }

  clone() {
    return new this.constructor(this.options.jsonInterface, this.options.address, this.options);
  }

  once() {
    throw new Error('once not implemented');
  }

  getPastEvents() {

  }
}
