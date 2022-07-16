import React, { useState } from 'react'
import { ViewOrdering } from './ViewOrdering'
import PaginatedTable from 'src/components/lists/PaginatedTable'
import { NextPage } from 'next'
import { HeadMeta } from '../utils/HeadMeta'
import { OrderingData } from '@darkpay/dark-types/dto'
import { OrderingId } from '@darkpay/dark-types/substrate/interfaces'
import { getDarkdotApi } from '../utils/DarkdotConnect'
import useDarkdotEffect from '../api/useDarkdotEffect'
import { isMyAddress, useMyAddress } from '../auth/MyAccountContext'
import { Loading } from '../utils'
import { newLogger } from '@darkpay/dark-utils'
import { return404 } from '../utils/next'
import { getPageOfIds } from '../utils/getIds'
import { useRouter } from 'next/router'


export type LoadOrderingsType = {
  orderingsData: OrderingData[]
  myOrderingIds: OrderingId[]
}

type BaseProps = {
  address: string,
  withTitle?: boolean
}


type LoadOrderingsProps = LoadOrderingsType & BaseProps

type Props = Partial<LoadOrderingsType> & BaseProps

const log = newLogger('AccountOrderings')



export const useLoadAccoutPublicOrderings = (address = useMyAddress()): LoadOrderingsProps | undefined => {

  if (!address) return undefined

  const { query } = useRouter()
  const [ state, setState ] = useState<LoadOrderingsProps>()

  useDarkdotEffect(({ darkdot, substrate }) => {
    const loadMyOrderings = async () => {
      const myOrderingIds = await substrate.getOrderingIdsByOwner(address as string)

      const pageIds = getPageOfIds(myOrderingIds, query)
      const orderingsData = await darkdot.findAllOrderings(pageIds)


      setState({ myOrderingIds, orderingsData, address })
      log.error(orderingsData)

    }

    loadMyOrderings().catch((err) => log.error('Failed load my purchases. Error: %', err))

  }, [ address ])

  return state
}


const OrderingPreview = (ordering: OrderingData) =>
  <ViewOrdering
    key={`ordering-${ordering.struct.id.toString()}`}
    orderingData={ordering}
    withFollowButton
    preview
  />

const PublicOrderings = (props: LoadOrderingsProps) => {
  const { orderingsData, myOrderingIds, address } = props
  const noOrderings = !myOrderingIds.length
  const totalCount = myOrderingIds.length
  const isMy = isMyAddress(address)


  log.warn('orderingsData ==> '+ orderingsData)
  // log.warn(myOrderingIds)

  // log.warn(totalCount)


  // const title = withTitle
  //   ? <span className='d-flex justify-content-between align-items-center w-100 my-2'>
  //     <span>{`Public Orderings (${totalCount})`}</span>
  //     {!noOrderings && isMy }
  //   </span>
  //   : null

  return <PaginatedTable
    title={'My Purchases'}
    totalCount={totalCount}
    dataSource={orderingsData}
    renderItem={OrderingPreview}
    noDataDesc='No purchases found'
    noDataExt={noOrderings && isMy}
  />
}



export const AccountOrderings = ({ myOrderingIds, withTitle = true, ...props}: Props) => {
  const state = myOrderingIds
    ? { myOrderingIds, withTitle, ...props } as LoadOrderingsProps
    : useLoadAccoutPublicOrderings(props.address)

  if (!state) return <Loading label='Loading purchasess'/>

  log.warn(myOrderingIds)

  return <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <PublicOrderings {...state} />
    </div>
}

export const AccountOrderingsPage: NextPage<Props> = (props: Props) => <>
  <HeadMeta title='My purchases' desc={`Darkdot purchases owned by ${props.address}`} />
  <AccountOrderings {...props} />
</>

AccountOrderingsPage.getInitialProps = async (props): Promise<Props> => {
  const { query } = props
  const { address } = query

  if (!address || typeof address !== 'string') {
    return return404(props) as any
  }

  const darkdot = await getDarkdotApi()
  const { substrate } = darkdot
  const myOrderingIds = await substrate.getOrderingIdsByOwner(address)
  const pageIds = getPageOfIds(myOrderingIds, query)
  const orderingsData = await darkdot.findAllOrderings(pageIds)

  return {
    orderingsData,
    myOrderingIds,
    address
  }
}

export const ListMyOrderings = () => {
  const address = useMyAddress()
  const state = useLoadAccoutPublicOrderings(address)

  return state
    ? <AccountOrderings {...state} />
    : <Loading label='Loading your purchases' />
}

export default AccountOrderingsPage
