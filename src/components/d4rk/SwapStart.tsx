import React, {  } from 'react';
import Button from 'antd/lib/button';
import HeadMeta from 'src/components/utils/HeadMeta';
import { useMyAccount } from '../auth/MyAccountContext';
import { useAuth } from '../auth/AuthContext';
import Section from '../utils/Section';
import { CreateWallet } from './utils/CreateWallet';
import { Claimable } from './utils/Claimable';


type Props = {
  title?: string,
}

export const SwapStart = ({
  title = 'Get DARK tokens from legacy D4RK coin',

}: Props) => {

  const { openSignInModal, state: { completedSteps: { isSignedIn } } } = useAuth()
  const { state: { address } } = useMyAccount()




  return (
    <Section className="fullflex padded-top">
        <HeadMeta title={title} desc='Lock your D4RK coins and claim DARK (DOT) tokens.' />
        <h1 className='spaced-top text-centered'>{title}</h1>


        {isSignedIn && address
          ? 
          // <Section className='spaced-top text-centered'>
          //     DarkBay account: {address}
          // </Section>
          <Section className='d4rk-swap-container'>

            <Section className="d4rk-swap-box">
            <h2 className="d4rk-swap-h2">Send D4RK</h2>
            <p className='d4rk-swap-desc'>
              Fund your legacy D4RK coin wallet in DarkBay, then claim 1:1 DARK tokens.
            </p>
            <CreateWallet />

            </Section>
            <Section className="d4rk-swap-box">
            <h2 className="d4rk-swap-h2">Claim DARK</h2>
            <p className='d4rk-swap-desc'>
              After network confirmation, your claimable transactions and history will list here.
            </p>
            {/* <h3>{ address }</h3> */}
            <Claimable />
            </Section>
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