import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { StorefrontId } from '@darkpay/dark-types/substrate/interfaces';
import BN from 'bn.js'
import { getStorefrontId } from '../substrate';
import NoData from '../utils/EmptyList';

export function withStorefrontIdFromUrl<Props = { storefrontId: StorefrontId }>
  (Component: React.ComponentType<Props>) {

  return function (props: Props) {
    const router = useRouter();
    const { storefrontId } = router.query;
    const idOrHandle = storefrontId as string
    try {
      const [ id, setId ] = useState<BN>()

      useEffect(() => {
        const getId = async () => {
          const id = await getStorefrontId(idOrHandle)
          id && setId(id)
        }
        getId().catch(err => console.error(err))
      }, [ false ])

      return !id ? null : <Component storefrontId={id} {...props} />;
    } catch (err) {
      return <NoData description={`Invalid storefront ID or handle: ${idOrHandle}`}/>
    }
  };
}
