import React from 'react';
import { DfMd } from '../../utils/DfMd';
import { HeadMeta } from '../../utils/HeadMeta';
import Section from '../../utils/Section';
import { ProductData, ProductWithAllDetails } from '@darkpay/dark-types/dto';
import ViewTags from '../../utils/ViewTags';
import { CommentSection } from '../../comments/CommentsSection';
import Error from 'next/error'
import { NextPage } from 'next';
import { getDarkdotApi } from 'src/components/utils/DarkdotConnect';
import { getStorefrontId, unwrapSubstrateId } from 'src/components/substrate';
import partition from 'lodash.partition';
import BN from 'bn.js'
import { PageContent } from 'src/components/main/PageWrapper';
import { isHidden, Loading } from 'src/components/utils';
import { useLoadUnlistedStorefront, isHiddenStorefront } from 'src/components/storefronts/helpers';
import { resolveIpfsUrl } from 'src/ipfs';
//import { useResponsiveSize } from 'src/components/responsive';
import { mdToText } from 'src/utils';
import { ViewStorefront } from 'src/components/storefronts/ViewStorefront';
import { HiddenProductAlert, isComment, ProductActionsPanel, ProductCreator, ProductDropDownMenu, ProductNotFound, ShareProductContent, useSubscribedProduct } from 'src/components/products/view-product';
import ViewProductLink from 'src/components/products/ViewProductLink';



export type ProductDetailsProps = {
  productDetails: ProductWithAllDetails,
  statusCode?: number,
  replies: ProductWithAllDetails[]
}

export const ProductPage: NextPage<ProductDetailsProps> = ({ productDetails: initialProduct, replies, statusCode }) => {
  if (statusCode === 404) return <Error statusCode={statusCode} />
  if (!initialProduct || isHidden({ struct: initialProduct.product.struct })) return <ProductNotFound />

  const { product, ext, storefront } = initialProduct

  if (!storefront || isHiddenStorefront(storefront.struct)) return <ProductNotFound />

  const { struct: initStruct, content } = product;

  if (!content) return null;

  //const { isNotMobile } = useResponsiveSize()
  const struct = useSubscribedProduct(initStruct)
  const productDetails = { ...initialProduct, product: { struct, content } }

  const storefrontData = storefront || productDetails.storefront || useLoadUnlistedStorefront(struct.owner).myHiddenStorefront

  const { title, body, image, canonical, tags } = content;

  if (!storefrontData) return <Loading />

  const storefrontStruct = storefrontData.struct;

  const goToCommentsId = 'comments'

  const renderResponseTitle = (parentProduct?: ProductData) => parentProduct && <>
      In response to{' '}
    <ViewProductLink storefront={storefrontStruct} product={parentProduct.struct} title={parentProduct.content?.title} />
  </>

  const titleMsg = isComment(struct.extension)
    ? renderResponseTitle(productDetails.ext?.product)
    : title

  return <>
    <PageContent>
      <HiddenProductAlert product={product.struct} />
      <Section className='DfContentPage DfEntireProduct'> {/* TODO Maybe delete <Section /> because <PageContent /> includes it */}
        <HeadMeta title={title} desc={mdToText(body)} image={image} canonical={canonical} tags={tags} />
        <div className='DfRow'>
          <h1 className='DfProductName'>{titleMsg}</h1>
          <ProductDropDownMenu productDetails={productDetails} storefront={storefrontStruct} withEditButton />
        </div>
        <div className='addtocartRow'>
      </div>

        <div className='DfRow'>
          <ProductCreator productDetails={productDetails} withStorefrontName storefront={storefrontData} />
        </div>



        <div className='DfProductContent'>
          {ext
            ? <ShareProductContent productDetails={productDetails} storefront={storefront} />
            : <>
              {image && <div className='d-flex justify-content-center'>
                <img src={resolveIpfsUrl(image)} className='DfProductImage' /* add onError handler */ />
              </div>}
              {body && <DfMd source={body} />}
              <ViewTags tags={tags} className='mt-2' />
            </>}
        </div>
        
        <div className='DfRow'>
          <ProductActionsPanel productDetails={productDetails} storefront={storefront.struct} />
        </div>

        <div className='DfStorefrontPreviewOnProductPage'>
          <ViewStorefront
            storefrontData={storefrontData}
            withFollowButton
            withTags={false}
            withStats={false}
            preview
          />
        </div>

        <CommentSection product={productDetails} hashId={goToCommentsId} replies={replies} storefront={storefrontStruct} />
      </Section>
    </PageContent>
  </>
};

ProductPage.getInitialProps = async (props): Promise<any> => {
  const { query: { storefrontId, productId }, res } = props;
  const darkdot = await getDarkdotApi()
  const { substrate } = darkdot;
  const idOrHandle = storefrontId as string
  const storefrontIdFromUrl = await getStorefrontId(idOrHandle)

  const productIdFromUrl = new BN(productId as string)
  const replyIds = await substrate.getReplyIdsByProductId(productIdFromUrl)
  const comments = await darkdot.findPublicProductsWithAllDetails([ ...replyIds, productIdFromUrl ])

  const [ extProductsData, replies ] = partition(comments, x => x.product.struct.id.eq(productIdFromUrl))
  const extProductData = extProductsData.pop() || await darkdot.findProductWithAllDetails(productIdFromUrl)

  const storefrontIdFromProduct = unwrapSubstrateId(extProductData?.product.struct.storefront_id)
  // If a storefront id of this product is not equal to the storefront id/handle from URL,
  // then redirect to the URL with the storefront id of this product.
  if (storefrontIdFromProduct && storefrontIdFromUrl && !storefrontIdFromProduct.eq(storefrontIdFromUrl) && res) {
    res.writeHead(301, { Location: `/${storefrontIdFromProduct.toString()}/products/${productId}` })
    res.end()
  }

  return {
    productDetails: extProductData,
    replies
  }
};

export default ProductPage
