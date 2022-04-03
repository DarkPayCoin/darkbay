import React from 'react'
import { HasOrderingId } from 'src/components/urls'
import BaseBanner, { BaseBannerProps } from 'src/components/utils/DfBanner'

type Props = BaseBannerProps & {
  ordering: HasOrderingId
  asLink?: boolean
  className?: string
}

export const OrderingBanner = ({ asLink = true, ...props }: Props) => asLink
  ? <BaseBanner {...props} />
  : <BaseBanner {...props} />
