import { ChangeEvent } from 'react';
import BigNumber from 'bignumber.js';
import { FormikProps } from 'formik';

import { filterTextToFloat } from './filterTextToFloat';
import { ActionDataType } from '../ChangeServiceFee';

export const onAmountInputChange =
  (setFieldValue: FormikProps<ActionDataType>['setFieldValue']) =>
  (event: ChangeEvent<HTMLInputElement>) => {
    const maxAmountInputLength = 5;
    const filteredValue = filterTextToFloat(event.target.value);
    const bigNumberValue = new BigNumber(filteredValue);

    const slicedAmount = filteredValue.slice(0, maxAmountInputLength);
    const trimmedAmount = Number(slicedAmount).toLocaleString(undefined, {
      maximumFractionDigits: 2
    });

    const currentAmount =
      slicedAmount.length >= maxAmountInputLength - 1
        ? trimmedAmount
        : slicedAmount;

    const minimumAmount = new BigNumber(event.target.min);
    const maximumAmount = new BigNumber(event.target.max);

    const isInRange =
      minimumAmount.isLessThanOrEqualTo(bigNumberValue) &&
      maximumAmount.isGreaterThanOrEqualTo(bigNumberValue);

    if (isInRange || !filteredValue) {
      setFieldValue('amountInput', currentAmount);
      setFieldValue('amountRange', currentAmount || '0');
    }
  };
