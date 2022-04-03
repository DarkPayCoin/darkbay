import React from 'react'
import Link from 'next/link'
import { HasStorefrontIdOrHandle, storefrontUrl } from '../urls'

type Props = {
  storefront: HasStorefrontIdOrHandle
  title?: React.ReactNode
  hint?: string
  className?: string
}

export const ViewStorefrontLink = ({
  storefront,
  title,
  hint,
  className
}: Props) => {

  if (!storefront.id || !title) return null

  return <span>
    <Link href='/[storefrontId]' as={storefrontUrl(storefront)}>
      <a className={'DfBlackLink ' + className} title={hint}>{title}</a>
    </Link>
  </span>
}

export default ViewStorefrontLink
