const getPercentage = (amountOutOfTotal: string, total: string) => {
  const percentage =
    (parseInt(amountOutOfTotal.replace(/,/g, '')) /
      parseInt(total.replace(/,/g, ''))) *
    100;
  if (percentage < 1) {
    return '<1';
  }

  if (percentage > 100) {
    return '100.00';
  }

  return percentage ? percentage.toFixed(2) : '...';
};

export default getPercentage;
