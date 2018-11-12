import test from 'ava';
import {setTimeout} from 'global/window';
import {HttpProvider, Iotx} from '../main';

const sleep = async time => new Promise(resolve => setTimeout(() => resolve(), time));

function intFromHexLE(str) {
  return parseInt(`0x${String(str).match(/../g).reverse().join('')}`, 16);
}

test('parseIntFromHexLE', async t => {
  t.deepEqual(intFromHexLE('0900000000000000'), 9);
});

test('cross-chain deposit', async t => {
  const privKey = '6e21c91382c5e10a5c6568dd38a5a2a6e9800ad86eae41748c8d389a14e0ed127766a200';
  const mainChain = new Iotx(new HttpProvider('http://159.89.221.214:14004/'), {chainId: 1});
  const mainChainWallet = await mainChain.accounts.privateKeyToAccount(privKey);
  const subChain = new Iotx(new HttpProvider('http://159.89.221.214:14005/'), {chainId: 2});
  const subChainWallet = await subChain.accounts.privateKeyToAccount(privKey); // 地址不对

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
