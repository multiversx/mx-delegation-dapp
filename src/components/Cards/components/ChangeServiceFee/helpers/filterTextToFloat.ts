export type FilterType = [RegExp, string];

export const filterTextToFloat = (input: string) => {
  const onlyNumberFilter: FilterType = [/[^0-9.]/g, ''];
  const leadingZeroFilter: FilterType = [/^0[^.]/, '0'];
  const onlyDotFilter: FilterType = [/(\..*?)\..*/g, '$1'];

  const allFilters = [onlyNumberFilter, onlyDotFilter, leadingZeroFilter];
  const currentValue = allFilters.reduce(
    (filteredValue, [pattern, replacement]) =>
      filteredValue.replace(pattern, replacement),
    input
  );

  return currentValue;
};
