import React, { useState } from 'react'
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import { Wallet } from './Wallet'
import { PageContent } from '../main/PageWrapper'
import HeadMeta from '../utils/HeadMeta'
import Section from '../utils/Section'
import { Row, Col, Form, InputNumber, Button } from 'antd'
import { SwapOutlined } from '@ant-design/icons'
import { SignInMobileStub } from '../auth/AuthButtons'
import AuthorizationPanel from '../auth/AuthorizationPanel'
import { isMobileDevice, LARGE_AVATAR_SIZE } from 'src/config/Size.config'
import { AccountId } from '@polkadot/types/interfaces';
import { AccountSelector } from '../profile-selector/AccountSelector'
import { ProfileData } from '@darkpay/dark-types'
import { isMyAddress } from '../auth/MyAccountContext'
import isEmpty from 'lodash.isempty'
import { getAccountId } from '../substrate'
import { getDarkdotApi } from '../utils/DarkdotConnect'
import { Balance } from '../profiles/address-views/utils/Balance'
import { Name } from '../profiles/address-views/Name'
import MyEntityLabel from '../utils/MyEntityLabel'
import { CopyAddress } from '../profiles/address-views/utils'
import { isEmptyStr } from '@darkpay/dark-utils'
import { DfForm } from '../forms'
import form from 'antd/lib/form'
import { Content } from '@darkpay/dark-types/substrate/interfaces'
import dynamic from 'next/dynamic'
import { ethers, logger } from 'ethers'
//import * as BWC from '@darkpay/bitcore-wallet-client';

const Client = require("@darkpay/bitcore-wallet-client");

var fs = require('fs');

let client = new Client({
  baseUrl: "http://bws.darkpay.market/bws/api",
  verbose: true,
  transports: ['polling']
});

client.createWallet("My Wallet", "Irene", 2, 2, {network: 'livenet'}, function(err: any, secret: string) {
  if (err) {
    console.log('****BWS*** error: ',err);
    return
  };
  // Handle err
  console.log('****BWS*** Wallet Created. Share this secret with your copayers: ' + secret);
  fs.writeFileSync('irene.dat', client.export());
});


function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider)
  library.pollingInterval = 12000
  return library
}

type FormValues = Partial<Content>

type FieldName = keyof FormValues

const fieldName = (name: FieldName): FieldName => name
const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false })


export type Props = {
  address: AccountId,
  owner?: ProfileData,
};

// useForm functional component
export const useForm = (callback: any, initialState = {}) => {
  const [values, setValues] = useState(initialState);

  // onChange
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...values, [event.target.name]:
        event.target.value
    });
  };

  // onSubmit
  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await callback(); // triggering the callback
  };

  // return values
  return {
    onChange,
    onSubmit,
    values,
  };


}




const AccountSwapPage = (props: Props) => {
  const {
    address,
    owner,
  } = props;

  const isMyAccount = isMyAddress(address);

  const noProfile = isEmpty(owner?.profile);
  const noAddress = isEmptyStr(address)

  const [direction, setDirection] = useState('');

  const handleClick = () => {
    direction ? setDirection('') : setDirection('erc20toDARK');
    console.log(direction)
  };

  const logoImg = '/DARK.svg'
  const logoERC20Img = '/DARK-ERC20.svg'

  const [qty = 1, setQty] = useState<string | number | undefined>()

  const onQtyChanged = (qty: string | number | undefined) => {
    // console.log('qty is ---> '+qty)
    setQty(qty)
  }


// Mint test
// const signer = (new ethers.providers.Web3Provider(window.ethereum)).getSigner();
// const contract = new ethers.Contract(address, ABI, signer);


  // TODO no DOT connection / address
  //  {noAddress && <h2>test no dot acc</h2>  }


  return (
    <Web3ReactProvider getLibrary={getLibrary}>

      <HeadMeta title="Swap" />

      <h1 className="PageTitle flex-center">Swap & Redeem</h1>

      <div id="SwapCard" className={`swapBox ${direction}`}>

        <div id="nativeSwap">
          <h3> <img src={logoImg} alt='Darkdot' />DARK</h3>


          {direction === 'erc20toDARK'
            ?
            <InputNumber
              name='DARK'
              min={1.00} max={1000.00}
              style={{
                width: 200,
              }}
              value={qty}
              step='1.00'
              // formatter={value => `▼ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              readOnly
            />

            :
            <InputNumber
              name='DARK'
              min={1.00} max={1000.00}
              style={{
                width: 200,
              }}
              defaultValue={0.00}
              step='1.00'
              // formatter={value => `▼ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              onChange={onQtyChanged}
            />
          }
          <Balance address={address} />
        </div>

        <div id="swapBtn">
          <SwapOutlined onClick={handleClick} />
        </div>

        <div id="ERC20Swap">
          <h3><img src={logoERC20Img} alt='Darkdot' />DARK</h3>

          {direction === 'erc20toDARK' ?
            <InputNumber
              name='DARKERC20'
              min={1.00} max={1000.00}
              style={{
                width: 200,
              }}
              defaultValue={0.00}
              onChange={onQtyChanged}
            // formatter={value => `▼ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />

            :
            <InputNumber
              name='DARKERC20'
              min={1.00} max={1000.00}
              style={{
                width: 200,
              }}
              value={qty}
              readOnly
            // formatter={value => `▼ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />

          }

          <Wallet />
        </div>


      </div>

      <Section className='fullFlex'>
        {direction === 'erc20toDARK'
          ?
          <div className="redeemButton">
            <Button size="large" type="primary">Redeem</Button> <br />
          </div>
          :
          <div className="swapButton">
            <Button size="large" type="primary">Swap</Button> <br />
          </div>
        }


      </Section>



    </Web3ReactProvider>
  )
}


AccountSwapPage.getInitialProps = async (props: { query: { address: any }; res: any }): Promise<any> => {
  const { query: { address }, res } = props;
  const darkdot = await getDarkdotApi()
  const { substrate } = darkdot
  const accountId = await getAccountId(address as string);

  if (!accountId && res) {
    res.statusCode = 404
    return { statusCode: 404 }
  }

  const addressStr = accountId as string

  const owner = await darkdot.findProfile(addressStr)

  return {
    address: accountId,
    owner,
  };
};




export default AccountSwapPage

function classNames(arg0: { "main-class": boolean; activeClass: any }): string | undefined {
  throw new Error('Function not implemented.')
}

