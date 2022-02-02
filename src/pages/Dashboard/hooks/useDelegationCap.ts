import { useState, useEffect } from 'react';

import { getEgldLabel, getAccountProvider } from '@elrondnetwork/dapp-core';
import {
  ContractFunction,
  ProxyProvider,
  Address,
  decodeBigNumber,
  Query,
  ChainID
} from '@elrondnetwork/erdjs';
import BigNumber from 'bignumber.js';

import { object, string } from 'yup';
import { network } from 'config';

import getPercentage from '../helpers/getPercentage';
import { nominateValToHex } from '../helpers/nominate';
import transact from '../helpers/transact';

import { useDashboard } from '../provider';
interface ActionDataType {
  amount: string;
}

const useDelegationCap = () => {
  const egldLabel = getEgldLabel();

  const { denominated } = useDashboard();
  const [value, setValue] = useState<string>('');
  const [percentage, setPercentage] = useState<string>('');
  const [total, setTotal] = useState<string>('');

  const getDelegationCap = () => {
    const fetchData = async (): Promise<void> => {
      try {
        const provider = new ProxyProvider(network.gatewayAddress);
        const queryData = (contract: string) =>
          new Query({
            address: new Address(network.delegationContract),
            func: new ContractFunction(contract)
          });

        const [config, stake] = await Promise.all([
          provider.queryContract(queryData('getContractConfig')),
          provider.queryContract(queryData('getTotalActiveStake'))
        ]);

        const [totalStake] = stake.outputUntyped();
        const contractDelegationCapIndex = 2;

        const formatted = {
          stake: denominated(decodeBigNumber(totalStake).toFixed()),
          value: denominated(
            decodeBigNumber(
              config.outputUntyped()[contractDelegationCapIndex]
            ).toFixed()
          )
        };

        setTotal(
          denominated(decodeBigNumber(totalStake).toFixed(), {
            addCommas: false
          })
        );

        setValue(`${formatted.value} ${egldLabel}`);
        setPercentage(
          `${getPercentage(formatted.stake, formatted.value)}% filled`
        );
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();

    return () => setValue('');
  };

  const onSubmit = async ({ amount }: ActionDataType): Promise<void> => {
    try {
      const parameters = {
        signer: getAccountProvider(),
        account: {}
      };
      const payload = {
        args: nominateValToHex(amount.toString()),
        chainId: new ChainID('T'),
        type: 'modifyTotalDelegationCap',
        value: '0'
      };
      await transact(parameters, payload);
    } catch (error) {
      console.error(error);
    }
  };

  const validation = object().shape({
    amount: string()
      .required('Required')
      .test(
        'minimum',
        `Minimum ${total} ${egldLabel} or 0 ${egldLabel}`,
        (amount) =>
          new BigNumber(amount || '').isGreaterThanOrEqualTo(total) ||
          amount === '0'
      )
  });

  useEffect(getDelegationCap, [denominated, egldLabel]);

  return {
    value,
    percentage,
    modal: {
      title: 'Delegation cap',
      button: 'Continue',
      description:
        'The delegation cap is the maximum amount of xEGLD your agency can stake from delegators.',
      onSubmit,
      input: {
        defaultValue: total,
        label: 'Update Delegation Cap',
        validation
      }
    }
  };
};

export default useDelegationCap;
