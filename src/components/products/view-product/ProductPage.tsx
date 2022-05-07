import React from 'react';
import dynamic from 'next/dynamic';
import { HeadMeta } from '../../utils/HeadMeta';
import { ProductData, ProductWithAllDetails } from '@darkpay/dark-types/dto';
import ViewProductLink from '../ViewProductLink';
import { CommentSection } from '../../comments/CommentsSection';
import { ProductDropDownMenu, ProductCreator, HiddenProductAlert, ProductNotFound, ProductActionsPanel, isComment, useSubscribedProduct } from './helpers';
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
import { useResponsiveSize } from 'src/components/responsive';
import { mdToText } from 'src/utils';
import { ViewStorefront } from 'src/components/storefronts/ViewStorefront';
// import { KusamaProposalView } from 'src/components/kusama/KusamaProposalDesc';
const StatsPanel = dynamic(() => import('../ProductStats'), { ssr: false });
import AddToCartWidget from '../../cart/AddToCartWidget'
import ProductPriceToDark from './ProductPriceToDark';
import { Descriptions } from 'antd';


export type ProductDetailsProps = {
  productDetails: ProductWithAllDetails,
  statusCode?: number,
  replies: ProductWithAllDetails[]
}

export const ProductPage: NextPage<ProductDetailsProps> = ({ productDetails: initialProduct, replies, statusCode }) => {
  if (statusCode === 404) return <Error statusCode={statusCode} />
  if (!initialProduct || isHidden({ struct: initialProduct.product.struct })) return <ProductNotFound />

  const { product, storefront } = initialProduct

  if (!storefront || isHiddenStorefront(storefront.struct)) return <ProductNotFound />

  const { struct: initStruct, content } = product;

  if (!content) return null;

  const { isNotMobile } = useResponsiveSize()
  const struct = useSubscribedProduct(initStruct)
  const productDetails = { ...initialProduct, product: { struct, content } }

  const storefrontData = storefront || productDetails.storefront || useLoadUnlistedStorefront(struct.owner).myHiddenStorefront

  const { title, body, image, canonical, tags, shipzones } = content;

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

const productPriceView = ((product.struct.price_usd as any)/100).toFixed(2)


  return <>
    <PageContent>
        <HeadMeta title={title} desc={mdToText(body)} image={image} canonical={canonical} tags={tags} />
    <div className='ProductMainInfo'>
        <HiddenProductAlert product={product.struct} />
        <div className='FullProductImageRow'>
        <img src={resolveIpfsUrl(image)} className='FullProductImage' /* add onError handler */ />
        </div>
        <div className='FullProductDetailRow'>
          <div className='titleFlex'>
            <div className='titlePart'><h1 className='DfProductName'>{titleMsg}</h1></div>
            <div className='menuPart'><ProductDropDownMenu productDetails={productDetails} storefront={storefrontStruct} withEditButton /></div>

        </div>
        <p className='ProductBody'>{body}</p>
        <div className='ProductPreviewPriceCart'>
        <div className='ProductPreviewPriceInfo'>
        <h3 className='fullProductViewPrice'>{productPriceView} $</h3>
        <div><ProductPriceToDark product={productDetails.product} /></div>
        </div>
          <div className='ProductPreviewAddToCart'>
            <AddToCartWidget storefront={storefront.struct} product={productDetails.product} productdetails ={productDetails} title='Add to cart' />
          </div>
          </div>
         
        <ProductActionsPanel productDetails={productDetails} storefront={storefront.struct} />
        </div>       
      </div>


      <div className='ProductDetails'>
                 <Descriptions title="Additional info" bordered>
                   <Descriptions.Item label="Taxes" span={3}>20 %</Descriptions.Item>
                   {/* <Descriptions.Item label="Shipping cost" span={3}><ViewShipCost shipcost={(parseFloat(struct.shipsto.toString())/100)} /></Descriptions.Item> */}
                   <Descriptions.Item label="Ships to" span={3}>{shipzones}</Descriptions.Item>
                   <Descriptions.Item label="Buyer escrow" span={3}>50%</Descriptions.Item>
                   <Descriptions.Item label="Seller escrow" span={3}>50%</Descriptions.Item>
                 </Descriptions>
        </div>

        <div className='ProductDetails'>
            <div className="ant-descriptions-header"><div className="ant-descriptions-title">Feedback & comments</div></div>

              { <ProductCreator productDetails={productDetails} withStorefrontName storefront={storefrontData} /> }
               {isNotMobile && <StatsPanel id={struct.id} goToCommentsId={goToCommentsId} />}
               <CommentSection product={productDetails} hashId={goToCommentsId} replies={replies} storefront={storefrontStruct} />
        </div>

        <div className='ProductDetails'>
          <div className="ant-descriptions-header"><div className="ant-descriptions-title">Related storefront</div></div>

          <ViewStorefront
            storefrontData={storefrontData}
            withFollowButton
            withTags={false}
            withStats={false}
            preview
          />
        </div>



 

          

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
