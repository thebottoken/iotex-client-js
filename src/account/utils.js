// @flow

import {BN} from 'bn.js';

/**
 * fromRau is a function to convert Rau to Iotx.
 * @param rau number of Rau in string
 * @param unit unit converts to
 * @returns number of unit
 */
export function fromRau(rau: string, unit: string): string {
  const rauBN = new BN(rau);
  switch (unit) {
  case 'Rau':
    return rau;
  case 'KRau':
    return rauBN.div(new BN('1000')).toString();
  case 'MRau':
    return rauBN.div(new BN('1000000')).toString();
  case 'GRau':
    return rauBN.div(new BN('1000000000')).toString();
  case 'Qev':
    return rauBN.div(new BN('1000000000000')).toString();
  case 'Jing':
    return rauBN.div(new BN('1000000000000000')).toString();
  default:
    return rauBN.div(new BN('1000000000000000000')).toString();
  }
}
