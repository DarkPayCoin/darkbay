import React from 'react';
import { Storefront, Product } from '@darkpay/dark-types/substrate/interfaces';
import { TxCallback } from 'src/components/substrate/SubstrateTxButton';
import { TxDiv } from 'src/components/substrate/TxDiv';
import TxButton from 'src/components/utils/TxButton'
import Router from 'next/router'

export type FSetVisible = (visible: boolean) => void

type HiddenButtonProps = {
  struct: Storefront | Product,
  newTxParams: () => any[]
  type: 'product' | 'storefront' | 'comment',
  setVisibility?: FSetVisible
  label?: string,
  asLink?: boolean
}

export function HiddenButton (props: HiddenButtonProps) {
  const { struct, newTxParams, label, type, asLink, setVisibility } = props
  const hidden = struct.hidden.valueOf()

  const extrinsic = type === 'storefront' ? 'storefronts.updateStorefront' : 'products.updateProduct'

  const onTxSuccess: TxCallback = () => {
    setVisibility && setVisibility(!hidden);
    Router.reload()
  }

  const TxAction = asLink ? TxDiv : TxButton

  return <TxAction
    className={asLink ? 'm-0' : ''}
    label={label || hidden
      ? 'Make visible'
      : `Hide ${type}`
    }
    size='small'
    params={newTxParams}
    tx={extrinsic}
    onSuccess={onTxSuccess}
    failedMessage={`Failed to hide your ${type}`}
  />
}

export default HiddenButton;
