import React, { useReducer, createContext, useContext, useEffect } from 'react';
import { DarkdotApi } from '@darkpay/dark-api/api/darkdot';
import { DarkdotSubstrateApi } from '@darkpay/dark-api/api/substrate';
import { DarkdotIpfsApi } from '@darkpay/dark-api/api/ipfs';
import { newDarkdotApi } from './DarkdotConnect';
import { ApiPromise } from '@polkadot/api';
import { newLogger } from '@darkpay/dark-utils';
import { useSubstrate } from '../substrate';
import { controlledMessage } from './Message';
import { functionStub } from '.';
// import { isDevMode } from './env';

const log = newLogger('DarkdotApiContext')

export type DarkdotApiState = {
  darkdot: DarkdotApi
  substrate: DarkdotSubstrateApi
  ipfs: DarkdotIpfsApi
  isApiReady: boolean
}

const emptyState: DarkdotApiState = {
  darkdot: {} as DarkdotApi,
  substrate: {} as DarkdotSubstrateApi,
  ipfs: {} as DarkdotIpfsApi,
  isApiReady: false
}

type DarkdotApiAction = {
  type: 'init'
  api: ApiPromise
}

function reducer (_state: DarkdotApiState, action: DarkdotApiAction): DarkdotApiState {
  switch (action.type) {
    case 'init': {
      const initialState = createDarkdotState(action.api)
     
      log.info('Darkdot API is ready')
      if (window) {
        (window as any).darkdot = initialState.darkdot
      }
      return initialState
    }
    default: {
      throw new Error(`Unsupported type of action: ${action?.type}`)
    }
  }
}

export type DarkdotApiContextProps = {
  state: DarkdotApiState
  dispatch: React.Dispatch<DarkdotApiAction>
}

const contextStub: DarkdotApiContextProps = {
  state: emptyState,
  dispatch: functionStub
}

export type DarkdotApiProps = {
  api: ApiPromise
}

const createDarkdotState = (api?: ApiPromise) : DarkdotApiState => {
  if (!api) return emptyState;

  const darkdot = newDarkdotApi(api)
  const { substrate, ipfs } = darkdot

  return {
    darkdot,
    substrate,
    ipfs,
    isApiReady: true
  }
}

export const DarkdotApiContext = createContext<DarkdotApiContextProps>(contextStub)

const message = controlledMessage({ message: 'Connecting to the network...', type: 'info', duration: 0 })

export function DarkdotApiProvider (props: React.PropsWithChildren<{}>) {
  const { api, apiState } = useSubstrate()
  const [ state, dispatch ] = useReducer(reducer, emptyState)
  const isApiReady = apiState === 'READY'


  useEffect(() => {
    if (!api || !isApiReady) return message.open()

    const load = async () => {
      await api.isReady
      message.close()
      dispatch({ type: 'init', api: api as ApiPromise })
    }

    load()
  }, [ isApiReady ])

  const contextValue: DarkdotApiContextProps = {
    state,
    dispatch
  }

  return <DarkdotApiContext.Provider value={contextValue}>
    {/* {isDevMode &&
      <div className='p-1 pl-2 pr-2' style={{ backgroundColor: isApiReady ? '#cfffc5' : '' }}>
        Substrate API is {isApiReady ? <b>ready</b> : <em>connecting...</em>}
      </div>
    } */}
    {props.children}
  </DarkdotApiContext.Provider>
}

export function useDarkdotApi (): DarkdotApiState {
  return { ...useContext(DarkdotApiContext).state }
}

export default DarkdotApiProvider