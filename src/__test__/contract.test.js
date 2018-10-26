import fs from 'fs';
import test from 'ava';
import solc from 'solc';
import {Iotx} from '../iotx';
import {HttpProvider} from '../provider';

async function createTestContract(provider) {
  const solFile = `${__dirname}/RollDice.sol`;
  const contractName = ':RollDice';
  const input = fs.readFileSync(solFile);
  const output = solc.compile(input.toString(), 1);
  const abi = JSON.parse(output.contracts[contractName].interface);
  const iotx = new Iotx(provider);
  const wallet = await iotx.accounts.add('62d8dd889f14f4058b8926041d095c4230f973fe60c8e54c35e5fb57c3a5596225488101');
  const contract = new iotx.Contract({
    abi,
    contractName: ':RollDice',
    contractAddress: 'io1qyqsyqcy8zn8qths2qajddca0p0umhtfhgj0uqfgfwzvk0',
    gasLimit: 1,
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

test.skip('contract deploy', async t => {
  const {contract, bytecode} = await createTestContract(new HttpProvider('http://localhost:14004/'));
  const hash = await contract.deploy({byteCode: bytecode, gasLimit: 1, gasPrice: '1', version: 1, contract: '', amount: '1'});
  t.is(hash.length, 64);
});

test.skip('contract method call', async t => {
  const {contract, wallet} = await createTestContract(new HttpProvider('http://localhost:14004/'));
  const hash = await contract.methods.rollAward('id', wallet.rawAddress);
  t.is(hash.length, 64);
});

