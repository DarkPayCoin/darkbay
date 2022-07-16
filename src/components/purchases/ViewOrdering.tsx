import { GenericAccountId as AccountId } from '@polkadot/types';
import { OrderingContent } from '@darkpay/dark-types/offchain';
import { isEmptyStr } from '@darkpay/dark-utils';
import { NextPage } from 'next';
import Error from 'next/error';
import React, { useCallback } from 'react';
import { Segment } from 'src/components/utils/Segment';
import { resolveBn } from '../utils';
import { HeadMeta } from '../utils/HeadMeta';
import { return404 } from '../utils/next';
import Section from '../utils/Section';
import { getDarkdotApi } from '../utils/DarkdotConnect';
//import OrderingStatsRow from './OrderingStatsRow';
import { ViewOrderingProps } from './ViewOrderingProps';
//import withLoadOrderingDataById from './withLoadOrderingDataById';
//import AboutOrderingLink from './AboutOrderingLink';
import ViewOrderingLink from './ViewOrderingLink';
import { DropdownMenu, ProductPreviewsOnOrdering, OrderingNotFound, OrderingBanner, isMyOrdering } from './helpers';
//import { ContactInfo } from './SocialLinks/ViewSocialLinks';
import { MutedSpan } from '../utils/MutedText';
import { BareProps } from '../utils/types';
import { getPageOfIds } from '../utils/getIds';
import { orderingIdForUrl } from '../urls';
import ButtonLink from '../utils/ButtonLink';
import { getOrderingId } from '../substrate';
import { withLoadOrderingDataById } from './withLoadOrderingDataById';
import { Badge, Descriptions } from 'antd';
//import { EntityStatusGroup, PendingOrderingOwnershipPanel } from '../utils/EntityStatusPanels';

// import { OrderingHistoryModal } from '../utils/ListsEditHistory';
//const FollowOrderingButton = dynamic(() => import('../utils/FollowOrderingButton'), { ssr: false });
import { Collapse } from 'antd';

const { Panel } = Collapse

type Props = ViewOrderingProps

export const ViewOrdering = (props: Props) => {
  if (props.statusCode === 404) return <Error statusCode={props.statusCode} />

  const { orderingData } = props;

  

  if (!orderingData || !orderingData?.struct) {
    return <OrderingNotFound />
  }

  const {

    withLink = true,

    productIds = [],
    products = [],
    onClick,
    imageSize = 64
  } = props;

  const ordering = orderingData.struct;

  const {
  // id,
    owner
  } = ordering;

  // const { address1, address2, postal_code, city, country, orderingcontent_total, orderingcontent_state} = orderingData?.content || {} as OrderingContent

  const { } = orderingData?.content || {} as OrderingContent



  const order_total = parseFloat(orderingData.struct.ordering_total.toString()).toFixed(2)


  const orderingName = isEmptyStr(ordering.id) ? <MutedSpan>{'<Unnamed Ordering>'}</MutedSpan> : 'Purchase #' + (ordering.id)

  const Banner = useCallback(() => <OrderingBanner ordering={ordering} address={owner} size={imageSize} />, [])

  const isMy = isMyOrdering(ordering)

  const primaryClass = `ProfileDetails ${isMy && 'MyOrdering'}`

  const OrderingNameAsLink = (props: BareProps) =>
    <ViewOrderingLink ordering={ordering} {...props} />

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  const renderNameOnly = () =>
    withLink
      ? <OrderingNameAsLink />
      : <span>{orderingIdForUrl(ordering)}</span>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  const renderDropDownPreview = () =>
    <div className={`${primaryClass} DfPreview`}>
      <Banner />
      <div className='content'>
        <div className='handle'>{orderingName}</div>
      </div>
    </div>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  const renderMiniPreview = () =>
    <div className={'viewordering-minipreview'}>
      <div onClick={onClick} className={primaryClass}>
        <Banner />
        <div className='content'>
          <div className='handle'>{orderingName}</div>
        </div>
      </div>
    </div>


  const renderPreview = () =>
    <div className={primaryClass}>
  
      <div className='DfOrderingBody'>

        <div className='ml-2 w-100'>
          
          <div className='d-flex justify-content-between'>
            {orderingName}
            <span>$ {order_total}</span>
            <span>
              {isMy &&
                <ButtonLink disabled href="#" className='mr-2 bg-transparent'>
                            <Badge status="processing" text={orderingData.struct.ordering_state.toString()} />

                </ButtonLink>
              } 
               <DropdownMenu className='mx-2' orderingData={orderingData} />

            </span>
          </div>

        <Collapse accordion className="spaced-top padded-top">
    <Panel header="Purchase details" key={ordering.id.toString()}>

    <Descriptions title="Seller info">
    <Descriptions.Item label="Seller ID">{ordering.seller.toHuman()} / {ordering.storefront_id.toHuman()}</Descriptions.Item>
      </Descriptions>

        {/* <span className='d-flex align-items-center'>{orderingData.content?.pIds}</span> */}
        {/* <ProductPreviewsOnOrdering orderingData={orderingData} products={products} productIds={orderingData.content?productIds} /> */}
        <Descriptions title="Delivery Info">
    <Descriptions.Item label="Name">{orderingData.content?.name}</Descriptions.Item>
    <Descriptions.Item label="Address">
    {orderingData.content?.address1} {orderingData.content?.address2} {orderingData.content?.postal_code} - {orderingData.content?.city}
    </Descriptions.Item>
    <Descriptions.Item label="Country">{orderingData.content?.country}</Descriptions.Item>
    <Descriptions.Item label="Note">{orderingData.content?.memo}</Descriptions.Item>
  </Descriptions>

        </Panel>
        </Collapse>
        </div>
      </div>
    </div>


  return <>
      {/* <Section className='d-flex justify-content-between'>
               <span>Id</span>
               <span>Total</span>
               <span>Order state</span>
      </Section> */}
      <Segment className="spaced-top">{renderPreview()}</Segment>

  </>
}

//const log = newLogger('ViewOrdering.tsx')
// TODO extract getInitialProps, this func is similar in AboutOrdering

const ViewOrderingPage: NextPage<Props> = (props) => {
  const { orderingData } = props



  if (!orderingData || !orderingData.content) {
    return null
  }

  const id = resolveBn(orderingData.struct.id)
  // const {  address1, address2, postal_code, city, country,  } = orderingData.content
  const {  } = orderingData.content

  // Simple check (should be imroved later)
  const isPolkaProject = id.eqn(1) || (id.gtn(1000) && id.ltn(1218))

  // Need to add this to a title to improve SEO of Polkadot projects.
  const title = name + (isPolkaProject ? ' - Polkadot ecosystem projects' : '')

  return <>
    <HeadMeta title={title}  />
    <ViewOrdering {...props} />
  </>
}

ViewOrderingPage.getInitialProps = async (props): Promise<Props> => {
  const { query } = props
  const { orderingId } = query
  const idOrHandle = orderingId as string

  const id = await getOrderingId(idOrHandle)
  if (!id) {
    return return404(props)
  }

  const darkdot = await getDarkdotApi()
 //const { substrate } = darkdot

  const orderingData = id && await darkdot.findOrdering(id)
  

  if (!orderingData?.struct) {
    return return404(props)
  }

  const ownerId = orderingData?.struct.owner as AccountId
  const owner = await darkdot.findProfile(ownerId)

  // We need to reverse product ids to display products in a descending order on a ordering page.
  const productIds = orderingData.struct; //(await substrate.productIdsByOrderingId(id as BN)).reverse()
  const pageIds = getPageOfIds(productIds, query)
  const products = await darkdot.findPublicProductsWithAllDetails(pageIds)

  return {
    orderingData,
    products,
    productIds,
    owner
  }
}

export default ViewOrderingPage

export const DynamicViewOrdering = withLoadOrderingDataById(ViewOrdering)
