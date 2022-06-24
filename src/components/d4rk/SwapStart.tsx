import React, { useState } from 'react';
import Button from 'antd/lib/button';
import HeadMeta from 'src/components/utils/HeadMeta';
import { useMyAccount } from '../auth/MyAccountContext';
import { useAuth } from '../auth/AuthContext';
import Section from '../utils/Section';
import { CreateWallet } from './utils/CreateWallet';
import { Claimable } from './utils/Claimable';
import useDarkdotEffect from '../api/useDarkdotEffect'
import Icon, { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import { Descriptions, Space } from 'antd';
import { IconWithLabel } from '../utils';


type Props = {
  title?: string,
}

export const SwapStart = ({
  title = 'Get DARK tokens from legacy D4RK coin',

}: Props) => {

  const { openSignInModal, state: { completedSteps: { isSignedIn } } } = useAuth()
  const { state: { address } } = useMyAccount()
  const [swapStatus, setSwapStatus] = useState(false); // toinit a first call
  const [minAllowed, setMinallowed] = useState(); // toinit a first call
  const [maxAllowed, setMaxallowed] = useState(); // toinit a first call


  useDarkdotEffect(({ substrate }) => {
    const load = async () => {
      const api = await substrate.api
      const swapStatus = await api.query.swap.swapSettingsGlobal()
      const swapStatusJson = JSON.parse(JSON.stringify(swapStatus))
      console.warn(swapStatusJson)
      setSwapStatus(swapStatusJson['swaps_allowed'])
      setMinallowed(swapStatusJson['min_amount'])
      setMaxallowed(swapStatusJson['max_amount'])

      // console.warn(swapStatusJson['swaps_allowed'])
    }
    load()
  }, [])

  return (
    <Section className="fullflex padded-top">
        <HeadMeta title={title} desc='Lock your D4RK coins and claim DARK (DOT) tokens.' />
        <h1 className='spaced-top text-centered'>{title}</h1>

        <Descriptions className="d4rk-swap-box spaced-top text-centered" title="D4RK Bridge Status">
        <Descriptions.Item label="State">
          {
            swapStatus == true 
            ? 
            <IconWithLabel icon={<CheckCircleTwoTone twoToneColor="#52c41a"  />} label="OK" />
            :
            // <p><Icon type="close-circle" color="#eb2f96"  /> test</p>
            <IconWithLabel icon={<CloseCircleTwoTone twoToneColor="#eb2f96" />} label="Disabled" />    
          }
    </Descriptions.Item>
    <Descriptions.Item label="Min. Amount">{Number(minAllowed)}</Descriptions.Item>
    <Descriptions.Item label="Max. Amount">{Number(maxAllowed)}</Descriptions.Item>
    <Descriptions.Item label="D4RK API"><IconWithLabel icon={<CheckCircleTwoTone twoToneColor="#52c41a"  />} label="OK" /></Descriptions.Item>
    <Descriptions.Item label="DARK claims">{Number(minAllowed)}</Descriptions.Item>
    <Descriptions.Item label="D4RK locked">{Number(maxAllowed)}</Descriptions.Item>
  </Descriptions>

        {/* <Section className="spaced-top text-centered">
          <h2>D4RK Bridge Status</h2>
          <Section>
          <h3> {
          swapStatus == true 
          ? 
          <IconWithLabel icon={<CheckCircleTwoTone twoToneColor="#52c41a"  />} label="OK" />
          :
          // <p><Icon type="close-circle" color="#eb2f96"  /> test</p>
          <IconWithLabel icon={<CloseCircleTwoTone twoToneColor="#eb2f96" />} label="Disabled" />

        
        }</h3>
          </Section>
          <Section>
          <h3>Min amount: {Number(minAllowed)}</h3>
          </Section>
          <Section>
          <h3>Max amount: {Number(maxAllowed)}</h3>
          </Section>
       </Section> */}


        {isSignedIn && address
          ? 
          // <Section className='spaced-top text-centered'>
          //     DarkBay account: {address}
          // </Section>
          
          <Section className='d4rk-swap-container'>

            {swapStatus ? 
            <Section className="d4rk-swap-box">
            
            <h2 className="d4rk-swap-h2">Send D4RK</h2>
            <p className='d4rk-swap-desc'>
              Fund your legacy D4RK coin wallet in DarkBay, then claim 1:1 DARK tokens.
            </p>
            <CreateWallet />
            </Section>
            : 
            <Section className="d4rk-swap-box">
            <h2 className="d4rk-swap-h2">Send D4RK</h2>
            <p className='d4rk-swap-desc'>
              D4RK bridge is not available at the moment.
            </p>
            </Section>
            }

            {swapStatus ? 
            <Section className="d4rk-swap-box">
            <h2 className="d4rk-swap-h2">Claim DARK</h2>
            <p className='d4rk-swap-desc'>
              After network confirmation, your claimable transactions and history will list here.
            </p>
            <Claimable />
            </Section>
            : 
            <Section className="d4rk-swap-box">
            <h2 className="d4rk-swap-h2">Claim DARK</h2>
            <p className='d4rk-swap-desc'>
              D4RK bridge is not available at the moment.
            </p>
          </Section>
 }


          </Section>


          :
          <Section className="spaced-top text-centered">
            <h3>Please sign in to associate a legacy D4RK address to your DarkBay account.</h3>
          <Button 
          className='ant-btn ant-btn-primary addtocart'
          onClick={() =>  openSignInModal('AuthRequired')}
          shape="round"
          size="large"
          >
          Sign in
          </Button>
          </Section>
          }


       </Section>


  );
}







export default SwapStart;