import { EllipsisOutlined } from '@ant-design/icons'
import { OrderingData } from '@darkpay/dark-types/dto'
import { Dropdown, Menu } from 'antd'
import Link from 'next/link'
import React from 'react'
import { BareProps } from 'src/components/utils/types'
import { isMyOrdering } from './common'

type Props = BareProps & {
  orderingData: OrderingData
  vertical?: boolean
}

export const DropdownMenu = (props: Props) => {
  const { orderingData: { struct }, vertical, style, className } = props
  const { id } = struct
  const orderingKey = `ordering-${id.toString()}`

  const buildMenu = () =>
    <Menu>
      <Menu.Item key={`edit-ordering-${orderingKey}`}>
        <Link href={`/[orderingId]/edit`} >
          <a className='item'>Edit ordering</a>
        </Link>
      </Menu.Item>
      {/* <Menu.Item key={`edit-nav-${orderingKey}`}>
        <EditMenuLink ordering={struct} className='item' />
      </Menu.Item> */}
    </Menu>

  return isMyOrdering(struct)
    ? <Dropdown overlay={buildMenu()} placement='bottomRight'>
      <EllipsisOutlined rotate={vertical ? 90 : 0} style={style} className={className} />
    </Dropdown>
    : null
}
