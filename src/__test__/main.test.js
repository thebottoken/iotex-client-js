import test from 'ava';
import {IotexClient} from '../iotex-client';

test('IotexClient.getNextNonce', async t => {
  const mockProvider = {
    async send(request) {
      t.deepEqual(request, {method: 'JsonRpc.getAddressId', params: [{id: {id: 'id'}}]});
    },
  };

  const client = new IotexClient({
    provider: mockProvider,
    solFile: './src/__test__/RollDice.sol',
    contractName: ':RollDice',
    contractAddress: 'io1qyqsyqcy9lplv3cunf345e42lw77sa93p0qvlyl8eqctsq',
    wallet: {
      publicKey: '327ff28d33245f9921d8ab4311496ae1298dc14a0a0babdb7a6031e7bc180330577c9507e740ee30ecc5b73f0c058d2ed9b580cf7530ddddc71f644838828655e451e0c3108de102',
      privateKey: '1bafc0a6f9f1e939ba4b180b9bd456cd143d9806cf9046eaaaba01e78ec265524669ad00',
      rawAddress: 'io1qyqsyqcygcadnchez8yqjuh0v5zuujuf0kcna3yg7altvn',
    },
  });
  t.truthy(client);
  await client.getNextNonce({id: 'id'});
});
