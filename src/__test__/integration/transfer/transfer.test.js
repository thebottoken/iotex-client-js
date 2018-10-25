import test from 'ava';
import {TEST_ACCOUNT, TEST_PROVIDER_URL, USE_IOTX} from '../test-config';

let Web3 = require('web3');
if (USE_IOTX) {
  Web3 = require('../../../web3');
}

test('add wallet', async t => {
  const web3 = new Web3(new Web3.providers.HttpProvider(TEST_PROVIDER_URL));
  web3.eth.accounts.wallet.add(TEST_ACCOUNT.privateKey);
  isAccount(t, web3.eth.accounts.wallet[0]);
  t.deepEqual(web3.eth.accounts.wallet[0].address, TEST_ACCOUNT.address);
  t.deepEqual(web3.eth.accounts.wallet[TEST_ACCOUNT.address].address, TEST_ACCOUNT.address);
});

test.only('transfer 1 token from account A to account B', async t => {
  const web3 = new Web3(new Web3.providers.HttpProvider(TEST_PROVIDER_URL));
  await web3.eth.accounts.wallet.add(TEST_ACCOUNT.privateKey);

  // create account
  const account = await web3.eth.accounts.create(['entropy']);
  isAccount(t, account);

  // transfer 1 token
  await web3.eth.sendTransaction({
    to: account.address,
    from: TEST_ACCOUNT.address,
    value: web3.utils.toWei(String(1), 'ether'),
    gas: 1000000,
  });
  //
  // // assert balance
  // const balAfter = await web3.eth.getBalance(account.address);
  // t.deepEqual(parseInt(balAfter, 10), parseInt(balBefore, 10) + parseInt(web3.utils.toWei(String(1), 'ether'), 10));
});

function isAccount(t, account) {
  t.truthy(typeof account.address === 'string', 'account.address is string');
  t.truthy(typeof account.privateKey === 'string', 'account.privateKey is string');
  t.truthy(typeof account.signTransaction === 'function', 'account.signTransaction is function');
  t.truthy(typeof account.sign === 'function', 'account.sign is function');
  t.truthy(typeof account.encrypt === 'function', 'account.encrypt is function');
}
