import React from 'react';
import { useMyAddress } from './MyAccountContext';
import { MyAccountPopup } from '../profiles/address-views';
import { SignInButton } from './AuthButtons'
import { CheckoutButton } from 'src/components/cart/CheckoutWidget'


export const AuthorizationPanel = () => {
  const address = useMyAddress()
  return <>
    {address
      ? <>
        {
          <CheckoutButton>
            <a className='ui button primary'>
              Checkout
                    </a>
          </CheckoutButton>
        }
        <MyAccountPopup className='profileName' />
      </>
      : <SignInButton />
    }
  </>
}

export default AuthorizationPanel;
