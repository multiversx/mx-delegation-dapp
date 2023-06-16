import { ChangeEvent } from 'react';
import { FormikProps } from 'formik';

import { ActionDataType } from '../ChangeServiceFee';

export const onAmountRangeChange =
  (setFieldValue: FormikProps<ActionDataType>['setFieldValue']) =>
  (event: ChangeEvent<HTMLInputElement>) => {
    setFieldValue('amountInput', event.target.value);
    setFieldValue('amountRange', event.target.value);
  };
