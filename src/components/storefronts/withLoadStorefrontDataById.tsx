import React, { useState } from 'react';
import useDarkdotEffect from '../api/useDarkdotEffect';
import { Loading } from '../utils';
import NoData from '../utils/EmptyList';
import { StorefrontData, ProfileData } from '@darkpay/dark-types/dto'
import { ViewStorefrontProps } from './ViewStorefrontProps';

type Props = ViewStorefrontProps

// TODO Copypasta. See withLoadStorefrontFromUrl
export const withLoadStorefrontDataById = (Component: React.ComponentType<Props>) => {
  return (props: Props) => {
    const { id } = props

    if (!id) return <NoData description={<span>Storefront id is undefined</span>} />

    const [ storefrontData, setStorefrontData ] = useState<StorefrontData>()
    const [ owner, setOwner ] = useState<ProfileData>()

    useDarkdotEffect(({ darkdot }) => {
      const loadData = async () => {
        const storefrontData = await darkdot.findStorefront({ id })
        if (storefrontData) {
          setStorefrontData(storefrontData)
          const ownerId = storefrontData.struct.owner
          const owner = await darkdot.findProfile(ownerId)
          setOwner(owner);
        }
      }
      loadData()
    }, [ false ])

    return storefrontData?.content
      ? <Component storefrontData={storefrontData} owner={owner} {...props}/>
      : <Loading />
  }
}

export default withLoadStorefrontDataById
