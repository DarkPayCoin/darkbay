import React from 'react';
import { ProductWithAllDetails } from '@darkpay/dark-types';
import ProductPreview from '../products/view-product/ProductPreview';
import DataList from '../lists/DataList';

type Props = {
  productsData: ProductWithAllDetails[]
  type: 'product' | 'comment'
}

export const LatestProducts = (props: Props) => {
  const { productsData = [], type } = props
  const products = productsData.filter((x) => typeof x.product.struct !== 'undefined')

  if (products.length === 0) {
    return null
  }

  return <DataList
    title={`Latest ${type}s`}
    dataSource={productsData}
    renderItem={(item) =>
      <ProductPreview productDetails={item} withActions />
    }
  />
}
