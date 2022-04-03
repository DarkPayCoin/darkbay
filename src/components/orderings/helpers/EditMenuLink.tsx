import { BareProps } from 'src/components/utils/types'
import { OrderingProps } from './common'

type Props = BareProps & OrderingProps & {
  withIcon?: boolean
}

export const EditMenuLink = ({ ordering: { id, owner }, withIcon }: Props) => /* isMyAddress(owner)
  ? <div className='OrderingNavSettings'>
    <Link
      href='/[orderingId]/ordering-navigation/edit'
      as={`/orderings/${id}/ordering-navigation/edit`}
    >
      <a className='DfSecondaryColor'>
        {withIcon && <SettingOutlined className='mr-2' />}
        Edit menu
      </a>
    </Link>
  </div>
  : */ null
