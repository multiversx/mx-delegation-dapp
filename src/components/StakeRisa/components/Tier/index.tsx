const Tier = (tier: number) =>
  tier === 1 ? (
    <span className='risa-tier' style={{ color: '#CD7F32' }}>
      Bronze
    </span>
  ) : tier === 2 ? (
    <span className='risa-tier' style={{ color: '#C0C0C0' }}>
      Silver
    </span>
  ) : tier === 3 ? (
    <span className='risa-tier' style={{ color: '#FFD700' }}>
      Gold
    </span>
  ) : tier === 4 ? (
    <span className='risa-tier' style={{ color: '#b9f2ff' }}>
      Diamond
    </span>
  ) : null;

export default Tier;
