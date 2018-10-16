import fs from 'fs';
import path from 'path';
import test from 'ava';
import solc from 'solc';
import {IotexClient} from '../../iotex-client';
import {JsonRpcProvider} from '../../provider';

test('IotexClient.getReceiptByExecutionId', async t => {
  const solFile = './src/__test__/integration/CodeNameCollector.sol';
  const contractName = ':CodeNameCollector';
  const input = fs.readFileSync(path.resolve(solFile));
  const output = solc.compile(input.toString(), 1);
  const abi = JSON.parse(output.contracts[contractName].interface);
  const client = new IotexClient({
    provider: new JsonRpcProvider({url: 'https://iotexscan.io/api/json-rpc/'}),
    abi,
    contractName: ':CodeNameCollector',
    contractAddress: 'io1qyqsyqcymlsuqpam532tmch60n0hz8g57fsvxqjsg3m6ax',
    wallet: {
      publicKey: '327ff28d33245f9921d8ab4311496ae1298dc14a0a0babdb7a6031e7bc180330577c9507e740ee30ecc5b73f0c058d2ed9b580cf7530ddddc71f644838828655e451e0c3108de102',
      privateKey: '1bafc0a6f9f1e939ba4b180b9bd456cd143d9806cf9046eaaaba01e78ec265524669ad00',
      rawAddress: 'io1qyqsyqcygcadnchez8yqjuh0v5zuujuf0kcna3yg7altvn',
    },
  });
  t.truthy(client);
  const receipt = await client.getReceiptByExecutionId('a0cbbb468e3930dd597987813e5e6744dd680d81a63fb58fbd88fd035b02ceed');
  t.is(receipt.logs[0].address, 'io1qyqsyqcymlsuqpam532tmch60n0hz8g57fsvxqjsg3m6ax');
});
