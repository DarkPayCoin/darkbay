import React from 'react';
import { Storefront } from '@darkpay/dark-types/substrate/interfaces';
import PrivateButton from '../utils/PrivateButton';
import { StorefrontUpdate, OptionOptionText, OptionIpfsContent, OptionBool } from '@darkpay/dark-types/substrate/classes';
import { Option } from '@polkadot/types'
import registry from '@darkpay/dark-types/substrate/registry';

type PrivateStorefrontButtonProps = {
  storefront: Storefront,
  asLink?: boolean
};

export function PrivateStorefrontButton (props: PrivateStorefrontButtonProps) {
  const { storefront } = props;
  const privateState = storefront.private.valueOf()

  const update = new StorefrontUpdate({
    handle: new OptionOptionText(),
    content: new OptionIpfsContent(),
    hidden: new OptionBool(),
    //private: new OptionBool(!private), // TODO has no implementation on UI
    permissions: new Option(registry, 'StorefrontPermissions')
  });

  const newTxParams = () => {
    return [ storefront.id, update ];
  };

  return <PrivateButton type='storefront' newTxParams={newTxParams} struct={storefront} {...props} />
}

export default PrivateStorefrontButton;
