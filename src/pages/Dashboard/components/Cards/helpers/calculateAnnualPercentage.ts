import { decodeString } from '@elrondnetwork/erdjs';
import { denomination, decimals, defaults } from 'config';
import denominate from 'helpers/denominate';

const calculateAnnualPercentage = ({
  activeStake,
  blsKeys,
  networkStatus,
  networkStake,
  networkConfig,
  stakedBalance,
  serviceFee
}: any) => {
  const denominated = (value: string) =>
    denominate({
      input: value,
      denomination,
      decimals,
      showLastNonZeroDecimal: true
    }).replace(/,/g, '');

  const feesInEpoch = defaults.feesInEpoch;
  const stakePerNode = defaults.stakePerNode;
  const protocolSustainabilityRewards = defaults.protocolSustainabilityRewards;
  if (!networkConfig.RoundsPerEpoch) {
    networkConfig.RoundsPerEpoch = networkStatus.RoundsPerEpoch;
  }
  const epochDuration =
    (networkConfig.RoundDuration / 1000) * networkConfig.RoundsPerEpoch;
  const secondsInYear = 365 * 24 * 3600;
  const epochsInYear = secondsInYear / epochDuration;

  const inflationRate =
    defaults.yearSettings.find(
      (x) => x.year === Math.floor(networkStatus.EpochNumber / epochsInYear) + 1
    )?.maximumInflation || 0;
  const rewardsPerEpoch = Math.max(
    (inflationRate * defaults.genesisTokenSupply) / epochsInYear,
    feesInEpoch
  );
  const rewardsPerEpochWithoutProtocolSustainability =
    (1 - protocolSustainabilityRewards) * rewardsPerEpoch;
  const topUpRewardsLimit = 0.5 * rewardsPerEpochWithoutProtocolSustainability;
  const networkBaseStake = networkStake.ActiveValidators * stakePerNode;
  const networkTotalStake = parseInt(denominated(stakedBalance));

  const networkTopUpStake =
    networkTotalStake -
    networkStake.TotalValidators * stakePerNode -
    networkStake.QueueSize * stakePerNode;

  const topUpReward =
    ((2 * topUpRewardsLimit) / Math.PI) *
    Math.atan(networkTopUpStake / (2 * 2000000));
  const baseReward = rewardsPerEpochWithoutProtocolSustainability - topUpReward;
  const allNodes = blsKeys.filter(
    (key: any) =>
      key.asString === 'staked' ||
      key.asString === 'jailed' ||
      key.asString === 'queued'
  ).length;

  const allActiveNodes = blsKeys.filter(
    (key: any) => decodeString(key) === 'staked'
  ).length;

  if (allActiveNodes <= 0) {
    return 0;
  }

  // based on validator total stake recalibrate the active nodes.
  // it can happen that an user can unStake some tokens, but the node is still active until the epoch change
  const validatorTotalStake = parseInt(denominated(activeStake));
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

  return anualPercentageRate * (1 - serviceFee / 100 / 100) * 100;
};

export default calculateAnnualPercentage;
