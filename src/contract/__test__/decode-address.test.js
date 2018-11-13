import test from 'ava';
import bech32 from 'bech32';
import {decodeAddress, chainIdFromWords} from '../decode-address';

test('decodeAddress', async t => {
  const pack = decodeAddress('io1qyqsqqqq4gyvckxj2mjnf58fdykwelzvxeq6xahnlc3zdz');
  t.falsy(pack.error, 'no error');
  t.is(pack.address, 'aa08cc58d256e534d0e9692cecfc4c3641a376f3');
  t.is(pack.chainId, 1);
});

test('getChainId', async t => {
  [{
    address: 'io1qyqsqqqq4gyvckxj2mjnf58fdykwelzvxeq6xahnlc3zdz',
    expectedChainId: 1,
  }, {
    address: 'io1qypqqqqqnruv7fnc0tdtuna5pgy367ad0zn65yp3ymhle7',
    expectedChainId: 2,
  }].map(tt => {
    const {words} = bech32.decode(tt.address);
    const chainId = chainIdFromWords(words);
    t.deepEqual(chainId, tt.expectedChainId);
  });
});
