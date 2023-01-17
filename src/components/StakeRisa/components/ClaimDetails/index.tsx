import * as dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import useStakeData from '/src/components/StakeRisa/hooks';
import styles from './styles.module.scss';

const ClaimDetails = () => {
  const { stakeAccount, stakeSettings } = useStakeData();
  const nextClaimTimestamp =
    stakeAccount && stakeSettings
      ? stakeAccount?.last_claim_timestamp.toNumber() +
        stakeSettings?.claim_lock_period.toNumber()
      : null;

  return (
    <div className={styles.line}>
      <div>
        {nextClaimTimestamp &&
          `Next claim ${dayjs.unix(nextClaimTimestamp).fromNow()}`}
      </div>
    </div>
  );
};
export default ClaimDetails;
