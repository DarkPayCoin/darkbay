import { isEmptyArray, isEmptyStr, nonEmptyStr } from '@darkpay/dark-utils';
import { Tag } from 'antd';
import React from 'react';
import { BaseProps } from '@polkadot/react-identicon/types';

type ViewShipCountryProps = {
  shipzone?: string
}

const ViewShipCountry = React.memo(({ shipzone }: ViewShipCountryProps) => {

  return isEmptyStr(shipzone)
    ? null
    : <Tag key={shipzone} className='mt-3'>
 
    </Tag>
})

type ViewShipCountriesProps = BaseProps & {
  shipzones?: string[]
}

export const ViewShipCountries = React.memo(({
  shipzones = [],
  className = '',
  ...props
}: ViewShipCountriesProps) =>
  isEmptyArray(shipzones)
    ? null
    : <div className={`DfTags ${className}`} {...props}>
      {shipzones.filter(nonEmptyStr).map((shipzone, i) => <ViewShipCountry key={`${shipzone}-${i}`} shipzone={shipzone} />)}
    </div>
)

export default ViewShipCountries
