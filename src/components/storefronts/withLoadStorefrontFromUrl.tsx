import React, { useState } from 'react'
import { useRouter } from 'next/router'
import { getStorefrontId } from '../substrate'
import { StorefrontData } from '@darkpay/dark-types'
import useDarkdotEffect from '../api/useDarkdotEffect'
import { Loading } from '../utils'
import NoData from '../utils/EmptyList'
import { isFunction } from '@polkadot/util'

type CheckPermissionResult = {
  ok: boolean
  error: (storefront: StorefrontData) => JSX.Element
}

export type CheckStorefrontPermissionFn = (storefront: StorefrontData) => CheckPermissionResult

type CheckStorefrontPermissionProps = {
  checkStorefrontPermission?: CheckStorefrontPermissionFn
}

export type CanHaveStorefrontProps = {
  storefront?: StorefrontData
}

export function withLoadStorefrontFromUrl<Props extends CanHaveStorefrontProps> (
  Component: React.ComponentType<Props>
) {
  return function (props: Props & CheckStorefrontPermissionProps): React.ReactElement<Props> {

    const { checkStorefrontPermission } = props
    const idOrHandle = useRouter().query.storefrontId as string
    const [ isLoaded, setIsLoaded ] = useState(false)
    const [ loadedData, setLoadedData ] = useState<CanHaveStorefrontProps>({})

    useDarkdotEffect(({ darkdot }) => {
      const load = async () => {
        const id = await getStorefrontId(idOrHandle, darkdot)
        if (!id) return

        setIsLoaded(false)
        const storefront = await darkdot.findStorefront({ id })
        setLoadedData({ storefront })
        setIsLoaded(true)
      }
      load()
    }, [ idOrHandle ])

    if (!isLoaded) return <Loading label='Loading the storefront...' />

    const { storefront } = loadedData
    if (!storefront) return <NoData description='Storefront not found' />

    if (isFunction(checkStorefrontPermission)) {
      const { ok, error } = checkStorefrontPermission(storefront)
      if (!ok) return error(storefront)
    }

    return <Component {...props} storefront={storefront} />
  }
}
