import { MouseEvent } from 'react';
import { FormikProps } from 'formik';

import { ActionDataType } from '../ChangeServiceFee';

export const onBreakpointClick =
  (
    breakpoint: number,
    setFieldValue: FormikProps<ActionDataType>['setFieldValue']
  ) =>
  (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setFieldValue('amountInput', Number(breakpoint));
    setFieldValue('amountRange', breakpoint);
  };
