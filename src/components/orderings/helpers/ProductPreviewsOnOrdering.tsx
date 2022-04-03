import { ProductWithSomeDetails, OrderingData } from '@darkpay/dark-types/dto';
import { ProductId, Ordering } from '@darkpay/dark-types/substrate/interfaces';
import React, { useCallback } from 'react';
import { InfiniteListByPage } from 'src/components/lists/InfiniteList';
import ProductPreview from 'src/components/products/view-product/ProductPreview';
import { resolveBn } from 'src/components/utils';
import { getPageOfIds } from 'src/components/utils/getIds';
import { Pluralize } from 'src/components/utils/Plularize';
import { useDarkdotApi } from 'src/components/utils/DarkdotApiContext';
import { isMyOrdering } from './common';

type Props = {
  orderingData: OrderingData
  productIds: ProductId[]
  products: ProductWithSomeDetails[]
}



const getPublicProductsCount = (ordering: Ordering): number =>
  resolveBn(ordering.id)
    .sub(resolveBn(ordering.id))
    .toNumber()

export const ProductPreviewsOnOrdering = (props: Props) => {
  const { orderingData, products, productIds } = props
  const { struct: ordering } = orderingData
  const publicProductsCount = getPublicProductsCount(ordering)
  const { isApiReady, darkdot } = useDarkdotApi()

  const productsSectionTitle = () =>
    <div className='w-100 d-flex justify-content-between align-items-baseline'>
      <span style={{ marginRight: '1rem' }}>
        <Pluralize count={publicProductsCount} singularText='Product'/>
      </span>
    </div>

  const PublicProducts = useCallback(() =>
    <InfiniteListByPage
      withLoadMoreLink
      loadingLabel='Loading more products...'
      title={productsSectionTitle()}
      dataSource={products}
      loadMore={async (page, size) => {
        if (!isApiReady) return products

        const pageIds = getPageOfIds(productIds, { page, size })

        return darkdot.findPublicProductsWithAllDetails(pageIds)
      }}
      totalCount={publicProductsCount}
      noDataDesc='No products yet'
      noDataExt={isMyOrdering(ordering)
        
      }
      renderItem={(item: ProductWithSomeDetails) =>
        <ProductPreview
          key={item.product.struct.id.toString()}
          productDetails={item}

          withActions
        />
      }
    />, [ isApiReady ])

  return <>
    <PublicProducts />

  </>
}
