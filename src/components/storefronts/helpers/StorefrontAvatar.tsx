import React from 'react'
import { HasStorefrontIdOrHandle } from 'src/components/urls'
import BaseAvatar, { BaseAvatarProps } from 'src/components/utils/DfAvatar'
import ViewStorefrontLink from '../ViewStorefrontLink'

type Props = BaseAvatarProps & {
  storefront: HasStorefrontIdOrHandle
  asLink?: boolean
}

export const StorefrontAvatar = ({ asLink = true, ...props }: Props) => asLink
  ? <ViewStorefrontLink storefront={props.storefront} title={<BaseAvatar {...props} />} />
  : <BaseAvatar {...props} />
