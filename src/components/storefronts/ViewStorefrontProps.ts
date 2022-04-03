import BN from 'bn.js'
import { GenericAccountId as AccountId } from '@polkadot/types'
import { StorefrontData, ProductWithSomeDetails, ProfileData } from '@darkpay/dark-types/dto'
import { ProductId } from '@darkpay/dark-types/substrate/interfaces'

export type ViewStorefrontProps = {
  nameOnly?: boolean
  miniPreview?: boolean
  preview?: boolean
  dropdownPreview?: boolean
  withLink?: boolean
  withFollowButton?: boolean
  withTags?: boolean
  withStats?: boolean
  id?: BN
  storefrontData?: StorefrontData
  owner?: ProfileData,
  productIds?: ProductId[],
  products?: ProductWithSomeDetails[]
  followers?: AccountId[]
  imageSize?: number
  onClick?: () => void
  statusCode?: number
}
