import test from 'ava';
import {RpcMethods} from '../rpc-methods';
import {MockProvider} from './mock-provider';
import {TEST_IOTEX_CORE_URL, TEST_TRANSER_HASH} from './config';

const TEST_WALLET = {
  publicKey: '7226a4340c15e7666098247a82b62275d958f65886d59e4190349fa79508c3682d6b8601584bb36629718838856d01cd75993ce8ad8251509ff15ecb219450abc3990f4a32f13200',
  privateKey: '95b99ad3bcae2667836dd426e7bf491e21d9f0e0c7c040958d26c67cf20e94568ee3a200',
  rawAddress: 'io1qyqsyqcy8fvhk9ee75jkrs6sqwppdplt8lpd87p7k95zpk',
};

test('getBlockchainHeight', async t => {
  const methods = new RpcMethods(new MockProvider(t, TEST_IOTEX_CORE_URL));
  t.truthy(await methods.getBlockchainHeight() > 0);
});

test('getAddressBalance', async t => {
  const methods = new RpcMethods(new MockProvider(t, TEST_IOTEX_CORE_URL));
  const bal = await methods.getAddressBalance(TEST_WALLET.rawAddress);
  t.is(typeof bal, 'string');
});

test('getTransferByID', async t => {
  const methods = new RpcMethods(new MockProvider(t, TEST_IOTEX_CORE_URL));
  const receipt = await methods.getTransferByID(TEST_TRANSER_HASH);
  t.truthy(receipt.ID.length, 64);
});
