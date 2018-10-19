import test from 'ava';
import {TEST_ACCOUNT, TEST_PROVIDER_URL, USE_IOTX} from '../test-config';

let Web3 = require('web3');
if (USE_IOTX) {
  Web3 = require('../../../web3');
}

test.skip('transfer 1 token from account A to account B', async t => {
  const web3 = new Web3(new Web3.providers.HttpProvider(TEST_PROVIDER_URL));

  // create account
  const account = web3.eth.accounts.create(['entropy']);
  t.truthy(typeof account.address === 'string', 'account.address is string');
  t.truthy(typeof account.privateKey === 'string', 'account.privateKey is string');
  t.truthy(typeof account.signTransaction === 'function', 'account.signTransaction is function');
  t.truthy(typeof account.sign === 'function', 'account.sign is function');
  t.truthy(typeof account.encrypt === 'function', 'account.encrypt is function');
  const balBefore = await web3.eth.getBalance(account.address);

  // transfer 1 token
  await web3.eth.sendTransaction({to: account.address, from: TEST_ACCOUNT.publicKey, value: web3.utils.toWei(String(1), 'ether')});

  // assert balance
  const balAfter = await web3.eth.getBalance(account.address);
  t.deepEqual(parseInt(balAfter, 10), parseInt(balBefore, 10) + parseInt(web3.utils.toWei(String(1), 'ether'), 10));
});
