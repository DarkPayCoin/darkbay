import React from 'react';
import { ViewStorefront } from './ViewStorefront';
import { NextPage } from 'next';
import { HeadMeta } from '../utils/HeadMeta';
import { StorefrontData } from '@darkpay/dark-types/dto';
import { getDarkdotApi } from '../utils/DarkdotConnect';
import { CreateStorefrontButton } from './helpers';
import { getReversePageOfStorefrontIds, approxCountOfPublicStorefronts } from '../utils/getIds';
import BN from 'bn.js'
import { ZERO, resolveBn } from '../utils';
import { PaginatedList } from '../lists/PaginatedList';

type Props = {
  storefrontsData?: StorefrontData[]
  totalStorefrontCount?: BN
}

const getTitle = (count: number | BN) => `Explore Storefronts (${count})`

export const ListAllStorefronts = (props: Props) => {
  const { storefrontsData = [], totalStorefrontCount = ZERO } = props
  const totalCount = resolveBn(totalStorefrontCount).toNumber()
  const title = getTitle(totalCount) // TODO resolve bn when as hex and as BN

  return (
    <div className='ui huge relaxed middle aligned divided list ProfilePreviews listAllStorefronts'>
      <PaginatedList
        title={title}
        totalCount={totalCount}
        dataSource={storefrontsData}
        noDataDesc='There are no storefronts yet'
        noDataExt={<CreateStorefrontButton />}
        renderItem={(item: any) =>
          <ViewStorefront
            key={item.struct.id.toString()}
            {...props}
            storefrontData={item}
            withFollowButton
            preview
          />
        }
      />
    </div>
  )
}

const ListAllStorefrontsPage: NextPage<Props> = (props) => {
  const { totalStorefrontCount = ZERO } = props
  const title = getTitle(resolveBn(totalStorefrontCount))

  return <>
    <HeadMeta title={title} desc='Discover and follow interesting storefronts on Darkdot.' />
    <ListAllStorefronts {...props} />
  </>
}

ListAllStorefrontsPage.getInitialProps = async (props): Promise<Props> => {
  const { query } = props
  const darkdot = await getDarkdotApi()
  const { substrate } = darkdot

  const nextStorefrontId = await substrate.nextStorefrontId()
  const storefrontIds = await getReversePageOfStorefrontIds(nextStorefrontId, query)
  const storefrontsData = await darkdot.findPublicStorefronts(storefrontIds)
  const totalStorefrontCount = approxCountOfPublicStorefronts(nextStorefrontId)

  return {
    storefrontsData,
    totalStorefrontCount
  }
}

export default ListAllStorefrontsPage
