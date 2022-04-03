import { isHidden } from '@darkpay/dark-api/utils/visibility-filter'
import { Storefront } from '@darkpay/dark-types/substrate/interfaces'
import { isDef } from '@darkpay/dark-utils'
import React from 'react'
import { isMyAddress } from 'src/components/auth/MyAccountContext'
import { newProductUrl } from 'src/components/urls'
import NoData from 'src/components/utils/EmptyList'
import { EntityStatusProps, HiddenEntityPanel } from 'src/components/utils/EntityStatusPanels'

export type StorefrontProps = {
  storefront: Storefront
}

export const isHiddenStorefront = (storefront: Storefront) =>
  isHidden(storefront)

export const isMyStorefront = (storefront?: Storefront) =>
  isDef(storefront) && isMyAddress(storefront.owner)

export const createNewProductLinkProps = (storefront: Storefront) => ({
  href: `/[storefrontId]/products/new`,
  as: newProductUrl(storefront)
})

type StatusProps = EntityStatusProps & {
  storefront: Storefront
}

export const HiddenStorefrontAlert = (props: StatusProps) =>
  <HiddenEntityPanel struct={props.storefront} type='storefront' {...props} />

export const StorefrontNotFound = () =>
  <NoData description={'Storefront not found'} />
