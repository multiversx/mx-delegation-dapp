import { getEgldLabel } from '@elrondnetwork/dapp-core';
import BigNumber from 'bignumber.js';
import { string } from 'yup';

const handleValidation = (input: string) =>
  string()
    .required('Required')
    .test('minimum', 'Value must be greater than or equal to 1.', (value) =>
      new BigNumber(value || '').isGreaterThanOrEqualTo(1)
    )
    .test(
      'maximum',
      `You need to set a value under ${input} ${getEgldLabel()}.`,
      (value) =>
        new BigNumber(value || '').isLessThanOrEqualTo(parseFloat(input))
    );

export { handleValidation };
