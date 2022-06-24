import React, { useState } from 'react'
import useDarkdotEffect from '../../api/useDarkdotEffect'
import { useMyAddress } from '../../auth/MyAccountContext'
import { getNewIdFromEvent } from '../../substrate'
import { Button, Modal, Spin, Table } from 'antd'
import { showErrorMessage, showSuccessMessage } from 'src/components/utils/Message'
import { TxButtonProps } from 'src/components/substrate/SubstrateTxButton'
import dynamic from 'next/dynamic'
import { ClockCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { OptionBool } from '@darkpay/dark-types/substrate/classes'
import { formatBalance } from '@polkadot/util';
import Section from 'src/components/utils/Section'
import { checkD4rkApi } from "../api/Check";
import openNotification from 'src/components/utils/OpenNotification'




type GlobalSettingsProps = React.PropsWithChildren<{}>

interface GlobalSettings {
  swaps_allowed: boolean;
  min_amount: number;
  max_amount: number;
}




//export const GlobalSettings = ({ children }: GlobalSettingsProps) => {
export const GlobalSettings: React.FC<GlobalSettingsProps> = () => {
  const myAddress = useMyAddress()
  
  const [ globalsettingsData, setGlobalSettingsData ] = useState([{}]); 
  const [ claimedData, setClaimedData ] = useState([{}]); 

  const [ isLoading, setisLoading ] = useState(false)
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [apiOK, setApiOK] = useState(true); // toinit a first call


  
  useDarkdotEffect(({ substrate }) => {


    var newStateArray = [{}];
    var claimedArray = [{}];

    const load = async () => {
      const api = await substrate.api
      setisLoading(true)

      const txIdsList = await api.query.swap.swapIdsByOwner(myAddress);
      const txIdsListJson = JSON.parse(JSON.stringify(txIdsList))

      let globalsettingsKey: number = 1;
      let claimedKey: number = 1;


      for (const txid of txIdsListJson) {
        const txDetail = await api.query.swap.swapById(txid)
        const txDetailStr = JSON.stringify(txDetail)
        const txToJson = JSON.parse(txDetailStr)
        console.log('txdetailSTR => ' + txDetailStr)
        console.log('txdetailJSON => ' + txToJson['id'])
        // already claimed
        if(txToJson['claimed'] === true) {
          claimedArray.push({ key: claimedKey, id: txToJson['id'], txid: txToJson['d4rktx'], amount: txToJson['amount'], claimed: txToJson['claimed'] })
          claimedKey ++;
        }
        // globalsettings
        // else if(txToJson['id'] > 14 && txToJson['amount'] > 0 && txToJson['claimed'] === false) {
       else if(txToJson['id'] > 0 && txToJson['claimed'] === false) {
          newStateArray.push({key: globalsettingsKey, id: txToJson['id'], txid: txToJson['d4rktx'], amount: txToJson['amount'], claimed: txToJson['claimed'] })
          globalsettingsKey ++;
        }
      }
    



      console.warn(newStateArray)
      newStateArray.shift()
      setGlobalSettingsData(newStateArray);

      console.warn(claimedArray)
      claimedArray.shift()
      setClaimedData(claimedArray);

      // Loading end
      setisLoading(false);

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
    <TxButton 
        label='Claim'
        tx='swap.updateSwap'
        params={txParams}
        onFailed={(txResult) => {
            console.error('Claim err ===> '+txResult?.dispatchError?.toString)
            showErrorMessage('Failed to claim tokens')
          }}
          onSuccess={(txResult) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
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
      key: "key",
      sorter: (a: any, b: any) => Number(a.key) - Number(b.key),
      //defaultSortOrder: ['descend'],
    //  sorter: true
    //  sorter: (a: { key: string }, b: { key: any }) => a.key.localeCompare(b.key),
    //defaultSortOrder: ['descend'],
          
      
    },
    {
      name: "D4RK tx",
      dataIndex: "d4rktx",
      hidden: true,
      key: "d4rktx"
    },
    {
        title: "Amount",
        name: "Amount",
        dataIndex: "amount",
        key: "amount",
        render: function ( amount: number ) {
            return getFormattedBalance(amount)
          }
      },
      {
        title: "Claimed",
        name: "Claimed",
        dataIndex: "claimed",
        key: "claimed",
        render: function ( claimed: boolean, row: any ) {
            return getClaimStatus(row.key, claimed)
          }
      },
  ];




// If API KO
if(!apiOK) {
  return (
    <Section className="d4rk-swap-desc">
<h5>D4RK API is unavailable at the moment.<br />Please try again later.</h5>
</Section>
  )
}



if(isLoading) {
    return <Spin />
}

  return globalsettingsData
    ? <>
      <Table columns={columns} dataSource={globalsettingsData} pagination={{ hideOnSinglePage: true, pageSize: 5, showSizeChanger: false }} />
      <Section className="text-centered padded-top">
      <Button type="text" 
        onClick={() =>  showModal()}
      >
        <ClockCircleOutlined /> History
      </Button>
      <h5>{myAddress}</h5>
    </Section>
    <Section>
    <Modal title="Transaction history" visible={isHistoryModalVisible} width="100vw" onOk={handleOk} onCancel={handleCancel}>
    <Table columns={columns} dataSource={claimedData} pagination={{ hideOnSinglePage: true, pageSize: 5, showSizeChanger: false }} />
      </Modal>
  </Section>
    </>
    : <NoGlobalSettings />
}
