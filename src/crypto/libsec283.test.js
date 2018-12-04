import test from 'ava';
import crypto from 'crypto-js';
import {
  binaryCurve_K283, ECDSASignMsg,
  ECDSAVerifyMsg,
  ecKeyPairGeneration,
  ecPublicKeyValidation,
  rbg128Instantiate,
  uint32ArraytoBitArray,
} from './libsect283';

const LOOP_COUNT = 200;

function browserEntropy128Bits() {
  const ui32Array = crypto.lib.WordArray.random(16);
  return uint32ArraytoBitArray(ui32Array.words);
}

test('ecKeyPairGeneration', async t => {
  for (let i = 0; i < LOOP_COUNT; i++) {
    const entropy = browserEntropy128Bits();
    const state = {};
    rbg128Instantiate(state, entropy);
    const keypair = ecKeyPairGeneration(state, binaryCurve_K283);
    t.truthy(ecPublicKeyValidation(keypair.Q, binaryCurve_K283));
  }
});

test('ECDSAVerifyMsg', async t => {
  for (let i = 0; i < LOOP_COUNT; i++) {
    const entropy = browserEntropy128Bits();
    const state = {};
    rbg128Instantiate(state, entropy);
    const keypair = ecKeyPairGeneration(state, binaryCurve_K283);
    const pkx = keypair.Q.x;
    const pky = keypair.Q.y;
    const msg = '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';
    const sig = ECDSASignMsg(state, binaryCurve_K283, keypair.d, msg);
    const Ql = {x: pkx, y: pky, z: [1]};
    t.truthy(ECDSAVerifyMsg(binaryCurve_K283, Ql, msg, sig));
  }
});
