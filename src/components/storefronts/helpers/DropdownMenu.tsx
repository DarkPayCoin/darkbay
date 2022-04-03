import { EllipsisOutlined } from '@ant-design/icons'
import { StorefrontData } from '@darkpay/dark-types/dto'
import { Dropdown, Menu } from 'antd'
import Link from 'next/link'
import React from 'react'
import { editStorefrontUrl } from 'src/components/urls'
import { BareProps } from 'src/components/utils/types'
import HiddenStorefrontButton from '../HiddenStorefrontButton'
import { TransferOwnershipLink } from '../TransferStorefrontOwnership'
import { isHiddenStorefront, createNewProductLinkProps, isMyStorefront } from './common'

type Props = BareProps & {
  storefrontData: StorefrontData
  vertical?: boolean
}

export const DropdownMenu = (props: Props) => {
  const { storefrontData: { struct }, vertical, style, className } = props
  const { id } = struct
  const storefrontKey = `storefront-${id.toString()}`

  const buildMenu = () =>
    <Menu>
      <Menu.Item key={`edit-storefront-${storefrontKey}`}>
        <Link href={`/[storefrontId]/edit`} as={editStorefrontUrl(struct)}>
          <a className='item'>Edit storefront</a>
        </Link>
      </Menu.Item>
      {/* <Menu.Item key={`edit-nav-${storefrontKey}`}>
        <EditMenuLink storefront={struct} className='item' />
      </Menu.Item> */}
      {isHiddenStorefront(struct)
        ? null
        : <Menu.Item key={`create-product-${storefrontKey}`}>
          <Link {...createNewProductLinkProps(struct)}>
            <a className='item'>Add product</a>
          </Link>
        </Menu.Item>
      }
      <Menu.Item key={`hidden-${storefrontKey}`}>
        <HiddenStorefrontButton storefront={struct} asLink />
      </Menu.Item>
      {<Menu.Item key={`transfer-ownership-${storefrontKey}`}>
        <TransferOwnershipLink storefront={struct} />
      </Menu.Item>}
    </Menu>

  return isMyStorefront(struct)
    ? <Dropdown overlay={buildMenu()} placement='bottomRight'>
      <EllipsisOutlined rotate={vertical ? 90 : 0} style={style} className={className} />
    </Dropdown>
    : null
}
