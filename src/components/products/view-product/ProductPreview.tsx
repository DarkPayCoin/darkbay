import React from 'react';
import { RegularPreview, SharedPreview, HiddenProductAlert } from '.';
import { ProductWithSomeDetails, ProductWithAllDetails, StorefrontData } from '@darkpay/dark-types';
import { ProductExtension } from '@darkpay/dark-types/substrate/classes';
import { Segment } from 'src/components/utils/Segment';
import { isSharedProduct, withSubscribedProduct } from './helpers';

export type BarePreviewProps = {
  withTags?: boolean,
  withActions?: boolean,
  replies?: ProductWithAllDetails[],
  asRegularProduct?: boolean
}

export type PreviewProps = BarePreviewProps & {
  productDetails: ProductWithSomeDetails,
  storefront?: StorefrontData
}

export function ProductPreview (props: PreviewProps) {
  const { productDetails, storefront: externalStorefront, asRegularProduct } = props
  const { storefront: globalStorefront, product: { struct } } = productDetails
  const { extension } = struct
  const storefront = externalStorefront || globalStorefront

  if (!storefront) return null

  return <Segment className='DfProductPreview'>
    <HiddenProductAlert product={struct} storefront={storefront} preview />
    {asRegularProduct || !isSharedProduct(extension as ProductExtension)
      ? <RegularPreview storefront={storefront} {...props} />
      : <SharedPreview storefront={storefront} {...props} />
    }
  </Segment>
}

export default withSubscribedProduct(ProductPreview)
