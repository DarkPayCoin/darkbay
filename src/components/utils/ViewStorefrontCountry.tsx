import { isEmptyStr } from '@darkpay/dark-utils';

import { Tag } from 'antd';
import Link from 'next/link';
import React from 'react';

type ViewStorefrontCountryProps = {
  country?: string
}

const ViewStorefrontCountry = React.memo(({ country }: ViewStorefrontCountryProps) => {
  const searchLink = `/search?q=${country}`

  return isEmptyStr(country)
    ? null
    : <Tag key={country}>
      <Link href={searchLink} as={searchLink}>
       <a className='DfGreyLink'>{country}</a>
      </Link>
    </Tag>
})

export default ViewStorefrontCountry
