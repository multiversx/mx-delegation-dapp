import {
  calculateFeeLimit,
  formatAmount,
  nominate,
  getUsdValue
} from '@multiversx/sdk-dapp/utils/operations';

import BigNumber from 'bignumber.js';
import { string } from 'yup';
import { network, denomination } from '/src/config';
import { denominate } from '/src/helpers/denominate';

const undelegateValidator = (input: string) =>
  string()
    .required('Required')
    .test('minimum', 'Value must be greater than zero.', (value = '0') =>
      parseInt(value) >= 1
    )
    .test('maximum', 'Value must be less than or equal to 100.', (value = '101') =>
      parseInt(value) <= 100
    )

export { undelegateValidator };
