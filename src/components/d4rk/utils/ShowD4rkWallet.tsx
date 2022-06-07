import React, { useContext, useEffect, useState } from "react";
import { AnyAccountId } from '@darkpay/dark-types';
import D4rkServiceAPI from "../api/D4rkService"
import { useMyAccount, useMyAddress } from "src/components/auth/MyAccountContext";
import Link from "next/link";
import D4rkWalletForm from "../forms/D4rkWalletForm";
import Section from "src/components/utils/Section";
import D4rkBalanceForm from "../forms/D4rkBalanceForm";
// import UnlockD4rkWallet from "./UnlockD4rkWallet";
import { Button, notification, Divider, Space, Form, Input, Modal, Radio } from 'antd';
import type { NotificationPlacement } from 'antd/lib/notification';
import { useMutation } from "react-query";

import Router from 'next/router'


const openNotification = (message: string, description: string, placement: NotificationPlacement) => {
  notification.info({
    message: message,
    description:
      description,
    placement,
  });
};


async function unlockD4rkWallet(username: string, password: string): Promise<boolean> {
  try {
    const res = await D4rkServiceAPI.loginAccount(
      {
        username: username,
        password: password
      });
      console.log('@@@ LOGIN user ' + username);
      console.log(res);
      openNotification('D4RK wallet unlocked','Never give your password to anyone!','bottomRight');
      return true
  }
  catch(error) {
    console.log('@@@ ERROR LOGIN user ' + username);
    console.log(error)
    openNotification('Wrong credentials','Please check your password and try again.','bottomRight');
    return false
  }
}

async function checkIfLoggedInAndSameUser(address?: string): Promise<boolean> {
  console.log(address)
  try {
    const res = await D4rkServiceAPI.d4rkAddress();
       console.log('******* checkUnlocked *********');
       console.log('checkIfLoggedInAndSameUser' + res.msg);
       console.log('Checking if same than storage...');
       const sameUser = checkSameUser(address);
       return(sameUser);

  } catch (error) {
    console.log('******* checkUnlocked *********');
     console.error('checkIfLoggedInAndSameUser' + error);
     openNotification('D4RK wallet locked','Please unlock your D4RK wallet','bottomRight');
     return(false);
  }
}

function checkSameUser(address?: string): boolean {
  try {
      const user = localStorage.getItem("darkuser");
      if (typeof user === 'string') {
          const parse = JSON.parse(user) // ok
          if (user && parse.username) {
              console.log(parse.username + ' ---- ' + address)

              if(parse.username == address) {
                  return(true);
              }
              else { 
                  localStorage.removeItem("darkuser");
                  return(false)
              }
          }
          else {
              localStorage.removeItem("darkuser");
              return(false);
          }
      } 
    } catch (error) {
      console.error(error);
      localStorage.removeItem("darkuser");
      openNotification('D4RK wallet locked (API ERR)','Please unlock your D4RK wallet','bottomRight');
      return(false)
    }
    return(false)

}


interface Values {
  username: string;
  password: string;
}

interface CollectionCreateFormProps {
  visible: boolean;
  onCreate: (values: Values) => void;
  onCancel: () => void;
}

const CollectionCreateForm: React.FC<CollectionCreateFormProps> = ({
  visible,
  onCreate,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const { setAddress, state: { address } } = useMyAccount()
  return (
    <Modal
      visible={visible}
      title="Please enter your password to unlock D4RK wallet"
      okText="Unlock"
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
        layout="vertical"
        name="form_in_modal"
        initialValues={{ username: address }}
      >
      <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username!' }]}
            hidden
          >
            <Input
              //placeholder={address}
              //defaultValue={address}
              value={address}
              readOnly
              hidden
            />
          </Form.Item>
  
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be minimum 8 characters.' }
            ]}
  
          >
            <Input.Password
            />
          </Form.Item>

      </Form>
    </Modal>
  );
};

export const ShowD4rkWallet: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const { setAddress, state: { address } } = useMyAccount()
  const [d4rkUnlocked, setD4rkUnlocked] = useState(false);


  const onCreate = async (values: any) => {
    console.log('Received values of form: ', values);
    const unlockSuccess = unlockD4rkWallet(values.username, values.password);
    setD4rkUnlocked(await unlockSuccess)
    setVisible(false);
  };

  useEffect(() => {
    console.log('Watching address: ', address);
    checkIfLoggedInAndSameUser(address).then(result => {
      setD4rkUnlocked(result);
      console.log('useEffect says checkIfLoggedInAndSameUser : '+result)
   })
   .catch(console.error)

  }, [address]);


  return (
    <Section>
      {d4rkUnlocked ?
      <Section>
        <D4rkWalletForm />
        <D4rkBalanceForm />
      </Section>
       : 
       <Section className="darkwallet-child">
       <div>
       <Button
         type="primary"
         onClick={() => {
           setVisible(true);
         }}
       >
         Unlock D4RK wallet
       </Button>
       <CollectionCreateForm
         visible={visible}
         onCreate={onCreate}
         onCancel={() => {
         setVisible(false);
         }}
       />
     </div>
     </Section>
       }
    </Section>

  );
};

export default ShowD4rkWallet;