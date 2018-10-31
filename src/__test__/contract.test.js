import fs from 'fs';
import test from 'ava';
import solc from 'solc';
import window from 'global/window';
import {Iotx} from '../iotx';
import {HttpProvider} from '../provider';

const TEST_PRIV = [
  'ededa5274f44b4075dcabfe4d1aaa4f7f50ca21bc1f4c5a676dd11727d21b344c575a401',
  'ff76e4c982db615c18ca26f56cc292659ec34ff4d4b747a4602ff396850eeb4fd58fb201',
  '7edbd3db9fa24a3da7dcb423d807ac898fc951680e4d5ee2e741755ac777723332545a00',
  '2a25f5acb666e018155b0ab39422b4f783e3324edbe74dc385f8d11d3edce580c0eee100',
  'aa27f59ea469252cc8106c4dfc909c81bfd2704569f8ed5a18bf4a6b9045dc0505a6d401',
];

function readFile() {
  const solFile = `${__dirname}/RollDice.sol`;
  const input = fs.readFileSync(solFile);
  return input.toString();
}

const timeout = time => new Promise(resolve => window.setTimeout(resolve, time));

async function createTestContract(provider, privateKey) {
  const solString = readFile();
  const contractName = ':RollDice';
  const output = solc.compile(solString, 1);
  const abi = JSON.parse(output.contracts[contractName].interface);
  const iotx = new Iotx(provider);
  const wallet = await iotx.accounts.add(privateKey);
  const contract = new iotx.Contract({
    abi,
    contractName,
    contractAddress: 'io1qyqsqqqqpqcq0s2x4lcmyguerwzffplq3jmtzauj3ffx6r',
    wallet,
  });
  const bytecode = output.contracts[contractName].bytecode;
  return {contract, bytecode, wallet};
}

test('contract getNextNonce', async t => {
  const pendingNonce = 12;
  const mockProvider = {
    async send(request) {
      t.deepEqual(request, {method: 'Explorer.getAddressDetails', params: ['id']});
      return {
        result: {pendingNonce},
      };
    },
  };
  const {contract} = await createTestContract(mockProvider, TEST_PRIV[4]);
  t.truthy(contract);
  const nonce = await contract._getNextNonce('id');
  t.is(nonce, pendingNonce);
});

test('contract deploy', async t => {
  const {contract, bytecode} = await createTestContract(new HttpProvider('http://localhost:14004/'), TEST_PRIV[0]);
  const exec = await contract.deploy({
    byteCode: bytecode,
    gasLimit: 100000,
    gasPrice: '0',
    version: 1,
    contract: '',
    amount: '1',
  });
  t.is(exec.ID.length, 64);
});

test('contract method call: non-constant', async t => {
  const {contract, wallet} = await createTestContract(new HttpProvider('http://localhost:14004/'), TEST_PRIV[1]);
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

test('contract method call: constant', async t => {
  const {contract} = await createTestContract(new HttpProvider('http://localhost:14004/'), TEST_PRIV[2]);
  const resp = await contract
    .prepareMethods({
      gasLimit: 100000,
      gasPrice: '0',
      version: 1,
      amount: '0',
    })
    .roll('id');
  // TODO(tian): why is this empty?
  t.falsy(resp);
});

// eslint-disable-next-line max-statements
test.skip('simple storage deploy and call', async t => {
  const solidityFileString = `
pragma solidity ^0.4.0;

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
  const provider = new HttpProvider('http://localhost:14004/');
  const iotx = new Iotx(provider);
  const wallet = await iotx.accounts.add(TEST_PRIV[3]);
  const bytecode = output.contracts[contractName].bytecode;
  const contract = new iotx.Contract({abi, contractName, wallet});
  const exec = await contract.deploy({
    byteCode: bytecode,
    gasLimit: 100000,
    gasPrice: '0',
    version: 1,
    contract: '',
    amount: '1',
  });

  await timeout(5000);

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

