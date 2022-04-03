import { Product, Storefront } from '@darkpay/dark-types/substrate/interfaces'
import React from 'react'
import { isMyAddress } from 'src/components/auth/MyAccountContext'
import PrivateStorefrontButton from 'src/components/storefronts/PrivateStorefrontButton'
import { EntityStatusPanel, EntityStatusProps } from './EntityStatusPanel'

type Props = EntityStatusProps & {
  type: 'storefront'
  struct: Storefront
}

export const PrivateEntityPanel = ({
  type,
  struct,
  ...otherProps
}: Props) => {

  // If entity is not private or it's not my entity
  if (!struct.private.valueOf() || !isMyAddress(struct.owner)) return null

  const PrivateButton = () => 
    <PrivateStorefrontButton storefront={struct as Storefront} />
  
  return <EntityStatusPanel
    desc={`This ${type} is unlisted and only you can see it`}
    actions={[ <PrivateButton key='private-btn' /> ]}
    {...otherProps}
  />
}

export default PrivateEntityPanel
