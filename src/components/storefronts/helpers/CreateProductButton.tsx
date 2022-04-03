import { PlusOutlined } from '@ant-design/icons'
import { ButtonProps } from 'antd/lib/button'
import React from 'react'
import { isMyAddress } from 'src/components/auth/MyAccountContext'
import ButtonLink from 'src/components/utils/ButtonLink'
import { createNewProductLinkProps, isHiddenStorefront, StorefrontProps } from './common'

type Props = StorefrontProps & ButtonProps & {
  title?: React.ReactNode
}

export const CreateProductButton = (props: Props) => {
  const { storefront, title = 'Create product' } = props

  if (isHiddenStorefront(storefront)) return null

  return isMyAddress(storefront.owner)
    ? <ButtonLink
      {...props}
      type='primary'
      icon={<PlusOutlined />}
      ghost
      {...createNewProductLinkProps(storefront)}
    >
      {' '}{title}
    </ButtonLink>
    : null
}
