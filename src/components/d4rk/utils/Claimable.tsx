import React, { useState } from 'react'
import useDarkdotEffect from '../../api/useDarkdotEffect'
import NoData from '../../utils/EmptyList'
import { Loading } from '../../utils'
import { useMyAddress } from '../../auth/MyAccountContext'
import { equalAddresses, getNewIdFromEvent } from '../../substrate'
import { AccountId } from '@polkadot/types/interfaces'
import { Button, Form, Spin, Table } from 'antd'
import { DfForm, DfFormButtons } from 'src/components/forms'
import { showErrorMessage, showSuccessMessage } from 'src/components/utils/Message'
import { TxButton, TxButtonProps } from 'src/components/substrate/SubstrateTxButton'
import dynamic from 'next/dynamic'
import { LoadingOutlined } from '@ant-design/icons'
import { OptionBool } from '@darkpay/dark-types/substrate/classes'
import { formatBalance } from '@polkadot/util';
import BN from 'bn.js'



export const NoClaimable = React.memo(() =>
  <NoData description='No claimable tokens yet.' />
)

type ClaimableProps = React.PropsWithChildren<{}>




//export const Claimable = ({ children }: ClaimableProps) => {
export const Claimable: React.FC<ClaimableProps> = () => {
  const myAddress = useMyAddress()
  const [ claimableDataIds, setClaimableDataIds ] = useState([])
  const [ claimableData, setClaimableData ] = useState([{}]); 
  const [ isLoading, setisLoading ] = useState(false)
  const [ form ] = Form.useForm()

  
  useDarkdotEffect(({ substrate }) => {
    var newStateArray = [{}];
    var claimedArray = [];

    const load = async () => {
      const api = await substrate.api
      setisLoading(true)
      const fullList: any[] = []

      const txIdsList = await api.query.swap.swapIdsByOwner(myAddress);
      const txIdsListJson = JSON.parse(JSON.stringify(txIdsList))

      for (const txid of txIdsListJson) {
        const txDetail = await api.query.swap.swapById(txid)
        const txDetailStr = JSON.stringify(txDetail)
        const txToJson = JSON.parse(txDetailStr)
        console.log('txdetailSTR => ' + txDetailStr)
        console.log('txdetailJSON => ' + txToJson['id'])
        // already claimed
        if(txToJson['claimed'] === true) {
          claimedArray.push({key: txToJson['id'], txid: txToJson['d4rktx'], amount: txToJson['amount'], claimed: txToJson['claimed'] })
        }
        // claimable
        else if(txToJson['id'] > 9 && txToJson['amount'] > 0 && txToJson['claimed'] === false) {
          newStateArray.push({key: txToJson['id'], txid: txToJson['d4rktx'], amount: txToJson['amount'], claimed: txToJson['claimed'] })
        }
      }



      console.warn(newStateArray)

      newStateArray.shift()
      setClaimableData(newStateArray);
      setisLoading(false)

    }
    load()
  }, [myAddress])


  const commonFormTxButtonProps: TxButtonProps = {
    type: 'primary',
    size: 'large'
  }


  const TxButtonStub = React.memo(() =>
  <Button {...commonFormTxButtonProps} disabled={true}>
    <LoadingOutlined />
  </Button>
)


  const TxButton = dynamic(
    () => import('../../utils/TxButton'),
    { loading: TxButtonStub, ssr: false }
  )




function getFormattedBalance(amount: number) : any {
 
   // const { unit: defaultCurrency, decimals: defaultDecimal } = formatBalance.getDefaults()
    return formatBalance(amount);

}


  function getClaimStatus(id: number, claimed: boolean): any {

    const txParams = [id, new OptionBool(true) ]

    if(claimed === true )
      {return 'Claimed'}
    return (
        // <span>nope</span>


    <TxButton 
        label='Claim'
        tx='swap.updateSwap'
        params={txParams}
        onFailed={(txResult) => {
            console.error('Comment err ===> '+txResult?.dispatchError?.toString)
            showErrorMessage('Failed to claim tokens')
          }}
          onSuccess={(txResult) => {
            const id = getNewIdFromEvent(txResult)
            showSuccessMessage('Tokens minted')
          }}

    />

    )
 }
 


  const columns = [
    {
      title: "#",
      name: "Id",
      dataIndex: "key",
    },
    {
      name: "D4RK tx",
      dataIndex: "d4rktx",
      hidden: true
    },
    {
        title: "Amount",
        name: "Amount",
        dataIndex: "amount",
        render: function ( amount: number ) {
            return getFormattedBalance(amount)
          }
      },
      {
        title: "Claimed",
        name: "Claimed",
        dataIndex: "claimed",
        render: function ( claimed: boolean, row: any ) {
            return getClaimStatus(row.key, claimed)
          }
      },
  ];







if(isLoading) {
    return <Spin />
}

  return claimableData
    ? <>
      <div>Claimable</div>
      <Table columns={columns} dataSource={claimableData} rowKey="id" />
    </>
    : <NoClaimable />
}
