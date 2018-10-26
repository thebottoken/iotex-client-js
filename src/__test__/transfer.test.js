import test from 'ava';
import {Iotx} from '../iotx';
import {HttpProvider} from '../provider';

const TEST_WALLET = {
  privateKey: '1bafc0a6f9f1e939ba4b180b9bd456cd143d9806cf9046eaaaba01e78ec265524669ad00',
  publicKey: '327ff28d33245f9921d8ab4311496ae1298dc14a0a0babdb7a6031e7bc180330577c9507e740ee30ecc5b73f0c058d2ed9b580cf7530ddddc71f644838828655e451e0c3108de102',
  rawAddress: 'io1qyqsyqcygcadnchez8yqjuh0v5zuujuf0kcna3yg7altvn',
};

test.skip('transfer 1 token from account A to account B', async t => {
  const iotx = new Iotx(new HttpProvider('http://localhost:14004/'));
  await iotx.accounts.add(TEST_WALLET.privateKey);
  const acctB = await iotx.accounts.create();
  const hash = await iotx.sendTransfer({
    version: 0,
    amount: 1,
    sender: TEST_WALLET.rawAddress,
    recipient: acctB.rawAddress,
    // payload: string,
    // isCoinbase: boolean,
  });
  t.truthy(hash);
});
