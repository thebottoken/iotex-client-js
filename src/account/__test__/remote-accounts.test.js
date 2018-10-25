import test from 'ava';
import {Accounts} from '../remote-accounts';

const TEST_WALLET = {
  publicKey: '7226a4340c15e7666098247a82b62275d958f65886d59e4190349fa79508c3682d6b8601584bb36629718838856d01cd75993ce8ad8251509ff15ecb219450abc3990f4a32f13200',
  privateKey: '95b99ad3bcae2667836dd426e7bf491e21d9f0e0c7c040958d26c67cf20e94568ee3a200',
  rawAddress: 'io1qyqsyqcy8fvhk9ee75jkrs6sqwppdplt8lpd87p7k95zpk',
};

test('Account create', async t => {
  const accounts = new Accounts();
  const wallet = await accounts.create();
  t.truthy(wallet.publicKey);
  t.truthy(wallet.privateKey);
  t.truthy(wallet.rawAddress);
});

test('Account privateKeyToAccount', async t => {
  const accounts = new Accounts();
  const wallet = await accounts.privateKeyToAccount(TEST_WALLET.privateKey);
  t.deepEqual(wallet.publicKey, TEST_WALLET.publicKey);
  t.deepEqual(wallet.rawAddress, TEST_WALLET.rawAddress);
});
