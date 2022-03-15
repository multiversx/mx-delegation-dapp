import BigNumber from 'bignumber.js';
import { string } from 'yup';
import { network } from '/src/config';

const undelegateValidator = (input: string) =>
  string()
    .required('Required')
    .test(
      'minimum',
      'Value must be greater than or equal to 1.',
      (value = '0') => new BigNumber(value).isGreaterThanOrEqualTo(1)
    )
    .test(
      'maximum',
      `You need to set a value under ${input} ${network.egldLabel}.`,
      (value = '0') => parseFloat(value) <= parseFloat(input)
    );

const delegateValidator = (input: string, limit: string) =>
  undelegateValidator(input).test(
    'uncapable',
    `Max delegation cap reached. That is the maximum amount you can delegate: ${limit} ${network.egldLabel}`,
    (value = '0') => parseFloat(value) <= parseFloat(limit)
  );

export { delegateValidator, undelegateValidator };
