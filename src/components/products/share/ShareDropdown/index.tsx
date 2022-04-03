import React, { useState } from 'react';
import { ProductWithSomeDetails } from '@darkpay/dark-types';
import { Menu, Dropdown, Button } from 'antd';
import { ShareLink, Copy } from 'src/components/urls/helpers';
import { facebookShareUrl, productUrl, twitterShareUrl, linkedInShareUrl, redditShareUrl, copyUrl } from 'src/components/urls';
import { IconWithLabel } from 'src/components/utils';
import {
  FacebookOutlined,
  TwitterOutlined,
  LinkedinOutlined,
  RedditOutlined,
  ShareAltOutlined,
  LinkOutlined
} from '@ant-design/icons'
import StorefrontShareLink from '../StorefrontShareLink';
import { Storefront } from '@darkpay/dark-types/substrate/interfaces';

import styles from './index.module.sass'
import { FVoid } from 'src/components/utils/types';

type ShareMenuProps = {
  productDetails: ProductWithSomeDetails,
  storefront: Storefront,
  preview?: boolean,
  title?: string
  className?: string,
  onClick?: FVoid
}

type SomeShareLink = {
  url: string,
  title?: string,
  summary?: string
}

const FacebookShareLink = ({ url }: SomeShareLink) => <ShareLink url={facebookShareUrl(url)}>
  <IconWithLabel icon={<FacebookOutlined />} label='Facebook' />
</ShareLink>

const TwitterShareLink = ({ url, title }: SomeShareLink) => <ShareLink url={twitterShareUrl(url, title)}>
  <IconWithLabel icon={<TwitterOutlined />} label='Twitter' />
</ShareLink>

const LinkedInShareLink = ({ url, title, summary }: SomeShareLink) => <ShareLink url={linkedInShareUrl(url, title, summary)}>
  <IconWithLabel icon={<LinkedinOutlined />} label='LinkedIn' />
</ShareLink>

const RedditShareLink = ({ url, title }: SomeShareLink) => <ShareLink url={redditShareUrl(url, title)}>
  <IconWithLabel icon={<RedditOutlined />} label='Reddit' />
</ShareLink>

const CopyLink = ({ url }: SomeShareLink) => <Copy text={copyUrl(url)} message='Link copied'>
  <IconWithLabel icon={<LinkOutlined />} label='Copy link' />
</Copy>

const ShareMenu = (props: ShareMenuProps) => {
  const { productDetails: { product }, storefront, onClick } = props
  const currentProductUrl = productUrl(storefront, product.struct)
  const title = product.content?.title
  const summary = product.content?.body

  return <Menu
    selectable={false}
    mode='horizontal'
    className={styles.DfShareDropdown}
    onClick={onClick}
  >
    <Menu.ItemGroup title="Share to:">
      <Menu.Item>
        <StorefrontShareLink {...props} />
      </Menu.Item>
      <Menu.Item>
        <FacebookShareLink url={currentProductUrl} />
      </Menu.Item>
      <Menu.Item>
        <TwitterShareLink url={currentProductUrl} title={title} />
      </Menu.Item>
      <Menu.Item>
        <LinkedInShareLink url={currentProductUrl} title={title} summary={summary} />
      </Menu.Item>
      <Menu.Item>
        <RedditShareLink url={currentProductUrl} title={title} summary={summary} />
      </Menu.Item>
      <Menu.Item>
        <CopyLink url={currentProductUrl} />
      </Menu.Item>
    </Menu.ItemGroup>
  </Menu>
}

export const ShareDropdown = (props: ShareMenuProps) => {
  const { preview, title = 'Share', className, productDetails: { product: { struct: { shares_count } } } } = props
  const [ isVisible, setVisible ] = useState(false)

  const hide = () => setVisible(false)

  return <Dropdown
    visible={isVisible}
    onVisibleChange={setVisible}
    placement='bottomCenter'
    overlay={<ShareMenu onClick={hide} {...props} />}
  >
    <Button
      className={className}
      title={preview ? title : undefined}
      // style={{ marginRight: !preview ? '-1rem' : '' }}
    >
      <IconWithLabel icon={<ShareAltOutlined />} count={shares_count} label={!preview ? title : undefined} />
    </Button>
  </Dropdown>
}
