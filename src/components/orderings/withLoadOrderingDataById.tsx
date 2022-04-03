import React, { useState } from 'react';
import useDarkdotEffect from '../api/useDarkdotEffect';
import { Loading } from '../utils';
import NoData from '../utils/EmptyList';
import { OrderingData, ProfileData } from '@darkpay/dark-types/dto'
import { ViewOrderingProps } from './ViewOrderingProps';

type Props = ViewOrderingProps

// TODO Copypasta. See withLoadOrderingFromUrl
export const withLoadOrderingDataById = (Component: React.ComponentType<Props>) => {
  return (props: Props) => {
    const { id } = props

    if (!id) return <NoData description={<span>Ordering id is undefined</span>} />

    const [ orderingData, setOrderingData ] = useState<OrderingData>()
    const [ owner, setOwner ] = useState<ProfileData>()

    useDarkdotEffect(({ darkdot }) => {
      const loadData = async () => {
        const orderingData = await darkdot.findOrdering( id )
        if (orderingData) {
          setOrderingData(orderingData)
          const ownerId = orderingData.struct.owner
          const owner = await darkdot.findProfile(ownerId)
          setOwner(owner);
        }
      }
      loadData()
    }, [ false ])

    return orderingData?.content
      ? <Component orderingData={orderingData} owner={owner} {...props}/>
      : <Loading />
  }
}

export default withLoadOrderingDataById
