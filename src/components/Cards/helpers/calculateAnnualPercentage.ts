import { decodeString } from '@multiversx/sdk-core';
import {
  denomination,
  decimals,
  feesInEpoch,
  stakePerNode,
  protocolSustainabilityRewards,
  yearSettings,
  genesisTokenSupply
} from 'config';
import denominate from 'helpers/denominate';

const denominateValue = (value: string) => {
  const denominatedValueString = denominate({
    input: value,
    denomination,
    decimals
  });
  const valueWithoutComma = denominatedValueString.replace(/,/g, '');
  return valueWithoutComma;
};

const calculateAnnualPercentage = ({
  activeStake,
  blsKeys,
  networkStatus,
  networkStake,
  networkConfig,
  serviceFee
}: any) => {
  const allNodes = blsKeys.filter(
    (key: any) =>
      decodeString(key) === 'staked' ||
      decodeString(key) === 'jailed' ||
      decodeString(key) === 'queued'
  ).length;
  const allActiveNodes = blsKeys.filter(
    (key: any) => decodeString(key) === 'staked'
  ).length;
  if (allActiveNodes <= 0) {
    return '0.00';
  }

  const epochDurationInSeconds =
    (networkConfig.RoundDuration / 1000) * networkConfig.RoundsPerEpoch;
  const secondsInYear = 365 * 24 * 3600;
  const epochsInYear = secondsInYear / epochDurationInSeconds;
  const inflationRate =
    yearSettings.find(
      (x) => x.year === Math.floor(networkStatus.EpochNumber / epochsInYear) + 1
    )?.maximumInflation || 0;
  const rewardsPerEpoch = Math.max(
    (inflationRate * genesisTokenSupply) / epochsInYear,
    feesInEpoch
  );
  const rewardsPerEpochWithoutProtocolSustainability =
    (1 - protocolSustainabilityRewards) * rewardsPerEpoch;
  const topUpRewardsLimit =
    networkConfig.TopUpFactor * rewardsPerEpochWithoutProtocolSustainability;

  const networkBaseStake = networkStake.ActiveValidators * stakePerNode;
  const networkTotalStake = parseInt(denominateValue(networkStatus.Balance));
  const networkTopUpStake =
    networkTotalStake -
    networkStake.TotalValidators * stakePerNode -
    networkStake.QueueSize * stakePerNode;
  const topUpReward =
    ((2 * topUpRewardsLimit) / Math.PI) *
    Math.atan(
      networkTopUpStake /
        (2 *
          parseInt(
            denominateValue(networkConfig.TopUpRewardsGradientPoint.toFixed())
          ))
    );

  const baseReward = rewardsPerEpochWithoutProtocolSustainability - topUpReward;
  const validatorTotalStake = parseInt(denominateValue(activeStake));
  const actualNumberOfNodes = Math.min(
    Math.floor(validatorTotalStake / stakePerNode),
    allActiveNodes
  );
  const validatorBaseStake = actualNumberOfNodes * stakePerNode;

  const validatorTopUpStake =
    ((validatorTotalStake - allNodes * stakePerNode) / allNodes) *
    allActiveNodes;
  const validatorTopUpReward =
    networkTopUpStake > 0
      ? (validatorTopUpStake / networkTopUpStake) * topUpReward
      : 0;
  const validatorBaseReward =
    (validatorBaseStake / networkBaseStake) * baseReward;
  const anualPercentageRate =
    (epochsInYear * (validatorTopUpReward + validatorBaseReward)) /
    validatorTotalStake;
  const annuallPercentageRateTotal =
    anualPercentageRate * 100 - anualPercentageRate * 100 * (serviceFee / 100);

  return annuallPercentageRateTotal.toFixed(2).toString();
};

export default calculateAnnualPercentage;
