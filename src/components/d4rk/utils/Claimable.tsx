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
    var newStateArray = claimableData.slice();

    const load = async () => {
      const api = await substrate.api
      setisLoading(true)
      const newItems: any[] = []

      const txList = await api.query.swap.swapIdsByOwner(myAddress)
      .then((ids)=>{
          
        const idsJs = JSON.stringify(ids)
                 console.warn(idsJs)
                  setClaimableDataIds(JSON.parse(idsJs))
                  claimableDataIds.forEach(async function(item){
            const txDetail = await api.query.swap.swapById(item)
            .then((txDetail) => {
                const txDetailStr = JSON.stringify(txDetail)
                const txToJson = JSON.parse(txDetailStr)
                console.log('txdetailSTR => ' + txDetailStr)
                console.log('txdetailJSON => ' + txToJson['id'])
                //alert('txdetailJSON => ' + txToJson['claimed'])

// {"id":9,"created":{"account":"2i7x3rQHcty8gHdgWg3trfZKLLC99VerAWhF4apUHVt6gJzG","block":35283,"time":1654598844000},"updated":null,"amount":10,"d4rktx":"f5d7f40a6d52946c65e4cf37656cf085828cf4e466e3f4253787da9069ee7191","claimer":"2n1VSYdvbmnQizKfkjGRKXUfo5vG8X4kipYn4KBViLqj26ew","claimed":false}
                
              //  setClaimableData(prevState => [...prevState, {key: txToJson['id'], txid: txToJson['d4rktx'], amount: txToJson['amount'], claimed: txToJson['claimed'] }]);
              newStateArray.push({key: txToJson['id'], txid: txToJson['d4rktx'], amount: txToJson['amount'], claimed: txToJson['claimed'] })
            })

                  })

        })
      .catch((err)=>{alert(err)});

        console.warn(claimableData)
        setClaimableData(newStateArray);
      setisLoading(false)

    }
    load()
  }, [])


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

  function getClaimStatus(claimed: boolean): any {

    const txParams = [3, null]

    if(claimed === true )
      {return 'Claimed'}
    return (

        <span>nope</span>


    // <TxButton 
    //     label='Claim'
    //     tx='swap.updateSwap'
    //     params={txParams}
    //     onFailed={(txResult) => {
    //         console.error('Comment err ===> '+txResult?.dispatchError?.toString)
    //         showErrorMessage('Failed to claim tokens')
    //       }}
    //       onSuccess={(txResult) => {
    //         const id = getNewIdFromEvent(txResult)
    //         showSuccessMessage('Tokens minted')
    //       }}

    // />

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
        dataIndex: "amount"
      },
      {
        title: "Claimed",
        name: "Claimed",
        dataIndex: "claimed",
        render: (claimed: boolean) => getClaimStatus(claimed)

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
