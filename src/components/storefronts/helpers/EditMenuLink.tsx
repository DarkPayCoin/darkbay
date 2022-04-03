import { BareProps } from 'src/components/utils/types'
import { StorefrontProps } from './common'

type Props = BareProps & StorefrontProps & {
  withIcon?: boolean
}

export const EditMenuLink = ({ storefront: { id, owner }, withIcon }: Props) => /* isMyAddress(owner)
  ? <div className='StorefrontNavSettings'>
    <Link
      href='/[storefrontId]/storefront-navigation/edit'
      as={`/storefronts/${id}/storefront-navigation/edit`}
    >
      <a className='DfSecondaryColor'>
        {withIcon && <SettingOutlined className='mr-2' />}
        Edit menu
      </a>
    </Link>
  </div>
  : */ null
