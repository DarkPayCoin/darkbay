import React from 'react';
import { Storefront } from '@darkpay/dark-types/substrate/interfaces';
import HiddenButton from '../utils/HiddenButton';
import { StorefrontUpdate, OptionOptionText, OptionIpfsContent, OptionBool } from '@darkpay/dark-types/substrate/classes';
import { Option } from '@polkadot/types'
import registry from '@darkpay/dark-types/substrate/registry';

type HiddenStorefrontButtonProps = {
  storefront: Storefront,
  asLink?: boolean
};

export function HiddenStorefrontButton (props: HiddenStorefrontButtonProps) {
  const { storefront } = props;
  const hidden = storefront.hidden.valueOf()

  const update = new StorefrontUpdate({
    parent_id: new Option(registry, 'StorefrontId'),
    handle: new OptionOptionText(),
    content: new OptionIpfsContent(),
    hidden: new OptionBool(!hidden), // TODO has no implementation on UI
    permissions: new Option(registry, 'StorefrontPermissions')
  });

  const newTxParams = () => {
    return [ storefront.id, update ];
  };

  return <HiddenButton type='storefront' newTxParams={newTxParams} struct={storefront} {...props} />
}

export default HiddenStorefrontButton;
