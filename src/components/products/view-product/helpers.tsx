
import React, { useState } from 'react';
import Link from 'next/link';
import { isEmptyStr, summarize } from '@darkpay/dark-utils';
import { formatUnixDate, IconWithLabel, isVisible } from '../../utils';
import { ViewStorefront } from '../../storefronts/ViewStorefront';
import { DfBgImageLink } from '../../utils/DfBgImg';
import isEmpty from 'lodash.isempty';
import { EditOutlined, EllipsisOutlined, MessageOutlined } from '@ant-design/icons';
import { Menu, Dropdown, Button } from 'antd';
import { isMyAddress } from '../../auth/MyAccountContext';
import { Product, Storefront, ProductExtension, ProductId } from '@darkpay/dark-types/substrate/interfaces';
import { StorefrontData, ProductWithSomeDetails, ProductWithAllDetails, ProductData } from '@darkpay/dark-types/dto';
import { ProductContent as ProductContentType } from '@darkpay/dark-types';
import AuthorPreview from '../../profiles/address-views/AuthorPreview';
import SummarizeMd from '../../utils/md/SummarizeMd';
import ViewProductLink from '../ViewProductLink';
import HiddenProductButton from '../HiddenProductButton';
import NoData from 'src/components/utils/EmptyList';
import { VoterButtons } from 'src/components/voting/VoterButtons';
import Segment from 'src/components/utils/Segment';
import { RegularPreview, ProductDetailsProps } from '.';
import { ProductVoters, ActiveVoters } from 'src/components/voting/ListVoters';
import { isHidden } from '@darkpay/dark-api/utils/visibility-filter';
import useDarkdotEffect from 'src/components/api/useDarkdotEffect';
import { PreviewProps } from './ProductPreview';
import { Option } from '@polkadot/types'
import { resolveIpfsUrl } from 'src/ipfs';
import { useIsMobileWidthOrDevice } from 'src/components/responsive';
import { productUrl, editProductUrl, HasStorefrontIdOrHandle, HasProductId } from 'src/components/urls';
import { ShareDropdown } from '../share/ShareDropdown';
import { ButtonLink } from 'src/components/utils/ButtonLink';
import { DfMd } from 'src/components/utils/DfMd';
import { EntityStatusProps, HiddenEntityPanel } from 'src/components/utils/EntityStatusPanels';
import MoveProductLink from '../MoveProductLink';
import ProductPriceToDark from './ProductPriceToDark';
import AddToCartWidget from 'src/components/cart/AddToCartWidget';
import { mdToText } from 'src/utils';

type DropdownProps = {
  storefront: Storefront
  productDetails: ProductWithSomeDetails
  withEditButton?: boolean
}

export const isRegularProduct = (extension: ProductExtension): boolean => extension.isRegularProduct || (extension as any).RegularProduct === null; // Hack because SSR serializes objects and this drops all methods.
export const isSharedProduct = (extension: ProductExtension): boolean => extension.isSharedProduct || (extension as any).SharedProduct;
export const isComment = (extension: ProductExtension): boolean => extension.isComment || (extension as any).Comment;

type ReactionModalProps = {
  productId: ProductId
}

const ReactionModal = ({ productId }: ReactionModalProps) => {
  const [ open, setOpen ] = useState(false)

  return <>
    <span onClick={() => setOpen(true)}>View reactions</span>
    <ProductVoters id={productId} active={ActiveVoters.All} open={open} close={() => setOpen(false)} />
  </>
}

export const ProductDropDownMenu: React.FunctionComponent<DropdownProps> = (props) => {
  const { storefront, productDetails, withEditButton = false } = props
  const { product: { struct: product } } = productDetails
  const isMyProduct = isMyAddress(product.owner);
  const productId = product.id
  const productKey = `product-${productId.toString()}`

  const editProductProps = {
    href: '/[storefrontId]/products/[productId]/edit',
    as: editProductUrl(storefront, product)
  }

  const menu = (
    <Menu>
      {isMyProduct && <Menu.Item key={`edit-${productKey}`}>
        <Link {...editProductProps}>
          <a className='item'>Edit product</a>
        </Link>
      </Menu.Item>}
      {isMyProduct && <Menu.Item key={`hidden-${productKey}`}>
        <HiddenProductButton product={product} asLink />
      </Menu.Item>}
      {isMyProduct && !isComment(product.extension) && <Menu.Item key={`move-${productKey}`}>
        <MoveProductLink product={product} />
      </Menu.Item>}
      <Menu.Item key={`view-reaction-${productKey}`} >
        <ReactionModal productId={productId} />
      </Menu.Item>
      {/* {edit_history.length > 0 && <Menu.Item key='1'>
          <div onClick={() => setOpen(true)} >View edit history</div>
        </Menu.Item>} */}
    </Menu>
  )

  return <div className='text-nowrap'>
    <Dropdown overlay={menu} placement='bottomRight' className='mx-2'>
      <EllipsisOutlined />
    </Dropdown>
    {withEditButton && isMyProduct &&
      <ButtonLink {...editProductProps} className='bg-transparent'>
        <EditOutlined /> Edit
      </ButtonLink>
    }
    {/* open && <ProductHistoryModal id={id} open={open} close={close} /> */}
  </div>
}

type HiddenProductAlertProps = EntityStatusProps & {
  product: Product,
  storefront?: StorefrontData
}

export const HiddenProductAlert = (props: HiddenProductAlertProps) => {
  const { product } = props
  const kind = isComment(product.extension) ? 'comment' : 'product'
  const ProductAlert = () => <HiddenEntityPanel struct={product} type={kind} {...props} />

  // TODO fix view Storefront alert when storefront is hidden
  // const StorefrontAlert = () => storefront && !isOnlyVisible(storefront.struct) ? <HiddenEntityPanel preview={preview} struct={storefront.struct} type='storefront' desc='This product is not visible because its storefront is hidden.' /> : null

  return <ProductAlert />
}

export const renderProductLink = (storefront: HasStorefrontIdOrHandle, product: HasProductId, title?: string) =>
  <ViewProductLink storefront={storefront} product={product} title={title} className='DfBlackLink' />

type ProductNameProps = {
  storefront: HasStorefrontIdOrHandle,
  product: HasProductId,
  title?: string,
  withLink?: boolean
}

export const ProductName: React.FunctionComponent<ProductNameProps> = ({ storefront, product, title, withLink }) => {
  if (!storefront?.id || !product?.id || !title) return null

  return (
    <div className={'header DfProductTitle--preview'}>
      {withLink ? renderProductLink(storefront, product, title) : title}
    </div>
  )
}

type ProductCreatorProps = {
  productDetails: ProductWithSomeDetails,
  withStorefrontName: boolean,
  storefront?: StorefrontData
  size?: number,
}

export const ProductCreator: React.FunctionComponent<ProductCreatorProps> = ({ productDetails, size, withStorefrontName, storefront }) => {
  if (isEmpty(productDetails.product)) return null;
  const { product: { struct  }, owner } = productDetails;
  const { created: { time }, owner: productOwnerAddress } = struct;

  // TODO replace on loaded storefront after refactor this components

  return <>
    <AuthorPreview
      address={productOwnerAddress}
      owner={owner}
      withFollowButton
      isShort={true}
      isPadded={false}
      size={size}
      //afterName={productOwnerAddress}
      details={<div>
         {withStorefrontName && storefront && <>
          <div className='DfGreyLink'>
            <ViewStorefront storefrontData={storefront} nameOnly withLink />
          </div>{' • '}</>
        }
        {storefront && <Link href='/[storefrontId]/products/[productId]' as={productUrl(storefront.struct, struct)}>
          <a className='DfGreyLink'>
            {formatUnixDate(time)}
          </a>
        </Link>}
      </div>}
    />
  </>;
};

type ProductImageProps = {
  product: ProductData,
  storefront: Storefront
}

const ProductImage = ({ product: { content, struct }, storefront }: ProductImageProps) => {
  // const isMobile = useIsMobileWidthOrDevice()
  const image = content?.image

  if (!image || isEmptyStr(image)) return null

  return <DfBgImageLink
    href={'/[storefrontId]/products/[productId]'}
    as={productUrl(storefront, struct)}
    src={resolveIpfsUrl(image)}
    className='ProductImagePreview'
    // TODO add onError handler
    // TODO lazy load image.
  />
}

type ProductContentProps = {
  productDetails: ProductWithSomeDetails,
  storefront: Storefront,
  content?: ProductContentType
  withImage?: boolean
}

export const ProductContent: React.FunctionComponent<ProductContentProps> = (props) => {
  const { productDetails, content, storefront, withImage } = props
  const isMobile = useIsMobileWidthOrDevice()

  if (!productDetails) return null

  const { product: { struct: product } } = productDetails
  const productContent = content || productDetails.product.content

  if (!productContent) return null

  const { title, body } = productContent

  return <div className='DfContent'>
    {isMobile && withImage && <ProductImage product={productDetails.product} storefront={storefront} />}
    <ProductName storefront={storefront} product={product} title={title} withLink />
    <SummarizeMd md={body} more={renderProductLink(storefront, product, 'See More')} />
  </div>
}

type ProductActionsPanelProps = {
  productDetails: ProductWithSomeDetails,
  storefront: Storefront,
  toogleCommentSection?: () => void,
  preview?: boolean,
  withBorder?: boolean
}

const ShowCommentsAction = ({ productDetails, preview, toogleCommentSection }: ProductActionsPanelProps) => {
  const { product: { struct: { replies_count } } } = productDetails
  const title = 'Comment'

  return <Action onClick={toogleCommentSection} title={title}>
    <IconWithLabel
      icon={<MessageOutlined />}
      count={replies_count}
      label={!preview ? title : undefined}
    />
  </Action>
}

const Action: React.FunctionComponent<{ onClick?: () => void, title?: string }> =
  ({ children, onClick, title }) =>
    <Button onClick={onClick} title={title} className='DfAction'>{children}</Button>

export const ProductActionsPanel: React.FunctionComponent<ProductActionsPanelProps> = (props) => {
  const { productDetails, storefront, preview, withBorder } = props
  const { product: { struct } } = productDetails;

  const ReactionsAction = () =>
    <VoterButtons product={struct} className='DfAction' preview={preview} />

  return (
    <div className={`DfActionsPanel ${withBorder && 'DfActionBorder'}`}>
      {preview
        ? <ReactionsAction />
        : <div className='d-flex DfReactionsAction'>
          <ReactionsAction />
        </div>}
      {preview && <ShowCommentsAction {...props} />}
      <ShareDropdown productDetails={productDetails} storefront={storefront} className='DfAction' preview={preview} />
    </div>
  );
};

type ProductPreviewProps = {
  productDetails: ProductWithSomeDetails
  storefront: StorefrontData
  withImage?: boolean
  withTags?: boolean
}

const SharedProductMd = (props: ProductPreviewProps) => {
  const { productDetails, storefront } = props
  const { product: { struct, content } } = productDetails

  return isComment(struct.extension)
    ? <DfMd source={content?.body} className='DfProductBody' />
    : <SummarizeMd md={content?.body} more={renderProductLink(storefront.struct, struct, 'See More')} />
}

export const ShareProductContent = (props: ProductPreviewProps) => {
  const { productDetails: { ext } } = props

  const OriginalProduct = () => {
    if (!ext || !ext.storefront) return <ProductNotFound />

    const originalProduct = ext.product.struct

    return <>
      {isVisible({ struct: originalProduct, address: originalProduct.owner })
        ? <RegularPreview productDetails={ext as ProductWithAllDetails} storefront={ext.storefront} />
        : <ProductNotFound />
      }
    </>
  }

  return <div className='DfSharedSummary'>
    <SharedProductMd {...props} />
    <Segment className='ProductPreview'>
      <OriginalProduct />
    </Segment>
  </div>
}

export const InfoProductPreview: React.FunctionComponent<ProductPreviewProps> = (props) => {
  // const { productDetails, storefront, withImage = true, withTags } = props
  // const { product: { struct, content } } = productDetails
  const { productDetails, storefront } = props

  if (!productDetails) return null

  const { product: { struct: product } } = productDetails
  const productContent = productDetails.product.content

  if (!productContent) return null

  const { title, body } = productContent
  const productPriceView = ((product.price_usd as any)/100).toFixed(2)

  const summar = summarize(body)




  return <div className='ProductPreviewInner'>
        <ProductImage product={productDetails.product} storefront={storefront.struct} />
        <div className="ProductPreviewHeader">
        <ProductName storefront={storefront.struct} product={product} title={title} withLink /> 
        <ProductDropDownMenu productDetails={productDetails} storefront={storefront.struct} withEditButton />
        </div>
        <div className="ProductPreviewBody">{mdToText(summar)}</div>
        <div className='ProductPreviewPriceCart'>
        <div className='ProductPreviewPriceInfo'>
        <h3 className='fullProductViewPrice'>{productPriceView} $</h3>
        <div><ProductPriceToDark product={productDetails.product} /></div>
        </div>
          <div className='ProductPreviewAddToCart'>
            <AddToCartWidget storefront={storefront.struct} product={productDetails.product} productdetails ={productDetails} title='Add to cart' />
          </div>
          </div>

        </div>
  
  // <div className='DfInfo'>
  //   <div className='DfRow'>
  //     <div className='w-100'>
  //       <div className='DfRow'>
  //         <ProductCreator productDetails={productDetails} storefront={storefront} withStorefrontName />
  //         <ProductDropDownMenu productDetails={productDetails} storefront={storefront.struct} withEditButton />
  //       </div>
  //       {/* <KusamaProposalView proposal={content.ext?.proposal} /> */}
  //       <ProductContent productDetails={productDetails} storefront={storefront.struct} withImage={withImage} />
  //       {withTags && <ViewTags tags={content?.tags} />}
  //       {/* {withStats && <StatsPanel id={product.id}/>} */}
  //     </div>
  //     {!isMobile && withImage && <ProductImage product={productDetails.product} storefront={storefront.struct} />}
  //   </div>
  // </div>
}

export const ProductNotFound = () => <NoData description='Product not found' />

export const isHiddenProduct = (product: Product) => isHidden(product)

export const useSubscribedProduct = (initProduct: Product) => {
  const [ product, setProduct ] = useState(initProduct)

  useDarkdotEffect(({ substrate: { api } }) => {
    let unsub: { (): void | undefined; (): void; }

    const sub = async () => {
      const readyApi = await api;
      unsub = await readyApi.query.products.productById(initProduct.id, (data: Option<Product>) => {
        setProduct(data.unwrapOr(product));
      })
    }

    sub()

    return () => unsub && unsub()
  }, [ initProduct.id.toString() ])

  return product
}

export const withSubscribedProduct = (Component: React.ComponentType<any>) => {
  return (props: PreviewProps | ProductDetailsProps) => {
    const { productDetails } = props
    productDetails.product.struct = useSubscribedProduct(productDetails.product.struct)

    return <Component {...props}/>
  }
}