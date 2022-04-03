import React, { useState, useCallback } from 'react'
import { DynamicViewStorefront } from '../storefronts/ViewStorefront'
import { Segment } from 'src/components/utils/Segment'
import { Tabs } from 'antd'
import { ElasticIndex, ElasticIndexTypes } from '@darkpay/dark-types/offchain/search'
import { useRouter } from 'next/router'
import Section from '../utils/Section'
import { ProfilePreviewWithOwner } from '../profiles/address-views'
import { DataListOptProps } from '../lists/DataList'
import { queryElasticSearch } from 'src/components/utils/OffchainUtils'
import { InfiniteListByData, InnerLoadMoreFn, RenderItemFn } from '../lists/InfiniteList'
import { AnyDarkdotData, ProductWithAllDetails } from '@darkpay/dark-types'
import BN from 'bn.js';
import { DynamicProductPreview } from '../products/view-product/DynamicProductPreview'
import registry from '@darkpay/dark-types/substrate/registry'
import { GenericAccountId as AccountId } from '@polkadot/types';


const { TabPane } = Tabs

type DataResults = {
  _index: string
  _id: string
  data: (AnyDarkdotData | ProductWithAllDetails)[]
}

const AllTabKey = 'all'

const panes = [
  {
    key: AllTabKey,
    title: 'All'
  },
  {
    key: 'storefronts',
    title: 'Storefronts'
  },
  {
    key: 'products',
    title: 'Products'
  },
  {
    key: 'profiles',
    title: 'Profiles'
  }
]

const resultToPreview = ({ _index, _id, data }: DataResults, i: number) => {

  switch (_index) {
    case ElasticIndex.storefronts:
    //  return <ViewStorefront key={`${id}-${i}`} storefrontData={unknownData as StorefrontData} preview withFollowButton />
   return <DynamicViewStorefront id={new BN(_id)} preview withFollowButton />

     return <div>Storefront :${_id}-${i} </div>
    case ElasticIndex.products: {
     // const productData = unknownData as ProductWithAllDetails
     // return <ProductPreview key={productData.product.struct.id.toString()} productDetails={productData} withActions />
     //return <div>Product :${_id}-${i} </div>
     return <DynamicProductPreview id={new BN(_id)} withTags />

    }
    case ElasticIndex.profiles:
      return (
         <Segment>
             <ProfilePreviewWithOwner key={_id} address={new AccountId(registry, _id)} />
         </Segment>
        // <ProfilePreviewWithOwner key={`${_id}-${i}`} address={_id} owner={unknownData as ProfileData} />
       // <div>Profile :${_id}-${i} </div>
      )
    default:
     // return <ViewStorefront key={`${_id}-${i}`} storefrontData={unknownData as StorefrontData} preview withFollowButton />
      return <div>Object :${_id}-${i} </div>

    }
}

type InnerSearchResultListProps<T> = DataListOptProps & {
  loadingLabel?: string
  renderItem: RenderItemFn<T>
}

const InnerSearchResultList = <T extends DataResults>(props: InnerSearchResultListProps<T>) => {
  const router = useRouter()

  const getReqParam = (param: 'tab' | 'q' | 'tags') => {
    console.warn('ROuter query param : '+router.query[param])
    return router.query[param]
  }

  const querySearch: InnerLoadMoreFn<T> = async (page, size) => {
    const tab = getReqParam('tab') as ElasticIndexTypes[]
    const query = getReqParam('q') as string
    const tags = getReqParam('tags') as string[]
    const offset = (page - 1) * size

    const res = await queryElasticSearch({
      indexes: tab || AllTabKey,
      q: query,
      tags,
      offset,
      limit: size,
    })
 console.warn(res)
    return res || []
  }

  const List = useCallback(() =>
    <InfiniteListByData {...props} loadMore={querySearch} />,
    [ router.asPath ]
  )

  return <List />
}

const AllResultsList = () => (
  <InnerSearchResultList loadingLabel={'Loading search results...'} renderItem={resultToPreview} />
)

const ResultsTabs = () => {
  const router = useRouter()

  const getTabIndexFromUrl = (): number => {
    const tabFromUrl = router.query.tab
    const tabIndex = panes.findIndex(pane => pane.key === tabFromUrl)
    return tabIndex < 0 ? 0 : tabIndex
  }

  const initialTabIndex = getTabIndexFromUrl()
  const initialTabKey = panes[initialTabIndex].key

  const [activeTabKey, setActiveTabKey] = useState(initialTabKey)

  const handleTabChange = (key: string) => {
    setActiveTabKey(key)

    const newPath = {
      pathname: router.pathname,
      query: {
        ...router.query,
        tab: key
      }
    }

    router.push(newPath, newPath)
  }

  return (
    <Tabs onChange={handleTabChange} activeKey={activeTabKey.toString()}>
      {panes.map(({ key, title }) => (
        <TabPane key={key} tab={title}>
          <AllResultsList />
        </TabPane>
      ))}
    </Tabs>
  )
}

const SearchResults = () => {
  return (
    <Section>
      <ResultsTabs />
    </Section>
  )
}

export default SearchResults
