import React, { useState } from 'react'
import useDarkdotEffect from '../../api/useDarkdotEffect'
import NoData from '../../utils/EmptyList'
import { Loading } from '../../utils'
import { useMyAddress } from '../../auth/MyAccountContext'
import { equalAddresses, getNewIdFromEvent } from '../../substrate'
import { AccountId } from '@polkadot/types/interfaces'
import { Button, Form, Modal, Spin, Table } from 'antd'
import { DfForm, DfFormButtons } from 'src/components/forms'
import { showErrorMessage, showSuccessMessage } from 'src/components/utils/Message'
import { TxButton, TxButtonProps } from 'src/components/substrate/SubstrateTxButton'
import dynamic from 'next/dynamic'
import { ClockCircleOutlined, LoadingOutlined } from '@ant-design/icons'
import { OptionBool } from '@darkpay/dark-types/substrate/classes'
import { formatBalance } from '@polkadot/util';
import BN from 'bn.js'
import Section from 'src/components/utils/Section'
import { TxHistory } from './TxHistory'
import { checkD4rkApi, getUserExists } from "../api/Check";
import openNotification from 'src/components/utils/OpenNotification'




export const NoClaimable = React.memo(() =>
  <NoData description='No claimable tokens yet.' />
)

type ClaimableProps = React.PropsWithChildren<{}>

interface Claimable {
  key: number;
  d4rktx: string;
  amount: number;
  claimed: boolean;
}




//export const Claimable = ({ children }: ClaimableProps) => {
export const Claimable: React.FC<ClaimableProps> = () => {
  const myAddress = useMyAddress()
  const [ claimableDataIds, setClaimableDataIds ] = useState([]);
  const [ claimableData, setClaimableData ] = useState([{}]); 
  const [ claimedData, setClaimedData ] = useState([{}]); 

  const [ isLoading, setisLoading ] = useState(false)
  const [ form ] = Form.useForm()
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [apiOK, setApiOK] = useState(true); // toinit a first call


  // check D4RK API state
  const checkAPI = async () => {
    const data = await checkD4rkApi()
     .then((data: any) => {
       //alert(data)
       if(data.message === 'Network Error') {
         setApiOK(false)
         openNotification('Network error', 'D4RK API is unavailable. Please try again later.', 'bottomRight')
       }
       if(data == 'v1') {
        setApiOK(true)
       }
       if(data.message === 'Request failed with status code 400') {
        //setMustCreate(true)
         }
    })
    .catch(error => { openNotification('Network error', 'D4RK API is unavailable. Please try again later.', 'bottomRight'); setApiOK(false) })
    .finally(() => {})
     //make sure to set it to false so the component is not in constant loading state
  }



  const showModal = () => {
    setIsHistoryModalVisible(true);
  };

  const handleOk = () => {
    setIsHistoryModalVisible(false);
  };

  const handleCancel = () => {
    setIsHistoryModalVisible(false);
  };

  
  useDarkdotEffect(({ substrate }) => {


    var newStateArray = [{}];
    var claimedArray = [{}];

    const load = async () => {
      checkAPI();
      if(apiOK) {
      const api = await substrate.api
      setisLoading(true)
      const fullList: any[] = []

      const txIdsList = await api.query.swap.swapIdsByOwner(myAddress);
      const txIdsListJson = JSON.parse(JSON.stringify(txIdsList))

      let claimableKey: number = 1;
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
        // claimable
        // else if(txToJson['id'] > 14 && txToJson['amount'] > 0 && txToJson['claimed'] === false) {
       else if(txToJson['id'] > 0 && txToJson['claimed'] === false) {
          newStateArray.push({key: claimableKey, id: txToJson['id'], txid: txToJson['d4rktx'], amount: txToJson['amount'], claimed: txToJson['claimed'] })
          claimableKey ++;
        }
      }
    }



      console.warn(newStateArray)
      newStateArray.shift()
      setClaimableData(newStateArray);

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

  return claimableData
    ? <>
      <Table columns={columns} dataSource={claimableData} pagination={{ hideOnSinglePage: true, pageSize: 5, showSizeChanger: false }} />
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
    : <NoClaimable />
}
