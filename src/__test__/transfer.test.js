/* eslint-disable max-statements */
import test from 'ava';
import {Iotx} from '../iotx';
import {MockProvider} from './mock-provider';
import {TEST_ACCOUNTS, TEST_IOTEX_CORE_URL, TEST_WALLET_CORE_URL} from './config';

test('transfer 1 token from account A to account B', async t => {
  const iotx = new Iotx(new MockProvider(t, TEST_IOTEX_CORE_URL), {walletProvider: new MockProvider(t, TEST_WALLET_CORE_URL, `${t.title}-wallet`)});
  const wallet = await iotx.accounts.add(TEST_ACCOUNTS[5]);
  const acctB = await iotx.accounts.create();
  const receipt = await iotx.sendTransfer({
    amount: '1',
    sender: wallet.rawAddress,
    senderPubKey: wallet.publicKey,
    recipient: acctB.rawAddress,
    gasPrice: '1',
    gasLimit: 10000,
  });
  t.falsy(receipt.version);
  t.truthy(receipt.ID);
  t.truthy(receipt.nonce);
  t.truthy(receipt.sender);
  t.truthy(receipt.amount);
  t.falsy(receipt.senderPubKey);
  t.falsy(receipt.signature);
  t.falsy(receipt.payload);
  t.truthy(receipt.gasLimit);
  t.truthy(receipt.gasPrice);
  t.falsy(receipt.isCoinbase);
  t.falsy(receipt.fee);
  t.falsy(receipt.timestamp);
  t.falsy(receipt.blockID);
  t.true(receipt.isPending);
});
