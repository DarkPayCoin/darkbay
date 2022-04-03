import React from 'react';
import Link from 'next/link';
import { useStorybookContext } from '../utils/StorybookContext';
import { StorefrontData } from '@darkpay/dark-types'
import { storefrontUrl } from '../urls';

type Props = {
  storefront?: StorefrontData
  subtitle: React.ReactNode
}

export const StorefrontgedSectionTitle = ({
  storefront,
  subtitle
}: Props) => {
  const { isStorybook } = useStorybookContext()
  const name = storefront?.content?.name

  return <>
    {!isStorybook && storefront && name && <>
      <Link href='/[storefrontId]' as={storefrontUrl(storefront.struct)}>
        <a>{name}</a>
      </Link>
      <span style={{ margin: '0 .75rem' }}>/</span>
    </>}
    {subtitle}
  </>
}

export default StorefrontgedSectionTitle
