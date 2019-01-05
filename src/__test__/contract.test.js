import fs from 'fs';
import test from 'ava';
import solc from 'solc';
import window from 'global/window';
import {Iotx} from '../iotx';
import {MockProvider} from './mock-provider';
import {
  TEST_ACCOUNTS,
  TEST_IOTEX_CORE_URL,
  TEST_ROLL_DICE_CONTRACT_ADDRESS,
  TEST_WALLET_CORE_URL,
} from './config';

function readFile() {
  const solFile = `${__dirname}/RollDice.sol`;
  const input = fs.readFileSync(solFile);
  return input.toString();
}

const timeout = time => new Promise(resolve => window.setTimeout(resolve, time));

async function createTestContract(t, provider, privateKey) {
  const solString = readFile();
  const contractName = ':RollDice';
  const output = solc.compile(solString, 1);
  const abi = JSON.parse(output.contracts[contractName].interface);
  const iotx = new Iotx(provider, {walletProvider: new MockProvider(t, TEST_WALLET_CORE_URL, `${t.title}-wallet`)});
  const wallet = await iotx.accounts.add(privateKey);
  const contract = new iotx.Contract({
    abi,
    contractName,
    contractAddress: TEST_ROLL_DICE_CONTRACT_ADDRESS,
    wallet,
  });
  const bytecode = output.contracts[contractName].bytecode;
  return {contract, bytecode, wallet};
}

test('contract getNextNonce', async t => {
  const {contract, wallet} = await createTestContract(t, new MockProvider(t, TEST_IOTEX_CORE_URL), TEST_ACCOUNTS[0]);
  t.truthy(contract);
  const nonce = await contract._getNextNonce(wallet.rawAddress);
  t.is(typeof nonce, 'number');
});

test('contract deploy', async t => {
  const {contract, bytecode} = await createTestContract(t, new MockProvider(t, TEST_IOTEX_CORE_URL), TEST_ACCOUNTS[0]);
  const exec = await contract.deploy({
    data: bytecode,
    gasLimit: 100000,
    gasPrice: '0',
    version: 1,
    contract: '',
    amount: '1',
  });
  t.is(exec.ID.length, 64);
});

test('contract method call: non-constant', async t => {
  const {contract, wallet} = await createTestContract(t, new MockProvider(t, TEST_IOTEX_CORE_URL), TEST_ACCOUNTS[1]);
  const resp = await contract
    .prepareMethods({
      gasLimit: 100000,
      gasPrice: '0',
      version: 1,
      amount: '0',
    })
    .rollAward('id', wallet.rawAddress);
  t.is(resp.ID.length, 64);
});

test.skip('contract method call: constant', async t => {
  const {contract} = await createTestContract(t, new MockProvider(t, TEST_IOTEX_CORE_URL), TEST_ACCOUNTS[2]);
  const resp = await contract
    .prepareMethods({
      gasLimit: 100000,
      gasPrice: '0',
      version: 1,
      amount: '0',
    })
    .roll('id');
  t.falsy(resp);
});

// eslint-disable-next-line max-statements
test.skip('simple storage deploy and call', async t => {
  const solidityFileString = `
pragma solidity ^0.4.16;

contract SimpleStorage {
   uint storedData;

   function set(uint x) public {
       storedData = x;
   }

   function get() public view returns (uint) {
       return storedData;
   }
}
`;
  const contractName = ':SimpleStorage';
  const output = solc.compile(solidityFileString, 1);
  const abi = JSON.parse(output.contracts[contractName].interface);
  const provider = new MockProvider(t, TEST_IOTEX_CORE_URL);
  const iotx = new Iotx(provider, {walletProvider: new MockProvider(t, TEST_WALLET_CORE_URL, `${t.title}-wallet`)});
  const wallet = await iotx.accounts.add(TEST_ACCOUNTS[3]);
  const bytecode = output.contracts[contractName].bytecode;
  const contract = new iotx.Contract({abi, contractName, wallet});
  const exec = await contract.deploy({
    byteCode: bytecode,
    gasLimit: 1000000,
    gasPrice: '0',
    version: 1,
    contract: '',
    amount: '1',
  });

  await timeout(10000);

  const receipt = await iotx.rpcMethods.getReceiptByExecutionID(exec.ID);
  t.truthy(receipt);

  await contract
    .prepareMethods({
      contractAddress: receipt.contractAddress,
      gasLimit: 100000,
      gasPrice: '0',
      version: 1,
      amount: '0',
    })
    .set(666);

  const value = await contract
    .prepareMethods({
      contractAddress: receipt.contractAddress,
      gasLimit: 100000,
      gasPrice: '0',
      version: 1,
      amount: '0',
    })
    .get();
  t.truthy(value);
});

