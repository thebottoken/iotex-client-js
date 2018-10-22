const utils = require('web3-utils');
const _ = require('underscore');

const RAW_ADDRESS_LENGTH = 49;
const RAW_ADDRESS_REGEX = /^io[A-Za-z0-9]+$/;

function isAddress(address) {
  return !(!address || address.length !== RAW_ADDRESS_LENGTH || !address.match(RAW_ADDRESS_REGEX));
}

function inputAddressFormatter(address) {
  if (!isAddress(address)) {
    throw new Error(`Provided address "${address}" is invalid.`);
  }
  return address;
}

function inputTransactionFormatter(options) {
  options = _txInputFormatter(options);

  // check from, only if not number, or object
  if (!_.isNumber(options.from) && !_.isObject(options.from)) {
    options.from = options.from || (this ? this.defaultAccount : null);

    if (!options.from && !_.isNumber(options.from)) {
      throw new Error('The send transactions "from" field must be defined!');
    }

    options.from = inputAddressFormatter(options.from);
  }

  return options;
}

function _txInputFormatter(options) {

  if (options.to) { // it might be contract creation
    options.to = inputAddressFormatter(options.to);
  }

  if (options.data && options.input) {
    throw new Error('You can\'t have "data" and "input" as properties of transactions at the same time, please use either "data" or "input" instead.');
  }

  if (!options.data && options.input) {
    options.data = options.input;
    delete options.input;
  }

  if (options.data && !utils.isHex(options.data)) {
    throw new Error('The data field must be HEX encoded data.');
  }

  // allow both
  if (options.gas || options.gasLimit) {
    options.gas = options.gas || options.gasLimit;
  }

  ['gasPrice', 'gas', 'value', 'nonce'].filter(function (key) {
    return options[key] !== undefined;
  }).forEach(function (key) {
    options[key] = utils.numberToHex(options[key]);
  });

  return options;
}

function inputCallFormatter(options) {

  options = _txInputFormatter(options);

  var from = options.from || (this ? this.defaultAccount : null);

  if (from) {
    options.from = inputAddressFormatter(from);
  }

  return options;
}

module.exports = {
  isAddress,

  // formatter
  inputAddressFormatter,
  inputTransactionFormatter,
  inputCallFormatter,
};
