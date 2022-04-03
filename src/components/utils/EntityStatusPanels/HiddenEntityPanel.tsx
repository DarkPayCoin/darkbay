import { Product, Storefront } from '@darkpay/dark-types/substrate/interfaces'
import React from 'react'
import { isMyAddress } from 'src/components/auth/MyAccountContext'
import HiddenProductButton from 'src/components/products/HiddenProductButton'
import HiddenStorefrontButton from 'src/components/storefronts/HiddenStorefrontButton'
import { EntityStatusPanel, EntityStatusProps } from './EntityStatusPanel'

type Props = EntityStatusProps & {
  type: 'storefront' | 'product' | 'comment'
  struct: Storefront | Product
}

export const HiddenEntityPanel = ({
  type,
  struct,
  ...otherProps
}: Props) => {

  // If entity is not hidden or it's not my entity
  if (!struct.hidden.valueOf() || !isMyAddress(struct.owner)) return null

  const HiddenButton = () => type === 'storefront'
    ? <HiddenStorefrontButton storefront={struct as Storefront} />
    : <HiddenProductButton product={struct as Product} />

  return <EntityStatusPanel
    desc={`This ${type} is unlisted and only you can see it`}
    actions={[ <HiddenButton key='hidden-btn' /> ]}
    {...otherProps}
  />
}

export default HiddenEntityPanel
