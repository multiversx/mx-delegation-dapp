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

const delegateValidator = (input: string) =>
  string()
    .required('Required')
    .test('minimum', 'Value must be greater than zero.', (value = '0') =>
      new BigNumber(nominate(value, denomination)).isGreaterThanOrEqualTo(1)
    )
    .test(
      'minimum',
      `Minimum stake is ${denominate({ input: input || 0 })} RISA.`,
      (value = '0') =>
        new BigNumber(nominate(value, denomination)).isGreaterThanOrEqualTo(
          input
        )
    );

export { delegateValidator, undelegateValidator };
