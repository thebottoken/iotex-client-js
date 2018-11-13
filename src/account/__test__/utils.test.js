
import test from 'ava';
import {fromRau} from '../utils';

test('fromRau', async t => {
  const rau = '2000000000000000000';
  t.true(fromRau(rau, 'Rau') === '2000000000000000000');
  t.true(fromRau(rau, 'KRau') === '2000000000000000');
  t.true(fromRau(rau, 'MRau') === '2000000000000');
  t.true(fromRau(rau, 'GRau') === '2000000000');
  t.true(fromRau(rau, 'Qev') === '2000000');
  t.true(fromRau(rau, 'Jing') === '2000');
  t.true(fromRau(rau, 'Iotx') === '2');
});
