import { ProductWithSomeDetails, StorefrontData } from '@darkpay/dark-types/dto';
import { ProductId, Storefront } from '@darkpay/dark-types/substrate/interfaces';
import React, { useCallback } from 'react';
import DataList from 'src/components/lists/DataList';
import { InfiniteListByPage } from 'src/components/lists/InfiniteList';
import ProductPreview from 'src/components/products/view-product/ProductPreview';
import { resolveBn } from 'src/components/utils';
import { getPageOfIds } from 'src/components/utils/getIds';
import { Pluralize } from 'src/components/utils/Plularize';
import { useDarkdotApi } from 'src/components/utils/DarkdotApiContext';
import { isMyStorefront } from './common';
import { CreateProductButton } from './CreateProductButton';
import { useLoadUnlistedProductsByOwner } from './useLoadUnlistedProductsByOwner';

type Props = {
  storefrontData: StorefrontData
  productIds: ProductId[]
  products: ProductWithSomeDetails[]
}

const UnlistedProducts = ({ storefrontData, productIds }: Props) => {
  const { struct: storefront } = storefrontData
  const { myHiddenProducts, isLoading } = useLoadUnlistedProductsByOwner({ owner: storefront.owner, productIds })

  if (isLoading) return null

  const hiddenProductsCount = myHiddenProducts.length

  return hiddenProductsCount ? <DataList
    title={<Pluralize count={hiddenProductsCount} singularText={'Unlisted product'} />}
    dataSource={myHiddenProducts}
    renderItem={(item) =>
      <ProductPreview
        key={item.product.struct.id.toString()}
        productDetails={item}
        storefront={storefrontData}
        withActions
      />
    }
  /> : null
}

const getPublicProductsCount = (storefront: Storefront): number =>
  resolveBn(storefront.products_count)
    .sub(resolveBn(storefront.hidden_products_count))
    .toNumber()

export const ProductPreviewsOnStorefront = (props: Props) => {
  const { storefrontData, products, productIds } = props
  const { struct: storefront } = storefrontData
  const publicProductsCount = getPublicProductsCount(storefront)
  const { isApiReady, darkdot } = useDarkdotApi()

  const productsSectionTitle = () =>
    <div className='w-100 d-flex justify-content-between align-items-baseline'>
      <span style={{ marginRight: '1rem' }}>
        <Pluralize count={publicProductsCount} singularText='Product'/>
      </span>
      {publicProductsCount > 0 &&
        <CreateProductButton storefront={storefront} title={'Add Product'} className='mb-2' />
      }
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
      noDataExt={isMyStorefront(storefront)
        ? <CreateProductButton storefront={storefront} />
        : null
      }
      renderItem={(item: ProductWithSomeDetails) =>
        <ProductPreview
          key={item.product.struct.id.toString()}
          productDetails={item}
          storefront={storefrontData}
          withActions
        />
      }
    />, [ isApiReady ])

  return <>
    <PublicProducts />
    <UnlistedProducts {...props} />
  </>
}
