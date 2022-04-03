import React from 'react'
import { HasStorefrontIdOrHandle } from 'src/components/urls'
import BaseBanner, { BaseBannerProps } from 'src/components/utils/DfBanner'
import ViewStorefrontLink from '../ViewStorefrontLink'

type Props = BaseBannerProps & {
  storefront: HasStorefrontIdOrHandle
  asLink?: boolean
  className?: string
}

export const StorefrontBanner = ({ asLink = true, ...props }: Props) => asLink
  ? <ViewStorefrontLink storefront={props.storefront} className='DfBannerLink' title={<BaseBanner {...props} />} />
  : <BaseBanner {...props} />
