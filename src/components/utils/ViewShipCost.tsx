import { isEmptyStr } from '@darkpay/dark-utils';
import React from 'react';

type ViewShipCostProps = {
  shipcost?: number
}

const ViewShipCost = React.memo(({ shipcost }: ViewShipCostProps) => {

const shipcost$ = shipcost?.toFixed(2)

  return isEmptyStr(shipcost)
    ? null
    : <span>$ {shipcost$}</span>
 
})



export default ViewShipCost
