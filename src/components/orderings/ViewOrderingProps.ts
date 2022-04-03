import { GenericAccountId as AccountId } from '@polkadot/types'
import { OrderingData, ProductWithSomeDetails, ProfileData } from '@darkpay/dark-types/dto'
import { OrderingId, ProductId } from '@darkpay/dark-types/substrate/interfaces'

export type ViewOrderingProps = {
  nameOnly?: boolean
  miniPreview?: boolean
  preview?: boolean
  dropdownPreview?: boolean
  withLink?: boolean
  withFollowButton?: boolean
  withTags?: boolean
  withStats?: boolean
  id?: OrderingId
  orderingData?: OrderingData
  owner?: ProfileData,
  productIds?: ProductId[],
  products?: ProductWithSomeDetails[]
  followers?: AccountId[]
  imageSize?: number
  onClick?: () => void
  statusCode?: number
}
