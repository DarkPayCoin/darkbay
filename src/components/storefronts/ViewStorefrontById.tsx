import React from 'react';

import { ViewStorefront } from './ViewStorefront';
import { useRouter } from 'next/router';
import BN from 'bn.js';

const Component = () => {
  const router = useRouter();
  const { storefrontId } = router.query;
  return storefrontId
    ? <ViewStorefront id={new BN(storefrontId as string)} />
    : null;
};

export default Component
