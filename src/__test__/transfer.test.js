import test from 'ava';
import {Iotx} from '../iotx';
import {HttpProvider} from '../provider';

const TEST_WALLET = {
  privateKey: 'c5364b1a2d99d127439be22edfd657889981e9ba4d6d18fe8eca489d48485371efcb2400',
  publicKey: '2726440bc26449be22eb5c0564af4b23dc8c373aa79e8cb0f8df2a9e55b4842dbefcde07d95c1dc1f3d1a367086b4f7742115b53c434e8f5abf116333c2c378c51b0ef6176153602',
  rawAddress: 'io1qyqsqqqq26zujam2gt5cut0ggu8pa4d5q7hnrvsvace4x6',
};

test.skip('transfer 1 token from account A to account B', async t => {
  const iotx = new Iotx(new HttpProvider('http://localhost:14004/'));
  await iotx.accounts.add(TEST_WALLET.privateKey);
  const acctB = await iotx.accounts.create();
  const receipt = await iotx.sendTransfer({
    amount: '1',
    sender: TEST_WALLET.rawAddress,
    senderPubKey: TEST_WALLET.publicKey,
    recipient: acctB.rawAddress,
    gasPrice: '1',
    gasLimit: 1,
  });
  t.truthy(receipt.ID.length, 64);
});
