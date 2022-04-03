import React, { useState, useEffect } from 'react';
import { getActivities, getReactionActivities, getCommentActivities, getProductActivities, getFollowActivities, getActivityCounts } from '../utils/OffchainUtils';
import { Tabs } from 'antd';
import { AccountStorefronts, LoadStorefrontsType } from '../storefronts/AccountStorefronts';
import { Counts } from '@darkpay/dark-types'
import { getLoadMoreNotificationsFn, NotifActivities } from './Notifications';
import { BaseActivityProps } from './types';
import { getLoadMoreFeedFn, FeedActivities } from './FeedActivities';
import { Loading } from '../utils';
import { uiShowActivity } from '../utils/env';

const { TabPane } = Tabs

type ActivitiesByAddressProps = Partial<LoadStorefrontsType> & {
  address: string
}

const loadMoreActivities = getLoadMoreNotificationsFn(getActivities, 'activities')

const AllActivities = (props: BaseActivityProps) => <NotifActivities
  {...props}
  loadMore={loadMoreActivities}
  noDataDesc='No activities yet'
  loadingLabel='Loading activities...'
/>

const loadMoreReaction = getLoadMoreNotificationsFn(getReactionActivities, 'activities')

const ReactionActivities = (props: BaseActivityProps) => <NotifActivities
  {...props}
  loadMore={loadMoreReaction}
  noDataDesc='No reactions yet'
  loadingLabel='Loading reactions...'
/>

const loadMoreFollow = getLoadMoreNotificationsFn(getFollowActivities, 'activities')

const FollowActivities = (props: BaseActivityProps) => <NotifActivities
  {...props}
  loadMore={loadMoreFollow}
  noDataDesc='No follows yet'
  loadingLabel='Loading follows...'
/>

const loadMoreComment = getLoadMoreFeedFn(getCommentActivities, 'comment_id')

const CommentActivities = (props: BaseActivityProps) => <FeedActivities
  {...props}
  loadMore={loadMoreComment}
  noDataDesc='No comments yet'
  loadingLabel='Loading comments...'
/>

const loadMoreProduct = getLoadMoreFeedFn(getProductActivities, 'product_id')

const ProductActivities = (props: BaseActivityProps) => <FeedActivities
  {...props}
  loadMore={loadMoreProduct}
  noDataDesc='No products yet'
  loadingLabel='Loading products...'
/>

export const AccountActivity = ({ address, storefrontsData, myStorefrontIds }: ActivitiesByAddressProps) => {
  if (!uiShowActivity) return null

  const [ counts, setCounts ] = useState<Counts>()

  useEffect(() => {
    if (!address) return

    getActivityCounts(address.toString()).then(setCounts)
  }, [ address ])

  if (!counts) return <Loading label='Loading activities...' />

  const { productsCount, commentsCount, reactionsCount, followsCount, activitiesCount } = counts

  const storefrontsCount = myStorefrontIds?.length || 0

  const getTabTitle = (title: string, count: number) => `${title} (${count})`

  return <Tabs>
    <TabPane tab={getTabTitle('Products', productsCount)} key='products'>
      <ProductActivities address={address} totalCount={productsCount} />
    </TabPane>
    <TabPane tab={getTabTitle('Comments', commentsCount)} key='comments'>
      <CommentActivities address={address} totalCount={commentsCount} />
    </TabPane>
    <TabPane tab={getTabTitle('Reactions', reactionsCount)} key='reactions'>
      <ReactionActivities address={address} totalCount={reactionsCount} />
    </TabPane>
    <TabPane tab={getTabTitle('Follows', followsCount)} key='follows'>
      <FollowActivities address={address} totalCount={followsCount} />
    </TabPane>
    <TabPane tab={getTabTitle('Storefronts', storefrontsCount)} key='storefronts'>
      <AccountStorefronts address={address} storefrontsData={storefrontsData} myStorefrontIds={myStorefrontIds} withTitle={false} />
    </TabPane>
    <TabPane tab={getTabTitle('All', activitiesCount)} key='all'>
      <AllActivities address={address} totalCount={activitiesCount} />
    </TabPane>
  </Tabs>
}


