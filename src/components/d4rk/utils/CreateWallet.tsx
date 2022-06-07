import React, { useEffect, useState } from "react";
import { AnyAccountId } from '@darkpay/dark-types';
import D4rkServiceAPI from "../api/D4rkService"
import { useMyAccount } from "src/components/auth/MyAccountContext";
import { Button } from "antd";
import Link from "next/link";
import D4rkWalletForm from "../forms/D4rkWalletForm";
import Section from "src/components/utils/Section";
import D4rkBalanceForm from "../forms/D4rkBalanceForm";
import { ShowD4rkWallet } from "./ShowD4rkWallet";



type CreateWalletProps = {
    
  }



  export const CreateWallet : React.FC<CreateWalletProps> = () => {
    const { setAddress, state: { address } } = useMyAccount()

    const [d4rkExists, setD4rkExists] = useState(false);

    // const Dotaddrr = { address }
  
    const checkExists = async (Dotaddrr: any) => {

        try {
            const res = await D4rkServiceAPI.userExists(
                    {
                      username: Dotaddrr
                    });
                console.log(res.msg);
                setD4rkExists(true);
          } catch (error) {
            console.error(error);
            setD4rkExists(false);
          }
      }
      



useEffect(() => {
    console.log('Watching address: ', address);
    checkExists(address);
  }, [address]);
  
   if (!d4rkExists) return (
//    <span>Please create a D4RK wallet</span>
<p className="d4rk-swap-desc">
<Button className="antd-btn">
   <Link href="d4rk/create">Create a D4RK account</Link>
</Button>
</p>
   );
  
return (
<Section>
{/* <D4rkWalletForm />
<D4rkBalanceForm /> */}
<ShowD4rkWallet />
</Section>

)

    // return <span>
      
    //   Test : {d4rkExists.toString()} for {address}

    // </span>
    
  }
  