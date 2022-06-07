import { StorefrontData } from '@darkpay/dark-types/dto'
import { AnyAccountId } from '@darkpay/dark-types/substrate'
import { isEmptyStr } from '@darkpay/dark-utils'
import { useRouter } from 'next/router'
import { useState } from 'react'
import useDarkdotEffect from 'src/components/api/useDarkdotEffect'
import { isMyAddress } from 'src/components/auth/MyAccountContext'
import { getStorefrontId } from 'src/components/substrate'

export const useLoadUnlistedStorefront = (address: AnyAccountId) => {
  const isMyStorefront = isMyAddress(address)
  const { query: { storefrontId } } = useRouter()
  const idOrHandle = storefrontId as string

  const [ myHiddenStorefront, setMyHiddenStorefront ] = useState<StorefrontData>()

  useDarkdotEffect(({ darkdot }) => {
    if (!isMyStorefront || isEmptyStr(idOrHandle)) return

    let isSubscribe = true

    const loadStorefrontFromId = async () => {
      const id = await getStorefrontId(idOrHandle, darkdot)
      const storefrontData = id && await darkdot.findStorefront({ id })
      isSubscribe && storefrontData && setMyHiddenStorefront(storefrontData)
    }

    loadStorefrontFromId()

    return () => { isSubscribe = false }
  }, [ isMyStorefront ])

  return {
    isLoading: !myHiddenStorefront,
    myHiddenStorefront
  }
}
