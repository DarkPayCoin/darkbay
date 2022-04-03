import React from 'react'
import { nonEmptyStr } from '@darkpay/dark-utils';
import IdentityIcon from 'src/components/utils/IdentityIcon';
import { AnyAccountId } from '@darkpay/dark-types/substrate';
import { DfBgBanner } from './DfBgBanner';

export type BaseBannerProps = {
  size?: number,
  avatar?: string
  address: AnyAccountId,
}

export const BaseBanner = ({  avatar,  address }: BaseBannerProps) => {
  const icon = nonEmptyStr(avatar)
    ? <DfBgBanner src={avatar} className='DfBanner storefront ui--Banner' rounded />
    : <IdentityIcon
      value={address}
    />;

  if (!icon) return null

  return icon
}

export default BaseBanner
