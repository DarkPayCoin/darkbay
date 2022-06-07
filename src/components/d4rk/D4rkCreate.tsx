import React, {  } from 'react';
import Button from 'antd/lib/button';
import HeadMeta from 'src/components/utils/HeadMeta';
import { PageContent } from '../main/PageWrapper';
import { useMyAddress } from '../auth/MyAccountContext';
import { useAuth } from '../auth/AuthContext';
import D4rkCreateForm from './forms/D4rkCreateForm'



type Props = {
  title?: string,
  address?: string,
  exists?: boolean
}


export const D4rkCreate = ({
  title = 'Create and link a D4RK account',
  address = useMyAddress()

}: Props) => {

  const { openSignInModal, state: { completedSteps: { isSignedIn } } } = useAuth()
 
 


  return (
    <PageContent>
        <HeadMeta title={title} desc='Lock your D4RK coins and claim DARK (DOT) tokens.' />
        
        <h1 className='spaced-top justify-content-center'>{title}</h1>

        <div className='fullFlex text-centered'>
        

        {isSignedIn && address
          ? 
        <D4rkCreateForm address={address} />

          :
          <div className="padded-top">
            <h3>Please sign in to associate a legacy D4RK address to your DarkBay account.</h3>
          <Button 
          className='ant-btn ant-btn-primary addtocart'
          onClick={() =>  openSignInModal('AuthRequired')}
          shape="round"
          size="large"
          >
          Sign in
          </Button>
          </div>
          }

       </div>

    </PageContent>
  );
}







export default D4rkCreate;