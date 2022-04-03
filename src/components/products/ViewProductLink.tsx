import React from 'react'
import Link from 'next/link'
import { HasStorefrontIdOrHandle, HasProductId, productUrl } from '../urls'

type Props = {
  storefront: HasStorefrontIdOrHandle
  product: HasProductId
  title?: string
  hint?: string
  className?: string
}

export const ViewProductLink = ({
  storefront,
  product,
  title,
  hint,
  className
}: Props) => {

  if (!storefront.id || !product.id || !title) return null

  return (
    <Link href='/[storefrontId]/products/[productId]' as={productUrl(storefront, product)}>
      <a className={className} title={hint}>{title}</a>
    </Link>
  )
}

export default ViewProductLink
