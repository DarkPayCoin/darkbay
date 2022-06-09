import React, { useEffect, useState } from "react";
import { useMyAccount } from "src/components/auth/MyAccountContext";
import { Button } from "antd";
import Link from "next/link";
import Section from "src/components/utils/Section";
import { ShowD4rkWallet } from "./ShowD4rkWallet";
import openNotification from "src/components/utils/OpenNotification";
import { checkD4rkApi, getUserExists } from "../api/Check";


type CreateWalletProps = {}

export const CreateWallet : React.FC<CreateWalletProps> = () => {

  const { state: { address } } = useMyAccount()
  const [apiOK, setApiOK] = useState(true); // toinit a first call
  const [d4rkExists, setD4rkExists] = useState(false);

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


  
// get user if is one
const checkUser = async (address: any) => {
  const data = await getUserExists(address)
   .then((data: any) => {
     if(data.message === 'Network Error') {
       setApiOK(false)
     }
     if(data == true) {
      setD4rkExists(true)
     }
     if(data.message === 'Request failed with status code 400') {
      setD4rkExists(false)
       }
  })
  .catch(error => { openNotification('Network error', 'D4RK API is unavailable. Please try again later.', 'bottomRight'); })
  .finally(() => {})
   //make sure to set it to false so the component is not in constant loading state
}



// useEffect
useEffect(() => {
    console.log('Watching address: ', address);
    console.log('Checking D4RK API connectivity...')
    checkAPI();
    if(apiOK) {
      console.log('Checking user for address...')
      checkUser(address);

    }
});;


// If API KO
if(!apiOK) {
  return (
    <Section className="d4rk-swap-desc">
<h5>D4RK API is unavailable at the moment.<br />Please try again later.</h5>
</Section>
  )
}


// ELSE OK
return (
<Section className="d4rk-swap-desc">
{d4rkExists ? 
 <ShowD4rkWallet />
: 
  <Button className="ant-btn ant-btn-primary">
   <Link href="d4rk/create">Create a D4RK account</Link>
  </Button>
}
</Section>
  )
}
