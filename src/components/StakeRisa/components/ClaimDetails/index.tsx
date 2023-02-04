import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import useStakeData from '/src/components/StakeRisa/hooks';
import * as styles from './styles.module.scss';

const ClaimDetails = () => {
  const { stakeAccount, stakeSettings } = useStakeData();
  const claimAt =
      stakeAccount &&
      stakeSettings &&
      dayjs.unix(
        stakeAccount?.last_claim_timestamp.toNumber() +
          stakeSettings?.claim_lock_period.toNumber()
      ),
    claimIsAfterNow = claimAt?.isAfter(dayjs());

  return (
    <div className={styles.line}>
      <div>
        <br />
      </div>
      <div>
        <br />
      </div>
      <div>
        {claimIsAfterNow &&
          `Next claim ${claimAt.fromNow()}`}
      </div>
    </div>
  );
};
export default ClaimDetails;
