import React from 'react'
import { HasOrderingId} from 'src/components/urls'
import BaseAvatar, { BaseAvatarProps } from 'src/components/utils/DfAvatar'

type Props = BaseAvatarProps & {
  ordering: HasOrderingId
  asLink?: boolean
}

export const OrderingAvatar = ({ asLink = true, ...props }: Props) => asLink
  ?  <BaseAvatar {...props} />
  : <BaseAvatar {...props} />
