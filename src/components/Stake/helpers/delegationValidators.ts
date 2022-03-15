import { nominate } from '@elrondnetwork/dapp-core';

import BigNumber from 'bignumber.js';
import { string } from 'yup';
import { network, denomination } from 'config';
import { denominated } from 'helpers/denominate';

const undelegateValidator = (input: string) =>
  string()
    .required('Required')
    .test('minimum', 'Value must be greater than zero.', (value = '0') =>
      new BigNumber(nominate(value, denomination)).isGreaterThanOrEqualTo(1)
    )
    .test(
      'maximum',
      `You need to set a value under ${denominated(input)} ${
        network.egldLabel
      }.`,
      (value = '0') =>
        new BigNumber(nominate(value, denomination)).isLessThanOrEqualTo(input)
    );

const delegateValidator = (input: string, limit: string) =>
  undelegateValidator(input).test(
    'uncapable',
    `Max delegation cap reached. That is the maximum amount you can delegate: ${denominated(
      limit
    )} ${network.egldLabel}`,
    (value = '0') =>
      new BigNumber(nominate(value, denomination)).isLessThanOrEqualTo(limit)
  );

export { delegateValidator, undelegateValidator };
