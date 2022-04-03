import { Storefront } from '@darkpay/dark-types/substrate/interfaces';
import BN from 'bn.js';
import Link from 'next/link';
import React, { useState } from 'react';

import { StorefrontFollowersModal } from '../profiles/AccountsListModal';
import { ZERO } from '../utils';
import { MutedSpan } from '../utils/MutedText';
import { Pluralize } from '../utils/Plularize';
import { storefrontUrl } from '../urls';
import AboutStorefrontLink from './AboutStorefrontLink';
import { isMyStorefront } from './helpers';
import { useResponsiveSize } from '../responsive';

type Props = {
  storefront: Storefront
}

export const StorefrontStatsRow = ({ storefront }: Props) => {
  const {
    id,
    score,
    products_count,
    followers_count: followers
  } = storefront

  const { isMobile } = useResponsiveSize()
  const [ followersOpen, setFollowersOpen ] = useState(false)
  const productsCount = new BN(products_count).eq(ZERO) ? 0 : new BN(products_count)
  const statLinkCss = 'DfStatItem'

  return (
    <div className={`${isMyStorefront(storefront) && 'MyStorefront DfStatItem'}`}>
      <Link href='/[storefrontId]' as={storefrontUrl(storefront)}>
        <a className={statLinkCss}>
          <Pluralize count={productsCount} singularText='Product'/>
        </a>
      </Link>

      <div onClick={() => setFollowersOpen(true)} className={statLinkCss} style={{ cursor: 'pointer' }}>
        <Pluralize count={followers} singularText='Follower' />
      </div>

      {!isMobile && <>
        <MutedSpan>
          <AboutStorefrontLink className={statLinkCss} storefront={storefront} title='About' />
        </MutedSpan>

        <MutedSpan className='DfStatItem'>
          <Pluralize count={score} singularText='Point' />
        </MutedSpan>
      </>}

      {followersOpen &&
        <StorefrontFollowersModal
          id={id}
          title={<Pluralize count={followers} singularText='Follower'/>}
          accountsCount={storefront.followers_count}
          open={followersOpen}
          close={() => setFollowersOpen(false)}
        />
      }
    </div>
  )
}

export default StorefrontStatsRow
