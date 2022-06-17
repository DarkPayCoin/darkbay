import React, { useEffect, useState } from "react";
import { useMyAccount } from "src/components/auth/MyAccountContext";
import { Button, Spin, Table, Tag } from "antd";
import Link from "next/link";
import Section from "src/components/utils/Section";
import { ShowD4rkWallet } from "./ShowD4rkWallet";
import openNotification from "src/components/utils/OpenNotification";
import { checkD4rkApi, getUserExists } from "../api/Check";
import D4rkServiceAPI from "../api/D4rkService";


type TxHistoryProps = {}
// id
// userid
// amount
// txid
// type
// status
// obs

async function getTransactions(): Promise<any> {
    try {
      const response = await D4rkServiceAPI.userTxs();
      const json = await response;
       console.log(json.data);
        return (json.data)
    }
    catch(error) {
      console.log(error)
      return null
    }
  }



export const TxHistory : React.FC<TxHistoryProps> = () => {

    const [txData, setTxData] = useState([]);
    const [ isLoading, setIsLoading] = useState(false);
    const [ gotTx, setGotTx] = useState(false);

    const fetchTxs = async () => {
        setIsLoading(true)
        console.log('fetching');
      //  setIsLoading(true) //set to true only when the api call is going to happen
        const data = await getTransactions().then(res => {

                //  setTxData(Object.values(data))
                 const results= res.transactions.map((row: { id: any; userid: any; amount: any; txid: any; type: any; status: any; obs: any; }) => ({
                        key: row.id, // I added this line
                        id: row.id,
                        userid: row.userid,
                        amount: row.amount,
                        txid: row.txid,
                        type: row.type,
                        status: row.status,
                        obs: row.obs
                  }))
                  setTxData(results)            
        })
        setGotTx(true)
        setIsLoading(false)
      }
    
      const columns = [
        {
          title: "#",
          name: "Id",
          dataIndex: "key",
          sorter: true,

          
        },
        // {
        //   name: "UrerId",
        //   dataIndex: "userid",
        //   hidden: true
        // },
        {
            title: "Amount",
            name: "Amount",
            dataIndex: "amount"
          },
        {
          title: "TxId",
          name: "TxId",
          dataIndex: "txid",
          render: (txid: string) => { 
           const linkref = "https://explorer.darkpay.market/tx/"+txid
            return <Link href={linkref}>  
            <a target="_blank" rel="noopener noreferrer" className='link-item'>
              view in explorer
            </a>
            </Link> }
        },
        {
          title: "Type",
          name: "Type",
          dataIndex: "type"
          },
          {
            title: "Status",
            name: "Status",
            dataIndex: "status",
            // render: (status: number) => getTxStatus(status)
            // render: (status: number) => {
            //   if(status < 1) { 
            //     return '<span style={{ color: "yellow" }}>Unconfirmed</span>' 
            //   }
            //   return '<span style={{ color: "green" }}>Confirmed</span>' 
            //   }
            render: (status: number) => (
              <span>
                {status > 0 ? <Tag color="green" >Confirmed</Tag> : <Tag color="yellow" >Unconfirmed</Tag>}
              </span>
            )
            
          },
        {
          title: "Notes",
          name: "Obs",
          dataIndex: "obs",
          hidden: true

        }
      ];

// useEffect
useEffect(() => {
    console.log(txData)
    if(!gotTx) {
        fetchTxs()
    }
}, [gotTx, txData])



// ELSE OK
return (
   
<Section className="d4rk-swap-desc">
{isLoading ? 
<Spin /> 
    : 
    

    <Table columns={columns} dataSource={txData} rowKey="id" />

    }

</Section>
  )
}
