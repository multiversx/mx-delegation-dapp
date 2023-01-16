import useStakeData from '/src/components/StakeRisa/hooks';
import Tier from '../Tier';
import styles from './styles.module.scss';

const StakeDetails = () => {
  const { stakeAccount, stakeSettings } = useStakeData();

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
    </div>
  );
};
export default StakeDetails;
