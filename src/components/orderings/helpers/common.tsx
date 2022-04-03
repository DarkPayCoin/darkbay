
import { Ordering } from '@darkpay/dark-types/substrate/interfaces'
import { isDef } from '@darkpay/dark-utils'
import React from 'react'
import { isMyAddress } from 'src/components/auth/MyAccountContext'

import NoData from 'src/components/utils/EmptyList'
//import { EntityStatusProps } from 'src/components/utils/EntityStatusPanels'

export type OrderingProps = {
  ordering: Ordering
}


export const isMyOrdering = (ordering?: Ordering) =>
  isDef(ordering) && isMyAddress(ordering.owner)



// type StatusProps = EntityStatusProps & {
//   ordering: Ordering
// }


export const OrderingNotFound = () =>
  <NoData description={'Ordering not found'} />
