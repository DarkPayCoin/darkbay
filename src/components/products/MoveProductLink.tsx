import React, { useState } from 'react'
import { Product } from '@darkpay/dark-types/substrate/interfaces'
import { MoveModal } from 'src/components/products/modals/MoveModal'

type Props = {
  product: Product
}

export const MoveProductLink = ({ product }: Props) => {

  const [ open, setOpen ] = useState<boolean>()
  const title = 'Move product'

  return <>
    <a
      className='DfBlackLink'
      onClick={() => setOpen(true)}
      title={title}
    >
      {title}
    </a>
    <MoveModal product={product} open={open} onClose={() => setOpen(false)} />
  </>
}

export default MoveProductLink
