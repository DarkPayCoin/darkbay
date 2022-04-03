import Link from 'next/link'
import React from 'react'
import { BareProps } from 'src/components/utils/types'

type Props = BareProps & {
  title?: React.ReactNode
}

export const AllOrderingsLink = ({
  title = 'See all',
  ...otherProps
}: Props) =>
  <Link href='/orderings/all' as='/orderings/all'>
    <a
      className='DfGreyLink text-uppercase'
      style={{ fontSize: '1rem' }}
      {...otherProps}
    >{title}</a>
  </Link>
