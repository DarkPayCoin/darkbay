import React from 'react'
import Link from 'next/link'
import { HasStorefrontIdOrHandle, aboutStorefrontUrl } from '../urls'

type Props = {
  storefront: HasStorefrontIdOrHandle
  title?: string
  hint?: string
  className?: string
}

export const AboutStorefrontLink = ({
  storefront,
  title,
  hint,
  className
}: Props) => {

  if (!storefront.id || !title) return null

  return (
    <Link href='/[storefrontId]/about' as={aboutStorefrontUrl(storefront)}>
      <a className={className} title={hint}>{title}</a>
    </Link>
  )
}

export default AboutStorefrontLink
