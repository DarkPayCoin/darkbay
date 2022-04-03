import React, { useState } from 'react';
import { newLogger } from '@darkpay/dark-utils';
import { ProductWithAllDetails } from '@darkpay/dark-types/dto';
import useDarkdotEffect from 'src/components/api/useDarkdotEffect';
import { InnerPreviewProps } from './ViewRegularPreview';
import ProductPreview, { BarePreviewProps } from './ProductPreview';
import { AnyProductId } from '@darkpay/dark-types';

const log = newLogger(DynamicProductPreview.name)

export type DynamicPreviewProps = BarePreviewProps & {
  id: AnyProductId
}

export function DynamicProductPreview ({ id, withActions, replies, asRegularProduct }: DynamicPreviewProps) {
  const [ productDetails, setProductStruct ] = useState<ProductWithAllDetails>()

  useDarkdotEffect(({ darkdot }) => {
    let isSubscribe = true

    const loadProduct = async () => {
      const extProductData = id && await darkdot.findProductWithAllDetails(id)
      isSubscribe && setProductStruct(extProductData)
    }

    loadProduct().catch(err => log.error(`Failed to load product data. ${err}`))

    return () => { isSubscribe = false }
  }, [ false ])

  if (!productDetails) return null

  const props = {
    productDetails: productDetails,
    storefront: productDetails.storefront,
    withActions: withActions,
    replies: replies,
    asRegularProduct: asRegularProduct
  } as InnerPreviewProps

  return <ProductPreview {...props} />
}
