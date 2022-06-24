import React, { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import { Networks, TOKENS_BY_NETWORK } from './utils'
import fetcher from 'swr-eth'
import { SWRConfig } from 'swr'
import { TokenList } from './TokenList'
import { InjectedConnector } from '@web3-react/injected-connector'
import { useEagerConnect } from './hooks/useEagerConnect'
import { useInactiveListener } from './hooks/useInactiveListener'
import Section from '../utils/Section'
import { SubnodeOutlined } from '@ant-design/icons'

export const injectedConnector = new InjectedConnector({
  supportedChainIds: [
    Networks.MainNet, // Mainet
    Networks.Ropsten, // Ropsten
    Networks.Rinkeby, // Rinkeby
    Networks.Goerli, // Goerli
    Networks.Kovan, // Kovan
  ],
})

export const Wallet = () => {
  const {
    chainId,
    library,
    activate,
    active,
    connector,
  } = useWeb3React<Web3Provider>()

  // [
  //   [ 0x00001, JSONABI ]
  // ]
  const ABIs = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return (TOKENS_BY_NETWORK[chainId] || []).map<[string, any]>(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
      ({ address, abi }) => [address, abi]
    )
  }, [chainId])

  const onClick = () => {
    activate(injectedConnector)
  }

  console.log({ABIs})
  // handle logic to recognize the connector currently being activated
  const [activatingConnector, setActivatingConnector] = React.useState()
  React.useEffect(() => {
    console.log('Wallet running')
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector])

  // mount only once or face issues :P
  const triedEager = useEagerConnect()
  useInactiveListener(!triedEager || !!activatingConnector)

  return (
    
    <Section>              
       {active 
       ? (
     <div></div>

      ) 
      : (
        <button className="ant-btn" onClick={onClick}>
         <SubnodeOutlined /> Connect with Metamask
        </button>
      )}

      {active && (
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
        <SWRConfig value={{ fetcher: fetcher(library, new Map(ABIs)) }}>


          <TokenList 
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          chainId={chainId} />
        </SWRConfig>
      )}


  </Section>
 
  )
}