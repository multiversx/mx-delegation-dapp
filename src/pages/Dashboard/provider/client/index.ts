import denominate from 'pages/Dashboard/helpers/denominate';

import { decimals, denomination } from 'config';

const useClient = () => ({
  denominated: (input: string, parameters?: any): string =>
    denominate({
      input,
      denomination,
      decimals,
      ...parameters
    })
});

export default useClient;
