import { api as apiFromContext } from '../substrate';
import { Api as SubstrateApi } from '@darkpay/dark-api/connections/substrateConnect'
import { offchainUrl, substrateUrl, ipfsNodeUrl, dagHttpMethod, useOffhainForIpfs } from './env';
import { ApiPromise } from '@polkadot/api';
import { newLogger } from '@darkpay/dark-utils';
import { DarkdotApi } from '@darkpay/dark-api/api/darkdot';

const log = newLogger('DarkdotConnect')

let darkdot!: DarkdotApi;
let isLoadingDarkdot = false

export const newDarkdotApi = (substrateApi: ApiPromise) => {
  const useServer = useOffhainForIpfs ? { // TODO : typo off C hain
    httpRequestMethod: dagHttpMethod as any
  } : undefined

  return new DarkdotApi({ substrateApi, ipfsNodeUrl, offchainUrl, useServer })
}

export const getDarkdotApi = async () => {
  if (!darkdot && !isLoadingDarkdot) {
    isLoadingDarkdot = true
    const api = await getSubstrateApi()
    darkdot = newDarkdotApi(api)
    isLoadingDarkdot = false
  }
  return darkdot
}

let api: ApiPromise;
let isLoadingSubstrate = false

const getSubstrateApi = async () => {
  if (apiFromContext) {
    log.debug('Get Substrate API from context')
    return apiFromContext.isReady
  }

  if (!api && !isLoadingSubstrate) {
    isLoadingSubstrate = true
    log.debug('Get Substrate API as Api.connect()')
    api = await SubstrateApi.connect(substrateUrl)
    isLoadingSubstrate = false
  }

  return api
}
