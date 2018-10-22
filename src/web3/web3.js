import utils from 'web3-utils';
import {version} from '../../package.json';
import core from './core';
import {Iotx} from './iotx';
import {Net} from './net';
import {Personal} from './personal';

class Web3 {
  version = version;
  modules = {
    Iotx,
    Net,
    Personal,
  };
  utils = utils;

  constructor() {
    // sets _requestmanager etc
    core.packageInit(this, arguments);

    this.iotx = new Iotx(this);
    this.eth = this.iotx;

    // overwrite package setProvider
    const setProvider = this.setProvider;
    this.setProvider = (provider, net) => {
      setProvider.apply(this, arguments);

      this.iotx.setProvider(provider, net);

      return true;
    };
  }
}

core.addProviders(Web3);

export {Web3};
