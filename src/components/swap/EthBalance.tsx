import {useWeb3React} from "@web3-react/core";
import {Web3Provider} from "@ethersproject/providers";
import useSWR from "swr";
import React, {useEffect} from "react";
import {formatEther} from "@ethersproject/units";
import { Card } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export const EthBalance = () => {
  const {account, library} = useWeb3React<Web3Provider>()
  const {data: balance, mutate} = useSWR(['getBalance', account, 'latest'])

  useEffect(() => {
    // listen for changes on an Ethereum address
    console.log(`listening for blocks...`)
    library?.on('block', () => {
      console.log('update balance...')
      mutate(undefined, true)
    })
    // remove listener when the component is unmounted
    return () => {
      library?.removeAllListeners('block')
    }
    // trigger the effect only on component mount
  }, [])

  if (!balance) {
    return <div><LoadingOutlined /></div>
  }
  return <Card><div>{parseFloat(formatEther(balance)).toPrecision(4)} Ξ</div></Card>
}