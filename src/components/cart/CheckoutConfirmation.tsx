import React from 'react';
import { Result, Button } from 'antd';


type CheckoutConfirmationProps = {

}

export const CheckoutConfirmation = ({ }: CheckoutConfirmationProps) => {


 

    return (
        <>


            <Result
    status="success"
    title="Successfull Order"
    subTitle="Order number: # escrow locked, please wait for buyer to accept order and update its status."
    extra={[
      <Button type="primary" key="console">
        Go to orders page
      </Button>,
      <Button key="buy">Continue</Button>,
    ]}
  />,
       

        </>
    );
}

export default CheckoutConfirmation;

