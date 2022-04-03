import { PlusOutlined } from '@ant-design/icons'
import { ButtonProps } from 'antd/lib/button'
import React from 'react'
import ButtonLink from 'src/components/utils/ButtonLink'

export const CreateStorefrontButton = ({
  children,
  type = 'primary',
  ghost = true,
  ...otherProps
}: ButtonProps) => {
  const props = { type, ghost, ...otherProps }
  const newStorefrontPath = '/storefronts/new'

  return <ButtonLink href={newStorefrontPath} as={newStorefrontPath} {...props}>
    {children || <span><PlusOutlined /> Create storefront</span>}
  </ButtonLink>
}
