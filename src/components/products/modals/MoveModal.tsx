import React, { useState } from 'react'
import { withCalls, withMulti, storefrontsQueryToProp } from 'src/components/substrate'
import { Modal } from 'antd'
import Button from 'antd/lib/button'
import { withMyAccount, MyAccountProps } from 'src/components/utils/MyAccount'
import { LabeledValue } from 'antd/lib/select'
import SelectStorefrontPreview from 'src/components/utils/SelectStorefrontPreview'
import BN from 'bn.js'
import { OptionId } from '@darkpay/dark-types/substrate/classes'
import { TxFailedCallback, TxCallback } from 'src/components/substrate/SubstrateTxButton'
import dynamic from 'next/dynamic'
import { isEmptyArray, nonEmptyArr } from '@darkpay/dark-utils';
import { DynamicProductPreview } from 'src/components/products/view-product/DynamicProductPreview'
import { CreateStorefrontButton } from 'src/components/storefronts/helpers'
import { useRouter } from 'next/router'
import { productUrl } from 'src/components/urls/darkdot'
import { Product, ProductId, Storefront, StorefrontId } from '@darkpay/dark-types/substrate/interfaces'
import modalStyles from 'src/components/products/modals/index.module.sass';
import NoData from 'src/components/utils/EmptyList'

const TxButton = dynamic(() => import('src/components/utils/TxButton'), { ssr: false })

type Props = MyAccountProps & {
  product: Product
  storefrontIds?: BN[]
  open: boolean
  onClose: () => void
}

const InnerMoveModal = (props: Props) => {
  const { open, onClose, product, product: { id: productId } } = props
  let { storefrontIds } = props

  if (product.storefront_id?.isSome && storefrontIds) {
    const productStorefrontId = product.storefront_id.unwrap()
    storefrontIds = storefrontIds.filter(storefrontId => !storefrontId.eq(productStorefrontId))
  }

  if (!storefrontIds) {
    return null
  }

  const router = useRouter()

  const [ storefrontId, setStorefrontId ] = useState(storefrontIds[0])

  const onTxFailed: TxFailedCallback = () => {
    // TODO show a failure message
    onClose()
  }

  const onTxSuccess: TxCallback = () => {
    // TODO show a success message
    router.push(
      '/[storefrontId]/products/[productId]',
      productUrl(
        { id: storefrontId as StorefrontId } as Storefront,
        { id: productId as ProductId })
      )
    onClose()
  }

  const newTxParams = () => {
    const storefrontIdOption = new OptionId(storefrontId)
    return [ productId, storefrontIdOption ]
  }

  const renderTxButton = () => nonEmptyArr(storefrontIds)
    ? <TxButton
      type='primary'
      label={'Move'}
      params={newTxParams}
      tx={'products.moveProduct'}
      onFailed={onTxFailed}
      onSuccess={onTxSuccess}
      successMessage='Moved product to another storefront'
      failedMessage='Failed to move product'
    />
    : <CreateStorefrontButton>Create one more storefront</CreateStorefrontButton>

  const renderMoveProductView = () => {
    if (isEmptyArray(storefrontIds)) {
      return <NoData description='You need to have at least one more storefront to move product' />
    }

    return <div className={modalStyles.DfProductActionModalBody}>
      <span className={modalStyles.DfProductActionModalSelector}>
        <SelectStorefrontPreview
          storefrontIds={storefrontIds || []}
          onSelect={saveStorefront}
          imageSize={24}
          defaultValue={storefrontId?.toString()}
        />
      </span>

      <div style={{margin: '0.75rem 0'}}>
        <DynamicProductPreview id={productId} asRegularProduct />
      </div>
    </div>
  }

  const saveStorefront = (value: string | number | LabeledValue) => {
    setStorefrontId(new BN(value as string))
  }

  return <Modal
    onCancel={onClose}
    visible={open}
    title={'Move product to another storefront'}
    className={modalStyles.DfProductActionModal}
    footer={
      <>
        <Button onClick={onClose}>Cancel</Button>
        {renderTxButton()}
      </>
    }
  >
    {renderMoveProductView()}
  </Modal>
}

export const MoveModal = withMulti(
  InnerMoveModal,
  withMyAccount,
  withCalls<Props>(
    storefrontsQueryToProp(`storefrontIdsByOwner`, { paramName: 'address', propName: 'storefrontIds' })
  )
)
