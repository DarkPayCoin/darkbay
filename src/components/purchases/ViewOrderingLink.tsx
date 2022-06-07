import React from 'react'
import Link from 'next/link'
import { HasOrderingId, orderingUrl } from '../urls'

type Props = {
  ordering: HasOrderingId
  title?: React.ReactNode
  hint?: string
  className?: string
}

export const ViewOrderingLink = ({
  ordering,
  title,
  hint,
  className
}: Props) => {

  if (!ordering.id || !title) return null

  return <span>
    <Link href='/[orderingId]' as={orderingUrl(ordering)}>
      <a className={'DfBlackLink ' + className} title={hint}>{title}</a>
    </Link>
  </span>
}

export default ViewOrderingLink
