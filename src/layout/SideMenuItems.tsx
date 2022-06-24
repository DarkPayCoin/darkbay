import { accountUrl } from 'src/components/urls'
import { SearchOutlined, RadarChartOutlined, AlertOutlined, HeartOutlined, UserOutlined, ShopOutlined, ShoppingOutlined, ShoppingCartOutlined, PlusOutlined, WalletOutlined } from '@ant-design/icons'
import { uiShowAdvanced, advancedUrl, uiShowNotifications } from 'src/components/utils/env'
import React from 'react'

export type Divider = 'Divider'

export const Divider: Divider = 'Divider'

export type PageLink = {
  name: string
  page: string[]
  icon: React.ReactNode
  hidden?: boolean

  // Helpers
  isNotifications?: boolean
  isAdvanced?: boolean
}

type MenuItem = PageLink | Divider

export const isDivider = (item: MenuItem): item is Divider =>
  item === Divider

export const isPageLink = (item: MenuItem): item is PageLink =>
  !isDivider(item)

export const DefaultMenu: MenuItem[] = [

  {
    name: 'Advanced',
    page: [ advancedUrl ],
    icon: <RadarChartOutlined />,
    hidden: !uiShowAdvanced,
    isAdvanced: true
  }
];

export const buildAuthorizedMenu = (myAddress: string): MenuItem[] => {
  const account = { address: myAddress }

  const notificationsItem = uiShowNotifications
    ? [{
        name: 'My notifications',
        page: [ '/notifications', '/notifications' ],
        icon: <AlertOutlined />,
        isNotifications: true
      }]
    : []

  return [
    {
      name: 'Explore',
      page: [ '/storefronts/all' ],
      icon: <SearchOutlined />
    },

    ...notificationsItem,

    {
      name: 'My subscriptions',
      page: [ '/accounts/[address]/following', accountUrl(account, 'following') ],
      icon: <HeartOutlined />
    },
    {
      name: 'My cart',
      page: [ '/cart'],
      icon: <ShoppingCartOutlined />
    },
    {
      name: 'My purchases',
      page: [ '/purchases', '/purchases' ],
      icon: <ShoppingOutlined />
    },
    Divider,
    {
      name: 'My profile',
      page: [ '/accounts/[address]', accountUrl(account) ],
      icon: <UserOutlined />
    },
 
    {
      name: 'My storefronts',
      page: [ '/accounts/[address]/storefronts', accountUrl(account, 'storefronts') ],
      icon: <ShopOutlined />
    },
    {
      name: 'New storefront',
      page: [ '/storefronts/new', '/storefronts/new' ],
      icon: <PlusOutlined />
    },
    // {
    //   name: 'Swap',
    //   page: [ '/accounts/[address]/swap', accountUrl(account, 'swap') ],
    //   icon: <DeploymentUnitOutlined />
    // },
    // {
    //   name: 'Customers orders',
    //   page: [ '/accounts/[address]/sales', accountUrl(account) ],
    //   icon: <AuditOutlined />
    // },
    Divider,
    {
      name: 'D4RK legacy',
      page: [ '/d4rk', '/d4rk' ],
      icon: <WalletOutlined />
    },
    ...DefaultMenu
  ]
}

