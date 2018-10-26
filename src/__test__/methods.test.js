import test from 'ava';
import {Methods} from '../methods';

const TEST_WALLET = {
  publicKey: '7226a4340c15e7666098247a82b62275d958f65886d59e4190349fa79508c3682d6b8601584bb36629718838856d01cd75993ce8ad8251509ff15ecb219450abc3990f4a32f13200',
  privateKey: '95b99ad3bcae2667836dd426e7bf491e21d9f0e0c7c040958d26c67cf20e94568ee3a200',
  rawAddress: 'io1qyqsyqcy8fvhk9ee75jkrs6sqwppdplt8lpd87p7k95zpk',
};

test('getBlockchainHeight', async t => {
  const methods = new Methods();
  t.truthy(await methods.getBlockchainHeight() > 0);
});

test('getAddressBalance', async t => {
  const methods = new Methods();
  try {
    await methods.getAddressBalance(TEST_WALLET.rawAddress);
  } catch (e) {
    t.truthy(e);
  }
});

test('getTransferByID', async t => {
  const methods = new Methods(createMockProvider());
  const receipt = await methods.getTransferByID('f244f2341620a9e3440c2c67b8d0f4d250d53101977e214dbe64a591ae4c93a1');
  t.truthy(receipt.ID.length, 64);
});

function createMockProvider() {
  return {
    async send() {
      return {
        result: {
          version: 0,
          ID: 'f244f2341620a9e3440c2c67b8d0f4d250d53101977e214dbe64a591ae4c93a1',
          nonce: 13202,
          sender: 'io1qyqsyqcy222ggazmccgf7dsx9m9vfqtadw82ygwhjnxtmx',
          recipient: 'io1qyqsyqcycl6xy302xpsgqerxzhhe0t6xxs32nk5nn6x2a9',
          amount: 9,
          senderPubKey: '',
          signature: '',
          payload: '',
          isCoinbase: false,
          fee: 0,
          timestamp: 1540536369,
          blockID: 'e61aef24ad1fff93abe937dca49534bfcdef0ca24534a3dc9d74d5af235bc19d',
          isPending: false,
        },
      };
    },
  };
}
