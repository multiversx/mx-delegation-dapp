import { useState, useEffect } from 'react';

import { useGetAccountInfo } from '@elrondnetwork/dapp-core';

import BigNumber from 'bignumber.js';

import { useGlobalContext } from 'context';
import { denominated } from 'helpers/denominate';

interface UnstakeableType {
  exceeds: boolean;
  active: boolean;
  available: string;
}

const useClient = () => {
  const { account, address } = useGetAccountInfo();
  const { totalActiveStake, contractDetails } = useGlobalContext();

  const [unstakeable, setUnstakeable] = useState<UnstakeableType>({
    active: false,
    exceeds: false,
    available: ''
  });

  const getClientData = () => {
    if (contractDetails.data && totalActiveStake.data) {
      const automaticActivation = contractDetails.data.automaticActivation;
      const delegationCap = contractDetails.data.delegationCap;
      const balance = new BigNumber(
        denominated(account.balance, {
          showLastNonZeroDecimal: true,
          addCommas: false
        })
      );

      const formatted = {
        total: denominated(totalActiveStake.data.replace(/,/g, '')),
        cap: denominated(delegationCap.replace(/,/g, ''))
      };

      const available = new BigNumber(formatted.cap).minus(
        new BigNumber(formatted.total)
      );

      setUnstakeable({
        available: available.toFixed(),
        exceeds:
          balance.comparedTo(available) >= 0 && automaticActivation === 'ON',
        active:
          new BigNumber(totalActiveStake.data).isGreaterThanOrEqualTo(
            new BigNumber(delegationCap)
          ) && delegationCap !== '0'
      });

      return () => {
        setUnstakeable({
          active: false,
          exceeds: false,
          available: ''
        });
      };
    }
  };

  useEffect(getClientData, [
    address,
    totalActiveStake.data,
    contractDetails.data,
    account.balance
  ]);

  return {
    unstakeable
  };
};

export default useClient;
