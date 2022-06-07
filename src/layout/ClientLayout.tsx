import React from 'react';
import { DarkdotApiProvider } from '../components/utils/DarkdotApiContext';
import { MyAccountProvider } from '../components/auth/MyAccountContext';
import { Navigation } from './Navigation'
import SidebarCollapsedProvider from '../components/utils/SideBarCollapsedContext';
import { AuthProvider } from '../components/auth/AuthContext';
import { SubstrateProvider, SubstrateWebConsole } from '../components/substrate';
import { ResponsiveSizeProvider } from 'src/components/responsive';
// import { KusamaProvider } from 'src/components/kusama/KusamaContext';
// import { kusamaUrl } from 'src/components/utils/env';
import { CartProvider } from "react-use-cart";
import { CookiesProvider } from 'react-cookie';
import { QueryClient, QueryClientProvider } from "react-query";
// const queryClient = new QueryClient();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      staleTime: 5*60*1000,
    },
  },
});

const ClientLayout: React.FunctionComponent = ({ children }) => {
  return (
    <ResponsiveSizeProvider >
      <SidebarCollapsedProvider>
        <SubstrateProvider>
          {/* <KusamaProvider endpoint={kusamaUrl}> */}
          <SubstrateWebConsole />
          <DarkdotApiProvider>
            <MyAccountProvider>
              <AuthProvider>
                <CartProvider>
                 <CookiesProvider>
                 <QueryClientProvider client={queryClient}>
                 <Navigation>
                  {children}
                 </Navigation>
                 </QueryClientProvider>
                 </CookiesProvider>
                </CartProvider>
              </AuthProvider>
            </MyAccountProvider>
          </DarkdotApiProvider>
          {/* </KusamaProvider> */}
        </SubstrateProvider>
      </SidebarCollapsedProvider>
    </ResponsiveSizeProvider>
  )
};

export default ClientLayout;
