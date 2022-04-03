import React from 'react';
import { isDef } from '@darkpay/dark-utils';
import { LoadMoreFn } from './NotificationUtils';
import { ProductWithAllDetails } from '@darkpay/dark-types';
import ProductPreview from '../products/view-product/ProductPreview';
import { LoadMoreProps, ActivityProps } from './types';
import { DarkdotApi } from '@darkpay/dark-api/api/darkdot';
import BN from 'bn.js'
import { InnerActivities } from './InnerActivities';

const productsFromActivity = async (darkdot: DarkdotApi, productIds: BN[]): Promise<ProductWithAllDetails[]> => {
  const products = await darkdot.findPublicProductsWithAllDetails(productIds)

  return products.filter(x => isDef(x.storefront))
}

export const getLoadMoreFeedFn = (getActivity: LoadMoreFn, keyId: 'product_id' | 'comment_id') =>
  async (props: LoadMoreProps) => {
    const { darkdot, address, page, size } = props

    if (!address) return []

    const offset = (page - 1) * size
    const activity = await getActivity(address, offset, size) || []
    const productIds = activity
      .filter(x => x[keyId] !== undefined)
      .map(x => new BN(x[keyId] as string))

    return productsFromActivity(darkdot, productIds)
  }

export const FeedActivities = (props: ActivityProps<ProductWithAllDetails>) => <InnerActivities
  {...props}
  renderItem={(x: ProductWithAllDetails) =>
    <ProductPreview key={x.product.struct.id.toString()} productDetails={x} withActions />}
/>



