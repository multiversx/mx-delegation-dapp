import { useState, useEffect } from 'react';

import { useGetAccountInfo } from '@elrondnetwork/dapp-core';

import BigNumber from 'bignumber.js';

import { denominated } from 'helpers/denominate';
import { useApp } from 'provider';

interface UnstakeableType {
  exceeds: boolean;
  active: boolean;
  available: string;
}

const useClient = () => {
  const { account, address } = useGetAccountInfo();
  const { totalActiveStake, delegationCap, automaticActivation } = useApp();

  const [unstakeable, setUnstakeable] = useState<UnstakeableType>({
    active: false,
    exceeds: false,
    available: ''
  });

  const getClientData = () => {
    const balance = new BigNumber(
      denominated(account.balance, {
        showLastNonZeroDecimal: true,
        addCommas: false
      })
    );

    const formatted = {
      total: denominated(totalActiveStake.replace(/,/g, '')),
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
        new BigNumber(totalActiveStake).isGreaterThanOrEqualTo(
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
  };

  useEffect(getClientData, [
    delegationCap,
    address,
    totalActiveStake,
    automaticActivation,
    account.balance
  ]);

  return {
    unstakeable
  };
};

export default useClient;
