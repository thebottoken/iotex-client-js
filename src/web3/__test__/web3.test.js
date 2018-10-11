import test from 'ava';
import {Web3} from '../web3';

test('web3.providers exists', async t => {
  const web3 = new Web3();
  t.truthy(web3.providers);
});
