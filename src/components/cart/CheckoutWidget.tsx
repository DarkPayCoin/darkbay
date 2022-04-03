import { ShoppingCartOutlined } from '@ant-design/icons'
import { ButtonProps } from 'antd/lib/button'
import React from 'react'
import ButtonLink from 'src/components/utils/ButtonLink'
import { CheckoutButtonTotal  } from './CheckoutButtonTotal'




export const CheckoutButton = ({
  children,
  type = 'primary',
  ghost = true,
  ...otherProps
}: ButtonProps) => {


  const props = { type, ghost, ...otherProps }
  const cartPath = '/cart'



  


  return <ButtonLink href={cartPath} {...props}>
    {<span><ShoppingCartOutlined /> <CheckoutButtonTotal /></span>}
  </ButtonLink>
}
