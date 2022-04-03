import { StorefrontData } from '@darkpay/dark-types/dto';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import PaginatedList from 'src/components/lists/PaginatedList';
import { HeadMeta } from '../utils/HeadMeta';
import { useSidebarCollapsed } from '../utils/SideBarCollapsedContext';
import { getDarkdotApi } from '../utils/DarkdotConnect';
import { storefrontIdForUrl, storefrontUrl } from '../urls';
import { ViewStorefront } from './ViewStorefront';
import ButtonLink from '../utils/ButtonLink';
import { PageLink } from 'src/layout/SideMenuItems';
import BaseAvatar from '../utils/DfAvatar';
import { isMyAddress } from '../auth/MyAccountContext';
import { toShortAddress } from '../utils';
import { getPageOfIds } from '../utils/getIds';

type Props = {
  storefrontsData: StorefrontData[],
  totalCount: number
};

export const ListFollowingStorefronts = (props: Props) => {
  const { storefrontsData, totalCount } = props;
  const { query: { address: queryAddress } } = useRouter()

  const address = queryAddress as string

  const title = isMyAddress(address)
    ? `My Subscriptions (${totalCount})`
    : `Subscriptions of ${toShortAddress(address)}` // TODO show title | username | extension name | short addresss

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <PaginatedList
        title={title}
        totalCount={totalCount}
        dataSource={storefrontsData}
        renderItem={(item, index) => (
          <ViewStorefront {...props} key={index} storefrontData={item} preview withFollowButton />
        )}
        noDataDesc='You are not following any storefront yet'
        noDataExt={<ButtonLink href='/storefronts/all' as='/storefronts/all'>Explore storefronts</ButtonLink>}
      />
    </div>
  );
};


export const ListFollowingStorefrontsPage: NextPage<Props> = (props) => {
  const { query: { address } } = useRouter()
  return <>
    <HeadMeta title={`Subscriptions of ${address}`} desc={`Storefronts that ${address} follows on Darkdot`} />
    <ListFollowingStorefronts {...props} />
  </>
}

ListFollowingStorefrontsPage.getInitialProps = async (props): Promise<Props> => {
  const { query } = props;
  const { address } = query
  const darkdot = await getDarkdotApi()
  const { substrate } = darkdot;

  // TODO sort storefront ids in a about order (don't forget to sort by id.toString())
  const followedStorefrontIds = await substrate.storefrontIdsFollowedByAccount(address as string)
  const pageIds = getPageOfIds(followedStorefrontIds, query)
  const storefrontsData = await darkdot.findPublicStorefronts(pageIds);

  return {
    totalCount: followedStorefrontIds.length,
    storefrontsData
  };
};

// TODO extract to a separate file:

export const StorefrontLink = (props: { item: StorefrontData }) => {
  const { item } = props;
  const { pathname, query } = useRouter();
  const { toggle, state: { asDrawer } } = useSidebarCollapsed();

  if (!item) return null;

  const idForUrl = storefrontIdForUrl(item.struct)
  const isSelectedStorefront = pathname.includes('storefronts') &&
    query.storefrontId as string === idForUrl

  return (
    <Link
      key={idForUrl}
      href='/[storefrontId]'
      as={storefrontUrl(item.struct)}
    >
      <a className={`DfMenuStorefrontLink ${isSelectedStorefront ? 'DfSelectedStorefront' : ''}`}>
        <ViewStorefront
          key={idForUrl}
          storefrontData={item}
          miniPreview
          imageSize={28}
          onClick={() => asDrawer && toggle()}
          withFollowButton={false}
        />
      </a>
    </Link>
  )
}

export const buildFollowedItems = (followedStorefrontsData: StorefrontData[]): PageLink[] => followedStorefrontsData.map(({ struct, content }) => ({
    name: content?.name || '',
    page: [ '/[storefrontId]', storefrontUrl(struct) ],
    icon: <span className='StorefrontMenuIcon'><BaseAvatar address={struct.owner} avatar={content?.image} size={24} /></span>
  }))
