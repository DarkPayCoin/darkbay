import React, { useState } from 'react'
import { ProductWithSomeDetails } from '@darkpay/dark-types/dto';
import { ProductExtension } from '@darkpay/dark-types/substrate/classes';
import { EditOutlined } from '@ant-design/icons';
import { ShareModal } from 'src/components/products/modals/ShareModal'
import { isRegularProduct } from 'src/components/products/view-product';
import { IconWithLabel } from 'src/components/utils';
import { useAuth } from 'src/components/auth/AuthContext';

type Props = {
  productDetails: ProductWithSomeDetails
  title?: React.ReactNode
  preview?: boolean
}

export const StorefrontShareLink = ({
  productDetails: {
    product: { struct: { id, extension } },
    ext
  }
}: Props) => {

  const { openSignInModal, state: { completedSteps: { isSignedIn } } } = useAuth()
  const [ open, setOpen ] = useState<boolean>()
  const productId = isRegularProduct(extension as ProductExtension) ? id : ext && ext.product.struct.id
  const title = 'Duplicate product'

  return <>
    <a
      className='DfBlackLink'
      onClick={() => isSignedIn ? setOpen(true) : openSignInModal('AuthRequired')}
      title={title}
    >
      <IconWithLabel icon={<EditOutlined />} label={title} />
    </a>
    <ShareModal productId={productId} open={open} onClose={() => setOpen(false)} />
  </>
}

export default StorefrontShareLink
