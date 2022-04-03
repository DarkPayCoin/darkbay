import React, { useState } from 'react'
import { newLogger } from '@darkpay/dark-utils'
import useDarkdotEffect from 'src/components/api/useDarkdotEffect'
import { ProfileData } from '@darkpay/dark-types'
import { ExtendedAddressProps } from './types'
import { Loading } from '../../../utils'
import { useMyAccount } from 'src/components/auth/MyAccountContext'

const log = newLogger(withLoadedOwner.name)

type Props = ExtendedAddressProps & {
  size?: number
  avatar?: string
  mini?: boolean
};

export function withLoadedOwner<P extends Props> (Component: React.ComponentType<any>) {
  return function (props: P) {
    const { owner: initialOwner, address } = props as Props

    if (initialOwner) return <Component {...props} />

    const [ owner, setOwner ] = useState<ProfileData>()
    const [ loaded, setLoaded ] = useState(true)

    useDarkdotEffect(({ darkdot }) => {
      if (!address) return

      setLoaded(false)
      let isSubscribe = true

      const loadContent = async () => {
        const owner = await darkdot.findProfile(address)
        isSubscribe && setOwner(owner)
        setLoaded(true)
      }

      loadContent().catch(err =>
        log.error(`Failed to load profile data. ${err}`))

      return () => { isSubscribe = false }
    }, [ address?.toString() ])

    return loaded
      ? <Component {...props} owner={owner} />
      : <Loading />
  }
}

export function withMyProfile (Component: React.ComponentType<any>) {
  return function (props: any) {
    const { state: { account, address } } = useMyAccount()
    return address ? <Component owner={account} address={address} {...props} /> : null
  }
}