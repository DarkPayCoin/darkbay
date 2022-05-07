import { GenericAccountId as AccountId } from '@polkadot/types';
import { StorefrontContent } from '@darkpay/dark-types/offchain';
import { nonEmptyStr, isEmptyStr } from '@darkpay/dark-utils';
import BN from 'bn.js';
import { mdToText } from 'src/utils';
import { NextPage } from 'next';
import dynamic from 'next/dynamic';
import Error from 'next/error';
import React, { useCallback } from 'react';
import { Segment } from 'src/components/utils/Segment';
import { isHidden, resolveBn } from '../utils';
import { HeadMeta } from '../utils/HeadMeta';
import { SummarizeMd } from '../utils/md';
import MyEntityLabel from '../utils/MyEntityLabel';
import { return404 } from '../utils/next';
import Section from '../utils/Section';
import { getDarkdotApi } from '../utils/DarkdotConnect';
import { getStorefrontId } from '../substrate';
import ViewTags from '../utils/ViewTags';
import StorefrontStatsRow from './StorefrontStatsRow';
import { ViewStorefrontProps } from './ViewStorefrontProps';
import withLoadStorefrontDataById from './withLoadStorefrontDataById';
import AboutStorefrontLink from './AboutStorefrontLink';
import ViewStorefrontLink from './ViewStorefrontLink';
import { PageContent } from '../main/PageWrapper';
import { DropdownMenu, ProductPreviewsOnStorefront, StorefrontNotFound, HiddenStorefrontAlert, StorefrontBanner, isMyStorefront } from './helpers';
import { ContactInfo } from './SocialLinks/ViewSocialLinks';
import { MutedSpan } from '../utils/MutedText';
import { BareProps } from '../utils/types';
import { getPageOfIds } from '../utils/getIds';
import { editStorefrontUrl } from '../urls';
import ButtonLink from '../utils/ButtonLink';
import { EditOutlined } from '@ant-design/icons';
import { EntityStatusGroup, PendingStorefrontOwnershipPanel } from '../utils/EntityStatusPanels';



// import { StorefrontHistoryModal } from '../utils/ListsEditHistory';
const FollowStorefrontButton = dynamic(() => import('../utils/FollowStorefrontButton'), { ssr: false });

type Props = ViewStorefrontProps

export const ViewStorefront = (props: Props) => {
  if (props.statusCode === 404) return <Error statusCode={props.statusCode} />

  const { storefrontData } = props;

  if (!storefrontData || !storefrontData?.struct || isHidden({ struct: storefrontData.struct })) {
    return <StorefrontNotFound />
  }

  const {
    preview = false,
    nameOnly = false,
    withLink = false,
    miniPreview = false,
    withFollowButton = true,
    withStats = true,
    withTags = true,
    dropdownPreview = false,
    productIds = [],
    products = [],
    onClick,
    imageSize = 64,
  } = props;

  const storefront = storefrontData.struct;

  const {
    id,
    owner
  } = storefront;

  const { about, name, image, tags, ...contactInfo } = storefrontData?.content || {} as StorefrontContent

  const storefrontName = isEmptyStr(name) ? <MutedSpan>{'<Unnamed Storefront>'}</MutedSpan> : name

  const Banner = useCallback(() => <StorefrontBanner storefront={storefront} address={owner} avatar={image} size={imageSize} />, [])

  const isMy = isMyStorefront(storefront)

  const primaryClass = `StorefrontDetails ${isMy && 'MyStorefront'}`

  const StorefrontNameAsLink = (props: BareProps) =>
    <ViewStorefrontLink storefront={storefront} title={storefrontName} {...props} />

  

  const renderNameOnly = () =>
    withLink
      ? <StorefrontNameAsLink />
      : <span>{storefrontName}</span>

  const renderDropDownPreview = () =>
    <div className={`${primaryClass} DfPreview`}>
      <Banner />
      <div className='content'>
        <div className='handle'>{storefrontName}</div>
      </div>
    </div>

  const renderMiniPreview = () =>
    <div className={'viewstorefront-minipreview'}>
      <div onClick={onClick} className={primaryClass}>
        <Banner />
        <div className='content'>
          <div className='handle'>{storefrontName}</div>
        </div>
      </div>
      {withFollowButton && <FollowStorefrontButton storefrontId={id} />}
    </div>

  const title = React.createElement(
    preview ? 'span' : 'h1',
    { className: 'header'},
    <>
      <StorefrontNameAsLink className='mr-3' />
      <MyEntityLabel isMy={isMy}>My storefront</MyEntityLabel>
    </>
  );

  
  // const { created: { time }, owner: storefrontOwnerAddress } = storefront;

  const renderPreview = () =>
    <div className={primaryClass}>
        <div className='DfStorefrontBannerFull'>
          <Banner />
        </div>

      <div className='DfStorefrontBody fullFlex'>

          <div className='StorefrontTitle'>
            <div className='flexTitle'>
            {title}
            </div>
            <div className='ContextMenu'>
              <DropdownMenu className='mx-2' storefrontData={storefrontData} />
              {isMy &&
                <ButtonLink href={`/[storefrontId]/edit`} as={editStorefrontUrl(storefront)} className='mr-2 bg-transparent'>
                  <EditOutlined /> Edit
                </ButtonLink>
              }
              {withFollowButton &&
                <FollowStorefrontButton storefrontId={id} />
              }
            </div>
          </div>

          {withStats && <div className='d-flex justify-content-between flex-wrap mt-3'>
            <StorefrontStatsRow storefront={storefront} />
            {!preview && <ContactInfo {...contactInfo} />}
          </div>}

          {nonEmptyStr(about) &&
            <div className='description StorefrontDescription'>
              <SummarizeMd md={about} more={
                <AboutStorefrontLink storefront={storefront} title={'Learn More'} />
              } />
            </div>
          }


          <div className='StorefrontTags'>
           {withTags && <ViewTags tags={tags} className='mt-2' />}
          </div>




          {/* <div className='StorefrontAuthor'>
          <h5><ShopOutlined /> Owner:</h5>
            <AuthorPreview
              address={storefrontOwnerAddress}
              withFollowButton
              isShort={true}
              isPadded={false}
              details={<div>Created on {formatUnixDate(time)}</div>}/>
          </div> */}

        
      </div>
    </div>

  if (nameOnly) {
    return renderNameOnly();
  } else if (dropdownPreview) {
    return renderDropDownPreview();
  } else if (miniPreview) {
    return renderMiniPreview();
  } else if (preview) {
    return <Segment>
      <EntityStatusGroup>
        <PendingStorefrontOwnershipPanel storefront={storefront} preview />
        <HiddenStorefrontAlert storefront={storefront} preview />
      </EntityStatusGroup>
      {renderPreview()}
    </Segment>;
  }

  return <>
    <PageContent>
      <PendingStorefrontOwnershipPanel storefront={storefront} />
      <HiddenStorefrontAlert storefront={storefront} />
      <Section>{renderPreview()}</Section>
      <div className='StorefrontProducts fullFlex'>
        <ProductPreviewsOnStorefront storefrontData={storefrontData} products={products} productIds={productIds} />
      </div>
    </PageContent>
  </>
}

// TODO extract getInitialProps, this func is similar in AboutStorefront

const ViewStorefrontPage: NextPage<Props> = (props) => {
  const { storefrontData } = props

  if (!storefrontData || !storefrontData.content) {
    return null
  }

  const id = resolveBn(storefrontData.struct.id)
  const { about, name, image } = storefrontData.content

  // Simple check (should be imroved later)
  const isPolkaProject = id.eqn(1) || (id.gtn(1000) && id.ltn(1218))

  // Need to add this to a title to improve SEO of Polkadot projects.
  const title = name + (isPolkaProject ? ' - DarkBay decentralized e-commerce' : '')

  return <>
    <HeadMeta title={title} desc={mdToText(about)} image={image} />
    <ViewStorefront {...props} />
  </>
}

ViewStorefrontPage.getInitialProps = async (props): Promise<Props> => {
  const { query } = props
  const { storefrontId } = query
  const idOrHandle = storefrontId as string

  const id = await getStorefrontId(idOrHandle)
  if (!id) {
    return return404(props)
  }

  const darkdot = await getDarkdotApi()
  const { substrate } = darkdot

  const storefrontData = id && await darkdot.findStorefront({ id: id })
  if (!storefrontData?.struct) {
    return return404(props)
  }

  const ownerId = storefrontData?.struct.owner as AccountId
  const owner = await darkdot.findProfile(ownerId)

  // We need to reverse product ids to display products in a descending order on a storefront page.
  const productIds = (await substrate.productIdsByStorefrontId(id as BN)).reverse()
  const pageIds = getPageOfIds(productIds, query)
  const products = await darkdot.findPublicProductsWithAllDetails(pageIds)

  return {
    storefrontData,
    products,
    productIds,
    owner
  }
}

export default ViewStorefrontPage

export const DynamicViewStorefront = withLoadStorefrontDataById(ViewStorefront)
