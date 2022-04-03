import IdentityIcon from 'src/components/utils/IdentityIcon';
import { NavTab } from '@darkpay/dark-types/offchain';
import { nonEmptyArr, nonEmptyStr } from '@darkpay/dark-utils';
import { Menu } from 'antd';
import BN from 'bn.js';
import Link from 'next/link';
import React from 'react';

import { DfBgImg } from '../utils/DfBgImg';
import FollowStorefrontButton from '../utils/FollowStorefrontButton';
import { SummarizeMd } from '../utils/md';
import { aboutStorefrontUrl, storefrontUrl } from '../urls';
import AboutStorefrontLink from './AboutStorefrontLink';
import { DropdownMenu, EditMenuLink } from './helpers';
import { StorefrontData } from '@darkpay/dark-types/dto'

export type StorefrontContent = {
  storefrontId: BN,
  title: string,
  isFollowing: boolean
}

export interface StorefrontNavProps {
  storefrontData: StorefrontData,
  imageSize?: number,
  linkedStorefronts?: {
    teamMembers?: StorefrontContent[]
    projects?: StorefrontContent[]
  }
}

export const StorefrontNav = (props: StorefrontNavProps) => {
  const {
    storefrontData,
    imageSize = 100
  } = props;

  const {
    struct: storefront,
    content
  } = storefrontData

  if (!content) return null;

  const { id, owner } = storefront
  const { about, image, navTabs, name } = content

  const renderMenuItem = (nt: NavTab) => {
    switch (nt.type) {
      case 'by-tag': {
        const tags = nt.content.data as string[]
        return (
          <Menu.Item key={nt.id}>
            {/* TODO replace with Next Link + URL builder */}
            <a href={`/search?tab=products&storefrontId=${id}&tags=${tags.join(',')}`}>{nt.title}</a>
          </Menu.Item>
        )
      }
      case 'url': {
        const url = nt.content.data as string
        return (
          <Menu.Item key={nt.id}>
            {/* TODO replace with Next Link + URL builder if it's Darkdot URL,
            otherwise add 'outer' link icon  */}
            <a href={url}>{nt.title}</a>
          </Menu.Item>
        )
      }
      default: {
        return undefined
      }
    }
  }

  return <div className="StorefrontNav">
    <div className="SNhead">
      <div className="SNavatar">
        <Link href='/[storefrontId]' as={storefrontUrl(storefront)}>
          <a className='DfBlackLink'>
            {nonEmptyStr(image)
              ? <DfBgImg className='DfAvatar' size={imageSize} src={image as string} rounded />
              : <IdentityIcon className='image' size={imageSize} value={owner} />
            }
          </a>
        </Link>
      </div>

      <div className="SNheadTitle">
        <Link href='/[storefrontId]' as={storefrontUrl(storefront)}>
          <a className='DfBlackLink'>{name}</a>
        </Link>
      </div>

      <span className='d-flex justify-content-center align-items-center'>
        <FollowStorefrontButton storefrontId={id} block />
        <DropdownMenu storefrontData={storefrontData} vertical style={{ marginLeft: '.5rem', marginRight: '-.5rem' }} />
      </span>

      {nonEmptyStr(about) &&
        <div className="SNheadDescription">
          <SummarizeMd md={about} more={
            <AboutStorefrontLink storefront={storefront} title={'Learn More'} />
          } />
        </div>
      }
    </div>

    <Menu mode="inline" className="SNmenu">
      {nonEmptyArr(navTabs) &&
        navTabs.map(renderMenuItem)
      }
      <Menu.Item>
        <Link href='/[storefrontId]/about' as={aboutStorefrontUrl(storefront)}>
          <a>About</a>
        </Link>
      </Menu.Item>
    </Menu>

    <EditMenuLink storefront={storefront} withIcon />
  </div>
}

export default StorefrontNav
