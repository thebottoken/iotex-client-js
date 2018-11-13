import test from 'ava';
import {Accounts} from '../remote-accounts';
import {Iotx} from '../../iotx';
import {HttpProvider} from '../../provider';

const TEST_WALLET = {
  privateKey: 'c5364b1a2d99d127439be22edfd657889981e9ba4d6d18fe8eca489d48485371efcb2400',
  publicKey: '2726440bc26449be22eb5c0564af4b23dc8c373aa79e8cb0f8df2a9e55b4842dbefcde07d95c1dc1f3d1a367086b4f7742115b53c434e8f5abf116333c2c378c51b0ef6176153602',
  rawAddress: 'io1qyqsyqcy26zujam2gt5cut0ggu8pa4d5q7hnrvsvew32t9',
};

test('Account create', async t => {
  const accounts = new Accounts();
  const wallet = await accounts.create();
  t.truthy(wallet.publicKey);
  t.truthy(wallet.privateKey);
  t.truthy(wallet.rawAddress);
});

test('Account add', async t => {
  const accounts = new Accounts();
  const wallet = await accounts.add(TEST_WALLET.privateKey);
  t.deepEqual(wallet.publicKey, TEST_WALLET.publicKey);
});

test('Account privateKeyToAccount with subchains', async t => {
  const privKey = '6e21c91382c5e10a5c6568dd38a5a2a6e9800ad86eae41748c8d389a14e0ed127766a200';
  const mainChain = new Iotx(new HttpProvider('http://159.89.221.214:14004/'), {chainId: 1, walletProvider: new HttpProvider('http://localhost:4004/api/wallet-core/')});
  const mainChainWallet = await mainChain.accounts.privateKeyToAccount(privKey);
  const subChain = new Iotx(new HttpProvider('http://localhost:4005/'), {chainId: 2, walletProvider: new HttpProvider('http://localhost:4005/api/wallet-core/')});
  const subChainWallet = await subChain.accounts.privateKeyToAccount(privKey);
  t.not(mainChainWallet.rawAddress, subChainWallet.rawAddress);
});
