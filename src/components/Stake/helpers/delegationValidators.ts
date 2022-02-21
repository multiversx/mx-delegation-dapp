import BigNumber from 'bignumber.js';
import { string } from 'yup';
import { network } from 'config';

const undelegateValidator = (input: string) =>
  string()
    .required('Required')
    .test('minimum', 'Value must be greater than or equal to 1.', (value) =>
      new BigNumber(value || '').isGreaterThanOrEqualTo(1)
    )
    .test(
      'maximum',
      `You need to set a value under ${input} ${network.egldLabel}.`,
      (value) =>
        new BigNumber(value || '').isLessThanOrEqualTo(parseFloat(input))
    );

const delegateValidator = (input: string, limit: any) =>
  undelegateValidator(input).test(
    'uncapable',
    'Max delegation cap reached. That is the maximum amount you can delegate.',
    (value) => {
      if (Number.isNaN(parseFloat(limit.available))) {
        return true;
      }

      return (
        limit.exceeds &&
        new BigNumber(value || '').isLessThanOrEqualTo(
          parseFloat(limit.available)
        )
      );
    }
  );

export { delegateValidator, undelegateValidator };
