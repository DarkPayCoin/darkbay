import React from 'react';
import { registerDarkdotTypes } from '../components/types';
import ClientLayout from './ClientLayout';
import { WhereAmIPanel } from 'src/components/utils/WhereAmIPanel'

const Page: React.FunctionComponent = ({ children }) => <>
    <div className='mb-3'>{children}</div>
    <WhereAmIPanel />
  </>

const NextLayout: React.FunctionComponent = (props) => {
  registerDarkdotTypes();

  return <ClientLayout>
    <Page {...props} />
  </ClientLayout>;
};

export default NextLayout;
