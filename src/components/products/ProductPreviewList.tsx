import React, { useState } from 'react';
import BN from 'bn.js';
import { Loading } from '../utils';
import useDarkdotEffect from '../api/useDarkdotEffect';
import { ProductWithAllDetails } from '@darkpay/dark-types';
import ProductPreview from './view-product/ProductPreview';

type OuterProps = {
  productIds: BN[]
}

type ResolvedProps = {
  products: ProductWithAllDetails[]
}

export function withLoadProductsWithStorefronts<P extends OuterProps> (Component: React.ComponentType<ResolvedProps>) {
  return function (props: P) {
    const { productIds } = props
    const [ products, setProducts ] = useState<ProductWithAllDetails[]>()
    const [ loaded, setLoaded ] = useState(false)

    useDarkdotEffect(({ darkdot }) => {
      const loadData = async () => {
        const extProductData = await darkdot.findPublicProductsWithAllDetails(productIds)
        extProductData && setProducts(extProductData)
        setLoaded(true)
      };

      loadData().catch(console.warn)
    }, [ false ])

    return loaded && products
      ? <Component products={products} />
      : <Loading />
  }
}

const InnerProductPreviewList: React.FunctionComponent<ResolvedProps> = ({ products }) =>
  <>{products.map(x => <ProductPreview key={x.product.struct.id.toString()} productDetails={x} withActions />)}</>

export const ProductPreviewList = withLoadProductsWithStorefronts(InnerProductPreviewList)
