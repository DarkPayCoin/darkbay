import React, { useState } from 'react'
import { ViewStorefront } from './ViewStorefront'
import PaginatedList from 'src/components/lists/PaginatedList'
import { NextPage } from 'next'
import { HeadMeta } from '../utils/HeadMeta'
import { StorefrontData } from '@darkpay/dark-types/dto'
import { StorefrontId } from '@darkpay/dark-types/substrate/interfaces'
import { getDarkdotApi } from '../utils/DarkdotConnect'
import useDarkdotEffect from '../api/useDarkdotEffect'
import { isMyAddress, useMyAddress } from '../auth/MyAccountContext'
import { Loading } from '../utils'
import { CreateStorefrontButton } from './helpers'
import { newLogger } from '@darkpay/dark-utils'
import { AnyAccountId } from '@darkpay/dark-types'
import { return404 } from '../utils/next'
import { getPageOfIds } from '../utils/getIds'
import { useRouter } from 'next/router'
import DataList from '../lists/DataList'

export type LoadStorefrontsType = {
  storefrontsData: StorefrontData[]
  myStorefrontIds: StorefrontId[]
}

type BaseProps = {
  address: AnyAccountId,
  withTitle?: boolean
}

type LoadStorefrontsProps = LoadStorefrontsType & BaseProps

type Props = Partial<LoadStorefrontsType> & BaseProps

const log = newLogger('AccountStorefronts')

export const useLoadAccoutPublicStorefronts = (address?: AnyAccountId): LoadStorefrontsProps | undefined => {

  if (!address) return undefined

  const { query } = useRouter()
  const [ state, setState ] = useState<LoadStorefrontsProps>()

  useDarkdotEffect(({ darkdot, substrate }) => {
    const loadMyStorefronts = async () => {
      const myStorefrontIds = await substrate.storefrontIdsByOwner(address as string)
      const pageIds = getPageOfIds(myStorefrontIds, query)
      const storefrontsData = await darkdot.findPublicStorefronts(pageIds)

      setState({ myStorefrontIds, storefrontsData, address })
    }

    loadMyStorefronts().catch((err) => log.error('Failed load my storefronts. Error: %', err))

  }, [ address ])

  return state
}

const useLoadUnlistedStorefronts = ({ address, myStorefrontIds }: LoadStorefrontsProps) => {
  const isMyStorefronts = isMyAddress(address as string)
  const [ myUnlistedStorefronts, setMyUnlistedStorefronts ] = useState<StorefrontData[]>()

  useDarkdotEffect(({ darkdot }) => {
    if (!isMyStorefronts) return setMyUnlistedStorefronts([])

    darkdot.findUnlistedStorefronts(myStorefrontIds)
      .then(setMyUnlistedStorefronts)
      .catch((err) =>
        log.error('Failed to load unlisted storefronts. Error: %', err)
      )
  }, [ myStorefrontIds.length, isMyStorefronts ])

  return {
    isLoading: !myUnlistedStorefronts,
    myUnlistedStorefronts: myUnlistedStorefronts || []
  }
}

const StorefrontPreview = (storefront: StorefrontData) =>
  <ViewStorefront
    key={`storefront-${storefront.struct.id.toString()}`}
    storefrontData={storefront}
    withFollowButton
    preview
  />

const PublicStorefronts = (props: LoadStorefrontsProps) => {
  const { storefrontsData, myStorefrontIds, address, withTitle } = props
  const noStorefronts = !myStorefrontIds.length
  const totalCount = myStorefrontIds.length
  const isMy = isMyAddress(address)

  const title = withTitle
    ? <span className='d-flex justify-content-between align-items-center w-100 my-2'>
      <span>{`Public Storefronts (${totalCount})`}</span>
      {!noStorefronts && isMy && <CreateStorefrontButton />}
    </span>
    : null

  return <PaginatedList
    title={title}
    totalCount={totalCount}
    dataSource={storefrontsData}
    renderItem={StorefrontPreview}
    noDataDesc='No public storefronts found'
    noDataExt={noStorefronts && isMy &&
      <CreateStorefrontButton>
        Create my first storefront
      </CreateStorefrontButton>
    }
  />
}

const UnlistedStorefronts = (props: LoadStorefrontsProps) => {
  const { myUnlistedStorefronts, isLoading } = useLoadUnlistedStorefronts(props)

  if (isLoading) return <Loading />

  const unlistedStorefrontsCount = myUnlistedStorefronts.length

  return unlistedStorefrontsCount ? <DataList
    title={`Unlisted Storefronts (${unlistedStorefrontsCount})`}
    dataSource={myUnlistedStorefronts}
    renderItem={StorefrontPreview}
  /> : null
}

export const AccountStorefronts = ({ myStorefrontIds, withTitle = true, ...props}: Props) => {
  const state = myStorefrontIds
    ? { myStorefrontIds, withTitle, ...props } as LoadStorefrontsProps
    : useLoadAccoutPublicStorefronts(props.address)

  if (!state) return <Loading label='Loading public storefronts'/>

  return <div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <PublicStorefronts {...state} />
      <UnlistedStorefronts {...state} />
    </div>
}

export const AccountStorefrontsPage: NextPage<Props> = (props: Props) => <>
  <HeadMeta title='Storefronts' desc={`Darkdot storefronts owned by ${props.address}`} />
  <AccountStorefronts {...props} />
</>

AccountStorefrontsPage.getInitialProps = async (props): Promise<Props> => {
  const { query } = props
  const { address } = query

  if (!address || typeof address !== 'string') {
    return return404(props) as any
  }

  const darkdot = await getDarkdotApi()
  const { substrate } = darkdot
  const myStorefrontIds = await substrate.storefrontIdsByOwner(address)
  const pageIds = getPageOfIds(myStorefrontIds, query)
  const storefrontsData = await darkdot.findPublicStorefronts(pageIds)

  return {
    storefrontsData,
    myStorefrontIds,
    address
  }
}

export const ListMyStorefronts = () => {
  const address = useMyAddress()
  const state = useLoadAccoutPublicStorefronts(address)

  return state
    ? <AccountStorefronts {...state} />
    : <Loading label='Loading your storefronts' />
}

export default AccountStorefrontsPage
