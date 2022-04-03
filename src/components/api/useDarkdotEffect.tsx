import { useEffect, DependencyList } from 'react'
import { useDarkdotApi } from '../utils/DarkdotApiContext'
import { isFunction } from '@polkadot/util'
import { DarkdotApi } from '@darkpay/dark-api/api/darkdot'
import { DarkdotSubstrateApi } from '@darkpay/dark-api/api/substrate'
import { DarkdotIpfsApi } from '@darkpay/dark-api/api/ipfs'

type Apis = {
  darkdot: DarkdotApi
  substrate: DarkdotSubstrateApi
  ipfs: DarkdotIpfsApi
}

type EffectCallbackResult = void | (() => void | undefined)
type EffectCallback = (apis: Apis) => EffectCallbackResult

/** Effect callback will be called only if API is ready. */
export default function useDarkdotEffect (
  effect: EffectCallback,
  deps: DependencyList = []
): void {
  const apis = useDarkdotApi()
  const isReady = apis.isApiReady

  useEffect(() => {
    if (isReady && isFunction(effect)) {
      // At this point all APIs should be initialized and ready to use.
      // That's why we can treat them as defined here and cast to their types.
      return effect({
        darkdot: apis.darkdot as DarkdotApi,
        substrate: apis.substrate as DarkdotSubstrateApi,
        ipfs: apis.ipfs as DarkdotIpfsApi
      })
    }
  }, [ isReady, ...deps ])
}
