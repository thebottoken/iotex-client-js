import fs from 'fs';
import test from 'ava';
import solc from 'solc';
import window from 'global/window';
import {Iotx} from '../iotx';
import {HttpProvider} from '../provider';

function readFile() {
  const solFile = `${__dirname}/RollDice.sol`;
  const input = fs.readFileSync(solFile);
  return input.toString();
}

const timeout = time => new Promise(resolve => window.setTimeout(resolve, time));

async function createTestContract(provider) {
  const solString = readFile();
  const contractName = ':RollDice';
  const output = solc.compile(solString, 1);
  const abi = JSON.parse(output.contracts[contractName].interface);
  const iotx = new Iotx(provider);
  const wallet = await iotx.accounts.add('c5364b1a2d99d127439be22edfd657889981e9ba4d6d18fe8eca489d48485371efcb2400');
  const contract = new iotx.Contract({
    abi,
    contractName,
    contractAddress: 'io1qyqsqqqqrusm43yhetcd8jgk4rr3nty5v4aa87yx8l0ech',
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
  const {contract} = await createTestContract(mockProvider);
  t.truthy(contract);
  const nonce = await contract._getNextNonce('id');
  t.is(nonce, pendingNonce);
});

test('contract deploy', async t => {
  const {contract, bytecode} = await createTestContract(new HttpProvider('http://localhost:14004/'));
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

test.skip('contract method call: non-constant', async t => {
  const {contract, wallet} = await createTestContract(new HttpProvider('http://localhost:14004/'));
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
  const {contract} = await createTestContract(new HttpProvider('http://localhost:14004/'));
  const resp = await contract
    .prepareMethods({
      gasLimit: 100000,
      gasPrice: '0',
      version: 1,
      amount: '0',
    })
    .roll('id');
  t.is(resp.ID.length, 64);
});

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
  const wallet = await iotx.accounts.add('c5364b1a2d99d127439be22edfd657889981e9ba4d6d18fe8eca489d48485371efcb2400');
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

