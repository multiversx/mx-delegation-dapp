import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

import useStakeData from '/src/components/StakeRisa/hooks';
import Tier from '../Tier';
import * as styles from './styles.module.scss';

const StakeDetails = () => {
  const { stakeAccount, stakeSettings } = useStakeData();
  const unstakeAt =
      stakeAccount &&
      stakeSettings &&
      dayjs.unix(
        stakeAccount?.last_staked_timestamp.toNumber() +
          stakeSettings?.lock_period.toNumber()
      ),
    unstakeIsAfterNow = unstakeAt?.isAfter(dayjs());

  return (
    <div className={styles.line}>
      <div>
        {stakeAccount?.current_tier && (
          <span>
            Tier: <Tier tier={stakeAccount?.current_tier.toNumber()}></Tier>
          </span>
        )}
      </div>
      <div>
        {stakeAccount?.current_apr &&
          `APR: ${stakeAccount.current_apr.div(100).toNumber()} %`}
      </div>
      <div>
        {unstakeIsAfterNow && `Unstake available ${unstakeAt.fromNow()}`}
      </div>
    </div>
  );
};
export default StakeDetails;
