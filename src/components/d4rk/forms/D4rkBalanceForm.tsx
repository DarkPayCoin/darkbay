import React, { useContext, useEffect, useState } from "react";
import { AnyAccountId } from '@darkpay/dark-types';
import D4rkServiceAPI from "../api/D4rkService"
import { useMyAccount, useMyAddress } from "src/components/auth/MyAccountContext";
import Link from "next/link";
import D4rkWalletForm from "../forms/D4rkWalletForm";
import Section from "src/components/utils/Section";
// import createLockTransaction from "./createLockTransaction";
import { Button, notification, Divider, Space, Form, Input, Modal, Radio, InputNumber, Spin, Select, Row, Col, Slider, Checkbox, Popover } from 'antd';
import type { NotificationPlacement } from 'antd/lib/notification';
import { useMutation } from "react-query";

import Router from 'next/router'
import axios from "axios";

import type { CheckboxChangeEvent } from 'antd/es/checkbox';



const openNotification = (message: string, description: string, placement: NotificationPlacement) => {
  notification.info({
    message: message,
    description:
      description,
    placement,
  });
};



async function createLockTransaction(amount: number, recipient: string): Promise<boolean> {
  try {
    const res = await D4rkServiceAPI.lockTx({amount: amount, recipient: recipient})
      console.log('@@@ LOCK TX ' + amount +' D4RK');
      console.log(res);
      openNotification('Transaction successfull','TxId: ' + res + '<br />After 12 network confirmations you can claim your tokens.', 'bottomRight');
      return true
  }
  catch(error) {
    console.log('@@@ ERROR LOCK TX ' + amount +' D4RK');
    console.log(error)
    openNotification('Transaction failed', error, 'bottomRight');
    return false
  }
}

async function getBalance(): Promise<string> {
  try {
    const response = await D4rkServiceAPI.d4rkBalance();
    const json = await response;
    // console.log(json);
      return (json.data)
  }
  catch(error) {
    console.log(error)
    return '-1.00'
  }
}


interface Values {
  amount: string;
}

interface TransactionCreateFormProps {
  visible: boolean;
  onCreate: (values: Values) => void;
  onCancel: () => void;
  balance: number;
}


const TransactionCreateForm: React.FC<TransactionCreateFormProps> = ({
  visible,
  onCreate,
  onCancel,
  balance,
}) => {
  const [form] = Form.useForm();
  const [inputValue, setInputValue] = useState(1);

  const [aggreeValue, setAgreeValue] = useState(false);


  const onChange = (newValue: number) => {
    setInputValue(newValue);
    console.log('newvalue: ' + newValue);
  };

  const onCheckChange = (e: CheckboxChangeEvent) => {
    setAgreeValue(e.target.checked);

    console.log(`checked = ${e.target.checked}`);
  };

const disclaimer = "THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE."

  return (
    <Modal
      visible={visible}
      title="Please choose an amount"
      okText="Send & Claim"
      okButtonProps={{ disabled: (!aggreeValue)  }}
      cancelText="Cancel"
      onCancel={onCancel}
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            form.resetFields();
            onCreate(values);
          })
          .catch(info => {
            console.log('Validate Failed:', info);
          });
      }}
    >
      <Form
        form={form}
        name="form_in_modal"
        initialValues={{ amount: 1 }}
        layout = {'horizontal'}      
         >
    <Row>
      <Col span="12">
      <Form.Item
            name="amount">
        <Slider
          min={1} max={balance > 0 ? balance-1 : 100}
          step={1}
          onChange={onChange}
          value={typeof inputValue === 'number' ? inputValue : 1}
        />
  </Form.Item>
      </Col>
      <Col>
           <InputNumber 
          min={1} max={balance > 0 ? balance-1 : 100}
          step={1}
          readOnly
          value={typeof inputValue === 'number' ? inputValue : 1}
        />

        </Col>
      <Col >
      <span>&nbsp;▼ D4RK (legacy)</span>
      
      </Col>
    </Row>
    <Row>
      <Form.Item
      name='ack' 
      style={{ margin: '20px 0' }}
      required={true}
      
      >
    <Checkbox value={aggreeValue} onChange={onCheckChange}>I agree using this as experimental software and i have&nbsp;
      <Popover content={disclaimer} title="Diclaimer">
      read the disclaimer.
        </Popover>
    </Checkbox>
    </Form.Item>
    </Row>

      </Form>
    </Modal>
  );
};

export const D4rkBalanceForm: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [txStatus, setTxStatus] = useState(false);
  const [d4rkBalance, setD4rkBalance] = useState('0.00');
  const [isLoading, setisLoading] = useState(false); //Set initial value to false to avoid your component in loading state if the first call fails
  const { state: { address } } = useMyAccount()

// get balance
  const fetchBalance = async () => {
    setisLoading(true) //set to true only when the api call is going to happen
    const data = await getBalance().then(data => {
      setD4rkBalance(data)
      // alert(data);
    })
    setisLoading(false); //make sure to set it to false so the component is not in constant loading state
  }

// create lock tx
  const onCreate = async (values: any) => {
    console.log('Received values of form: ', values);
    if(address) {
    try {
    const fakeRcpt = 'auto'
    const txSend = createLockTransaction(values.amount, fakeRcpt);
    setTxStatus(await txSend)
    setVisible(false);
    }
    catch(err) {
      console.log(err)
      openNotification('ERROR', err, 'bottomRight')
    }
  }
  };

  useEffect(() => {
    fetchBalance()
   .catch(console.error)

  }, [d4rkBalance]);


  if(isLoading){

        return   <Spin />
    }
    else if(isLoading === false){
        return (
      <Section className="darkwallet-child">
       <div className = "darkwallet-child padded-top">
          <h3>Balance 
          <pre>{d4rkBalance}  D4RK</pre></h3>
       </div>
       <div>
       <Button
         type="primary"
         onClick={() => {
           setVisible(true);
         }}
       >
         Claim DARK tokens
       </Button>
       <TransactionCreateForm
         visible={visible}
         onCreate={onCreate}
         onCancel={() => {
         setVisible(false);
         }}
         balance={parseFloat(d4rkBalance)}
       />
     </div>
     </Section>
        )
    }
    return <Spin />



};

export default D4rkBalanceForm;