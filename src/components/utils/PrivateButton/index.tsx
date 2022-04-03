import React from 'react';
import { Storefront } from '@darkpay/dark-types/substrate/interfaces';
import { TxCallback } from 'src/components/substrate/SubstrateTxButton';
import { TxDiv } from 'src/components/substrate/TxDiv';
import TxButton from 'src/components/utils/TxButton'
import Router from 'next/router'

export type FSetVisible = (visible: boolean) => void

type PrivateButtonProps = {
  struct: Storefront,
  newTxParams: () => any[]
  type: 'storefront',
  setVisibility?: FSetVisible
  label?: string,
  asLink?: boolean
}

export function PrivateButton (props: PrivateButtonProps) {
  const { struct, newTxParams, label, type, asLink, setVisibility } = props
  const privateState = struct.private

  const extrinsic = 'storefront'

  const onTxSuccess: TxCallback = () => {
    setVisibility && setVisibility(!privateState);
    Router.reload()
  }

  const TxAction = asLink ? TxDiv : TxButton

  return <TxAction
    className={asLink ? 'm-0' : ''}
    label={label || privateState
      ? 'Make public'
      : `Private (subscription-only) ${type}`
    }
    size='small'
    params={newTxParams}
    tx={extrinsic}
    onSuccess={onTxSuccess}
    failedMessage={`Failed to make private your ${type}`}
  />
}

export default PrivateButton;
