import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import { getDarkdotApi } from '../utils/DarkdotConnect';
import { HeadMeta } from '../utils/HeadMeta';
import { LatestStorefronts } from './LatestStorefronts';
import { LatestProducts } from './LatestProducts';
import { StorefrontData, ProductWithAllDetails } from '@darkpay/dark-types';
import { PageContent } from './PageWrapper';
import partition from 'lodash.partition';
import { isComment } from '../products/view-product';
import { useIsSignedIn } from '../auth/MyAccountContext';
import { getLastNStorefrontIds, getLastNIds } from '../utils/getIds';
import { Tabs } from 'antd';
import Section from '../utils/Section';
import MyFeed from '../activity/MyFeed';
import { uiShowFeed } from '../utils/env';

const { TabPane } = Tabs

type Props = {
  storefrontsData: StorefrontData[]
  canHaveMoreStorefronts: boolean
  productsData: ProductWithAllDetails[]
  commentData: ProductWithAllDetails[]
}

const LatestUpdate = (props: Props) => {
  const { storefrontsData, productsData } = props;

  return (
    <PageContent>
      <HeadMeta
        title='Latest products and storefronts'
        desc='Darkdot is an open decentralized e-commerce network'
      />

      <LatestProducts {...props} productsData={productsData} type='product' />
      {/* <LatestProducts {...props} productsData={commentData} type='comment' /> */}
      <LatestStorefronts {...props} storefrontsData={storefrontsData} />

    </PageContent>
  )
}

const TabsHomePage = (props: Props) => {
  const isSignedIn = useIsSignedIn()
  // const defaultKey = isSignedIn ? 'feed' : 'latest'
  const defaultKey = 'latest'
  const [ key, setKey ] = useState<string>(defaultKey)

  useEffect(() => setKey(defaultKey), [ isSignedIn ])

  return <Section className='m-0'>
    <Tabs activeKey={key} onChange={setKey}>
    <TabPane tab='Latest' key='latest'>
        <LatestUpdate {...props} />
      </TabPane>
      <TabPane tab='My feed' key='feed'>
        <MyFeed />
      </TabPane>
    </Tabs>
  </Section>
}

const HomePage: NextPage<Props> = (props) => <Section className='m-0'>
  {uiShowFeed
    ? <TabsHomePage {...props} />
    : <LatestUpdate {...props} />}
</Section>

const LAST_ITEMS_SIZE = 5

HomePage.getInitialProps = async (): Promise<Props> => {
  const darkdot = await getDarkdotApi();
  const { substrate } = darkdot
  const nextStorefrontId = await substrate.nextStorefrontId()
  const nextProductId = await substrate.nextProductId()

  const latestStorefrontIds = getLastNStorefrontIds(nextStorefrontId, 3 * LAST_ITEMS_SIZE);
  const publicStorefrontsData = await darkdot.findPublicStorefronts(latestStorefrontIds) as StorefrontData[]
  const storefrontsData = publicStorefrontsData.slice(0, LAST_ITEMS_SIZE)
  const canHaveMoreStorefronts = publicStorefrontsData.length >= LAST_ITEMS_SIZE

  const latestProductIds = getLastNIds(nextProductId, 6 * LAST_ITEMS_SIZE);
  const allProductsData = await darkdot.findPublicProductsWithAllDetails(latestProductIds);
  const [ publicCommentData, publicProductsData ] =
    partition(allProductsData, (x) => isComment(x.product.struct.extension))

  const productsData = publicProductsData.slice(0, LAST_ITEMS_SIZE)
  const commentData = publicCommentData.slice(0, LAST_ITEMS_SIZE)



  return {
    storefrontsData,
    productsData,
    commentData,
    canHaveMoreStorefronts
  }
}

export default HomePage;
