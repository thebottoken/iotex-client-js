
import test from 'ava';
import {fromRau} from '../utils';

test('fromRau', async t => {
  const rau = '2002000000000000000';
  t.true(fromRau(rau, 'Rau') === '2002000000000000000');
  t.true(fromRau(rau, 'KRau') === '2002000000000000');
  t.true(fromRau(rau, 'MRau') === '2002000000000');
  t.true(fromRau(rau, 'GRau') === '2002000000');
  t.true(fromRau(rau, 'Qev') === '2002000');
  t.true(fromRau(rau, 'Jing') === '2002');
  t.true(fromRau(rau, 'Iotx') === '2.002');
});
