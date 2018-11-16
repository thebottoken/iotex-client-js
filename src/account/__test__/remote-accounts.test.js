import test from 'ava';
import {Accounts} from '../remote-accounts';
import {Iotx} from '../../iotx';
import {MockProvider} from '../../__test__/mock-provider';
import {TEST_ACCOUNTS, TEST_WALLET_CORE_URL} from '../../__test__/config';

const TEST_WALLET = {
  privateKey: 'c5364b1a2d99d127439be22edfd657889981e9ba4d6d18fe8eca489d48485371efcb2400',
  publicKey: '2726440bc26449be22eb5c0564af4b23dc8c373aa79e8cb0f8df2a9e55b4842dbefcde07d95c1dc1f3d1a367086b4f7742115b53c434e8f5abf116333c2c378c51b0ef6176153602',
  rawAddress: 'io1qyqsyqcy26zujam2gt5cut0ggu8pa4d5q7hnrvsvew32t9',
};

test('Account create', async t => {
  const accounts = new Accounts(null, null, new MockProvider(t, TEST_WALLET_CORE_URL));
  const wallet = await accounts.create();
  t.truthy(wallet.publicKey);
  t.truthy(wallet.privateKey);
  t.truthy(wallet.rawAddress);
});

test('Account add', async t => {
  const accounts = new Accounts(null, null, new MockProvider(t, TEST_WALLET_CORE_URL));
  const wallet = await accounts.add(TEST_WALLET.privateKey);
  t.deepEqual(wallet.publicKey, TEST_WALLET.publicKey);
});

test('Account privateKeyToAccount with subchains', async t => {
  const privKey = TEST_ACCOUNTS[6];
  const mainChain = new Iotx(null, {
    chainId: 1,
    walletProvider: new MockProvider(t, TEST_WALLET_CORE_URL, `${t.title}-mainchain`),
  });
  const mainChainWallet = await mainChain.accounts.privateKeyToAccount(privKey);
  const subChain = new Iotx(null,
    {
      chainId: 2,
      walletProvider: new MockProvider(t, TEST_WALLET_CORE_URL, `${t.title}-subchain`),
    });
  const subChainWallet = await subChain.accounts.privateKeyToAccount(privKey);
  t.not(mainChainWallet.rawAddress, subChainWallet.rawAddress);
});
