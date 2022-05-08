import React from 'react'
import QRCode from "react-qr-code";
import Button from 'antd/lib/button';
import HeadMeta from 'src/components/utils/HeadMeta';
import { PageContent } from '../main/PageWrapper';
import { Alert, List, Typography } from 'antd';

type Props = {
  title?: string,
  lockAddress?: string,
  data?: string[],
  qrFcolor?: string,
  qrBcolor?: string
}

export const SwapStart = ({
  title = 'Claim DARK (DOT) for legacy D4RK holders',
  lockAddress = 'DZHhbg1dYmcen7Z1yTvmEK1TXaiiPoeVmd',
  data = [
    'Be sure to use an address you own from desktop or mobile wallet (no third-party service).',
    'You will be asked to sign a message as a confirmation of address ownership.',
    'You must have a DARK (DOT) address to recieve your tokens',
  ],
  qrFcolor = '#fff',
  qrBcolor = 'transparent'

}: Props) => {
  return (
    <PageContent>
        <HeadMeta title={title} desc='Lock your D4RK coins and claim DARK (DOT) tokens.' />
        
        <h1 className='d-flex spaced-top justify-content-center'>{title}</h1>
        <div className='DfCard mt-12 text-centered'>
        <p>To get DARK (DOT) tokens from your legacy D4RK, send from <strong>one address you own</strong> to the lock vault account:</p>

      
        <p>After sending, please wait for usual 12 network confirmations before claiming.</p>  
        

       </div>
        <div className="justify-content-center d-flex padded-top">
            <Button type='primary' href='/d4rk/claim'>Claim DARK tokens</Button>
          </div>

    </PageContent>
  );
}

export default SwapStart;