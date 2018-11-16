/* eslint-disable max-statements */
import test from 'ava';
import {setTimeout} from 'global/window';
import {Iotx} from '../main';
import {
  TEST_ACCOUNTS,
  TEST_IOTEX_CORE_SUBCHAIN_URL,
  TEST_IOTEX_CORE_URL,
  TEST_WALLET_CORE_URL,
} from './config';
import {MockProvider} from './mock-provider';

const sleep = async time => new Promise(resolve => setTimeout(() => resolve(), time));

function intFromHexLE(str) {
  return parseInt(`0x${String(str).match(/../g).reverse().join('')}`, 16);
}

test('parseIntFromHexLE', async t => {
  t.deepEqual(intFromHexLE('0900000000000000'), 9);
});

test('cross-chain deposit', async t => {
  const privKey = TEST_ACCOUNTS[4];
  const walletProvider = new MockProvider(t, TEST_WALLET_CORE_URL, `${t.title}-wallet`);
  const mainChain = new Iotx(new MockProvider(t, TEST_IOTEX_CORE_URL, `${t.title}-mainchain`), {chainId: 1, walletProvider});
  const mainChainWallet = await mainChain.accounts.privateKeyToAccount(privKey);
  const subChain = new Iotx(new MockProvider(t, TEST_IOTEX_CORE_SUBCHAIN_URL, `${t.title}-subchain`), {chainId: 2, walletProvider});
  const subChainWallet = await subChain.accounts.privateKeyToAccount(privKey);

  const createDeposit = {
    amount: '1',
    sender: mainChainWallet.rawAddress,
    recipient: subChainWallet.rawAddress,
    gasLimit: 1000000,
    gasPrice: '0',
    version: 1,
    senderPubKey: mainChainWallet.publicKey,
  };
  const signedCreateDeposit = await mainChain.accounts.signCreateDeposit(createDeposit, mainChainWallet);
  const {hash} = await mainChain.rpcMethods.createDeposit(signedCreateDeposit);

  await sleep(10000);

  const {returnValue} = await mainChain.rpcMethods.getReceiptByExecutionID(hash);
  const index = intFromHexLE(returnValue);
  const settleDeposit = {
    ...createDeposit,
    index,
  };
  const signedSettleDeposit = await subChain.accounts.signSettleDeposit(settleDeposit, subChainWallet);
  const settled = await subChain.rpcMethods.settleDeposit(signedSettleDeposit);
  t.truthy(settled.hash);
});
